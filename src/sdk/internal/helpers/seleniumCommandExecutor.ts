// Copyright 2021 TestProject (https://testproject.io)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Executor } from 'selenium-webdriver/http';
import { Capabilities, Command, Session } from 'selenium-webdriver';

import { get as stackTraceGet } from 'stack-trace';
import { cloneDeep } from 'lodash';
import sleep from 'sleep-promise';

import CustomHttpClient from './customHttpClient';
import AgentClient from '../agent/agentClient';
import Reporter from '../../reporter/reporter';
import ReportHelper from './reportHelper';
import StepSettings from '../../../classes/stepSettings';
import DriverCommandReport from '../../../rest/messages/driverCommandReport';
import TakeScreenshotConditionType from '../../../enums/screenshotConditionType';
import logger from '../../../logger/logger';
import CustomTestReport from '../../../rest/messages/customTestReport';
import TestProjectCapabilities from './customCapabilities';
import SleepTimingType from '../../../enums/sleepTimingType';
import { SeleniumHelper, SeleniumCommandName } from './seleniumHelper';

// eslint-disable-next-line import/no-cycle
import RedactHelper from './redactHelper';

/**
 * Extension of the Selenium Connection (command_executor) class.
 *
 * @property {AgentClient} agentClient Client used to communicate with the TestProject Agent
 * @property {boolean} disableAutoTestReports True if automatic reporting of tests is disabled, false otherwise
 * @property {boolean} disableCommandReports True if automatic reporting of tests is disabled, false otherwise
 * @property {boolean} disableReports True if all reporting is disabled, False otherwise
 * @property {string} driverSessionId The session id of the driver created by the Agent
 * @property {CustomHttpClient} httpClient Custom http client that extends from Selenium HttpClient
 * @property {string} latestKnownTestName Contains latest known test name
 * @property {Array<string>} excludedTestNames Contains a list of test names that should not be reported
 * @property {boolean} disableRedaction True if reporting steps should be redacted, False otherwise
 * @property {boolean} isWebdriverWait If the command is executed as part of a wait loop, we don't want to report it every time
 * @property {StepSettings} settings Contains current StepSettings
 * @property {DriverCommandReport} stashedCommand Contains stashed driver commands
 * @property {boolean} w3c True if Dialect W3C, False otherwise
 */
export default class CustomHttpCommandExecutor extends Executor {
  public readonly agentClient: AgentClient;

  public readonly reporter: Reporter;

  private driverSessionId: string;

  private httpClient: CustomHttpClient;

  private latestKnownTestName: string;

  private excludedTestNames: Array<string>;

  private disableRedaction: boolean;

  private isWebdriverWait: boolean;

  private settings: StepSettings;

  private stashedCommand?: DriverCommandReport;

  private w3c: boolean;

  /**
   * List of commands that should not be reported
   */
  private static readonly NON_REPORTED_COMMANDS = [
    SeleniumCommandName.NEW_SESSION,
    SeleniumCommandName.QUIT,
    SeleniumCommandName.SET_TIMEOUT,
  ];

  constructor(capabilities: Capabilities) {
    const httpClient = new CustomHttpClient();
    super(httpClient);

    this.agentClient = new AgentClient(capabilities);
    this.reporter = new Reporter(this.agentClient, this.getScreenshot.bind(this));
    if (capabilities.get(TestProjectCapabilities.DISABLE_REPORTS) as boolean) {
      this.reporter.disableReports = true;
    }

    this.httpClient = httpClient;
    this.driverSessionId = '';
    this.latestKnownTestName = '';
    this.excludedTestNames = [];
    this.disableRedaction = false;
    this.isWebdriverWait = false;
    this.settings = new StepSettings();
    this.w3c = true;
  }

  /**
   * Override the Selenium execute method.
   *
   * @param {Command} command The driver command to execute
   * @param {boolean} skipReporting Skip reporting the command
   *
   * @returns {Promise<unknown>} Command response
   */
  async execute(command: Command, skipReporting = false): Promise<unknown> {
    const cmdName = command.getName();

    // Create new session
    if (cmdName === SeleniumCommandName.NEW_SESSION) {
      const agentResponse = await this.agentClient.startSession();
      logger.debug(`WebDriver Address: ${agentResponse.serverAddress}`);

      // Update the address of the selenium server
      this.httpClient.setDriverAddr(agentResponse.serverAddress);

      this.driverSessionId = agentResponse.sessionId;

      this.w3c = agentResponse.dialect === 'W3C';

      // Reconstruct and return the session object
      return new Session(agentResponse.sessionId, agentResponse.capabilities);
    }

    // Report the test and terminate the session
    if (cmdName === SeleniumCommandName.QUIT) {
      if (!this.reporter.disableTestAutoReports) {
        this.reportTest();
      }
      super.execute(command) as unknown;

      await this.agentClient.quitSession();

      // This ensures that the actual driver.quit() command is not included in the report
      return Promise.resolve();
    }

    // If the name of the test changed, report the previous test to start a new one in the report
    const currentTestName = ReportHelper.inferTestName();
    if (
      !this.reporter.disableTestAutoReports &&
      this.latestKnownTestName.length > 0 &&
      this.latestKnownTestName !== currentTestName
    ) {
      this.reportTest();
    }
    this.latestKnownTestName = currentTestName;

    // Handling time out before execution
    await this.handleTimeOut(this.settings?.timeout, this.sessionId ?? '');

    // Handling sleep before execution
    await CustomHttpCommandExecutor.handleSleep(this.settings.sleepTimingType, this.settings.sleepTime, command);

    let response: unknown;
    const copiedCommand = cloneDeep(command);

    // Should the current command be automatically reported?
    const autoCommandReport =
      !skipReporting && CustomHttpCommandExecutor.NON_REPORTED_COMMANDS.indexOf(command.getName()) === -1;

    try {
      // Execute the selenium command
      response = await super.execute(command);
    } catch (error) {
      // logger.error(error instanceof Error ? error.message : '');

      // Report the failed command
      if (autoCommandReport) {
        await this.reportCommand(copiedCommand, response, false);
      }

      // Rethrow the error
      throw error;
    }

    // Handling sleep after execution
    await CustomHttpCommandExecutor.handleSleep(this.settings.sleepTimingType, this.settings.sleepTime, copiedCommand);

    // Report the command
    if (autoCommandReport) {
      await this.reportCommand(copiedCommand, response, true);
    }

    return response;
  }

  /**
   * Update current test name.
   */
  public updateKnownTestName(): void {
    const currentTestName = ReportHelper.inferTestName();
    this.latestKnownTestName = currentTestName;
  }

  /**
   * Reports a driver command to the TestProject platform.
   *
   * @param {Command} command - The driver command to execute
   * @param {unknown} result - The response returned by the Selenium remote webdriver server
   * @param {boolean} passed - True if the command execution was successful, False otherwise
   *
   * @returns {Promise<void>}
   */
  public async reportCommand(command: Command, result: unknown, passed: boolean): Promise<void> {
    if (!this.disableRedaction) {
      const newParameters = await new RedactHelper(this).redactCommand(command);
      command.setParameters(newParameters);
    }

    // If the command is executed as part of a wait loop, we don't want to report it every time
    this.isWebdriverWait = false;

    // Get the call stack list
    const callStackList = stackTraceGet();

    callStackList.forEach((file) => {
      if (file?.getFileName()?.includes('wait')) {
        this.isWebdriverWait = true;
      }
    });

    // Invert result is set?
    const testPassed = this.settings.invertResult ? !passed : passed;

    const driverCommandReport: DriverCommandReport = new DriverCommandReport(command, result, testPassed);

    // Is screenshot needed?
    let takeScreenshot = false;
    if (this.settings.screenshotCondition === TakeScreenshotConditionType.Failure && !passed) {
      takeScreenshot = true;
    } else if (this.settings.screenshotCondition === TakeScreenshotConditionType.Success && passed) {
      takeScreenshot = true;
    } else if (this.settings.screenshotCondition === TakeScreenshotConditionType.Always) {
      takeScreenshot = true;
    }

    if (takeScreenshot) {
      // TODO: ???
      // driverCommandReport.ScreenShot = await this.CreateScreenshot();
    }

    if (this.isWebdriverWait) {
      if (!this.reporter.disableReports && !this.reporter.disableCommandReports) {
        // Only stash the command for reporting later when driver command reporting is enabled
        this.stashedCommand = driverCommandReport;
      }

      // Do not report the command right away
      return;
    }

    if (!this.reporter.disableReports && !this.reporter.disableCommandReports) {
      if (this.stashedCommand) {
        // report the stashed command and clear it
        this.agentClient.reportDriverCommand(this.stashedCommand);

        this.stashedCommand = undefined;
      }
      // report the current command
      this.agentClient.reportDriverCommand(driverCommandReport);
    }
  }

  /**
   * Sends a test report to the Agent if this option is not explicitly disabled.
   */
  public reportTest(): void {
    if (this.latestKnownTestName !== 'Unnamed Test') {
      // only report those tests that have been identified as one when their names were inferred
      if (this.reporter.disableReports) {
        // test reporting has been disabled by the user
        logger.debug(`Test ${this.latestKnownTestName} - [Passed]`);
        return;
      }

      if (this.excludedTestNames.includes(this.latestKnownTestName)) {
        // test has been marked as 'to be excluded, so do not report it
        logger.debug(`Test ${this.latestKnownTestName} - Reporting skipped (marked as 'To be excluded'`);
        return;
      }

      this.agentClient.reportTest(new CustomTestReport(this.latestKnownTestName, true));
    }
  }

  /**
   * Creates a screenshot (PNG) and returns it as a base64 encoded string.
   *
   * @returns {Promise<string>}
   */
  private async getScreenshot(): Promise<string> {
    const command = SeleniumHelper.buildSeleniumCommand(SeleniumCommandName.SCREENSHOT);
    command.setParameter('sessionId', this.agentClient.agentSession.sessionId);

    return this.execute(command, true) as Promise<string>;
  }

  /**
   * Handle X kind of timeout commands.
   *
   * @param {number} timeout - The amount of time to be set for timeout
   * @param {string} sessionId - The current Agent session id
   */
  private async handleTimeOut(timeout: number, sessionId: string): Promise<void> {
    if (timeout > 0) {
      const command = this.w3c
        ? SeleniumHelper.buildSeleniumCommand(SeleniumCommandName.SET_TIMEOUT).setParameter('implicit', timeout)
        : SeleniumHelper.buildSeleniumCommand(SeleniumCommandName.IMPLICITLY_WAIT).setParameter('ms', timeout);

      command.setParameter('sessionId', sessionId);

      await super.execute(command);
    }
  }

  /**
   * Handles step sleep before/after step execution.
   *
   * @param {SleepTimingType} sleep_timing_type None, Inherit, Before
   * @param {number} sleep_time sleep time in milliseconds
   * @param {Command} command Command for checking is not quit
   * @param {boolean} step_executed True for after step execution of false for before
   *
   * @returns {Promise<void>}
   */
  static async handleSleep(
    sleep_timing_type: SleepTimingType,
    sleep_time: number,
    command: Command,
    step_executed = false
  ): Promise<void> {
    // Sleep Before if not Quit command
    if (command.getName() !== SeleniumCommandName.QUIT) {
      if (sleep_timing_type !== SleepTimingType.None) {
        const sleepTimingTypeCondition = step_executed ? SleepTimingType.After : SleepTimingType.Before;
        if (sleep_timing_type === sleepTimingTypeCondition) {
          logger.debug(`Step is designed to sleep for ${sleep_time} milliseconds`);
          logger.debug(`${sleep_timing_type} execution.`);
          await sleep(sleep_time);
        }
      }
    }
  }

  /**
   * Getter for the session id.
   *
   * @returns {string}
   */
  public get sessionId(): string {
    return this.driverSessionId;
  }
}
