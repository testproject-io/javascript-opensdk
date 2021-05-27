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

import { error } from 'selenium-webdriver';
import { Client } from 'webdriver';

import DriverCommandReport from '../../../rest/messages/driverCommandReport';
import AgentClient from '../agent/agentClient';
import Reporter from '../../reporter/reporter';

import { SeleniumCommandName, SeleniumHelper } from './seleniumHelper';
import ReportHelper from './reportHelper';

// Commands that should not be reported
const NON_REPORTED_COMMANDS = ['setImplicitTimeout'];

// WebDriver to Selenium command mapping
const WEBDRIVER_TO_SELENIUM_COMMAND = new Map<string, string>([['takeScreenshot', SeleniumCommandName.SCREENSHOT]]);

/**
 * Mobile commands custom reporter.
 */
export default class MobileCommandsReporter {
  /**
   * WebDriver Client instance.
   */
  private driverClient?: Client;

  /**
   * Last known test name.
   */
  private latestKnownTestName = '';

  /**
   * Flag for marking whether the next reported driver command should be skipped.
   */
  private skipDriverCommandReporting = false;

  /**
   * Constructor.
   *
   * @param {AgentClient} agentClient AgentClient class instance.
   * @param {Reporter} reporter TestProject Reporter class instance.
   */
  constructor(private agentClient: AgentClient, private reporter: Reporter) {}

  /**
   * driverClient setter method.
   *
   * @param {Client} driverClient WebDriver Client instance.
   */
  public setDriverClient(driverClient: Client): void {
    this.driverClient = driverClient;
  }

  /**
   * Report an error returned by a driver command.
   *
   * @param {string} commandName The name of the command.
   * @param data Custom data returned by the command.
   *
   * @returns {Error | null} A new Error() object or null if no error was found.
   */
  private async reportError(
    commandName: string,
    data: { body: unknown; result: { value: unknown } }
  ): Promise<Error | null> {
    // eslint-disable-next-line
    const isError = (data.result.value as any)?.hasOwnProperty('error');

    if (!isError) {
      return null;
    }

    // Build Selenium command and set parameters
    const driverCommand = SeleniumHelper.buildSeleniumCommand(commandName);
    driverCommand.setParameters(data.body);

    const errObj = data.result.value as { error: string; message: string; stacktrace: string };

    let expObj: Error;
    let errMsg: string;

    switch (errObj.error) {
      case 'no such element':
        errMsg = `${errObj.message}: ${JSON.stringify(data.body)}`;
        expObj = new error.NoSuchElementError(errMsg);
        break;
      default:
        errMsg = errObj.message;
        expObj = new Error(errMsg);
    }

    // Skip the next command reporting as it'll be the screenshot we're about to take
    this.skipDriverCommandReporting = true;

    try {
      const screenshot = await this.driverClient?.takeScreenshot();
      const driverCommandReport = new DriverCommandReport(driverCommand, errMsg, false, screenshot);
      this.agentClient.reportDriverCommand(driverCommandReport);
    } catch (err) {
      // Do nothing
    }

    // Re-enable commands reporting
    this.skipDriverCommandReporting = false;

    return expObj;
  }

  /**
   * Report driver command.
   *
   * @param {string} commandName The name of the command.
   * @param data Custom command data.
   * @param resolve Promise resolve callback function.
   * @param reject Promise reject callback function.
   */
  public async reportDriverCommand(
    commandName: string,
    data: { body: unknown; result: { value: unknown } },
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void
  ): Promise<void> {
    // On request, skip reporting the current command
    if (this.skipDriverCommandReporting || this.reporter.disableReports || this.reporter.disableCommandReports) {
      resolve(null);
      return;
    }

    // Check for non-reported commands
    if (NON_REPORTED_COMMANDS.indexOf(commandName) > -1) {
      resolve(null);
      return;
    }

    // Check and report errors
    const errObj = await this.reportError(commandName, data);
    if (errObj) {
      reject(errObj);
      return;
    }

    const commandParams = data.body;
    const commandResult = data.result.value;

    // Convert WebDriver commands to Selenium commands
    const seleniumCommandName = WEBDRIVER_TO_SELENIUM_COMMAND.get(commandName) || commandName;

    // Build Selenium command and set parameters
    const driverCommand = SeleniumHelper.buildSeleniumCommand(seleniumCommandName);
    driverCommand.setParameters(commandParams);

    const driverCommandReport = new DriverCommandReport(driverCommand, commandResult, true);
    this.agentClient.reportDriverCommand(driverCommandReport);

    resolve(driverCommandReport);
  }

  /**
   * Report an element specific command.
   *
   * @param {string} commandName The name of the command.
   * @param data Custom command data.
   * @param elementId ID of the element the command executing on.
   * @param resolve Promise resolve callback function.
   * @param reject Promise reject callback function.
   */
  public async reportElementCommand(
    commandName: string,
    data: { body: unknown; result: { value: unknown } },
    elementId: string,
    resolve: (value: unknown) => void,
    reject: (value: unknown) => void
  ): Promise<void> {
    // Do nothing is command reporting is disabled
    if (this.reporter.disableReports || this.reporter.disableCommandReports) {
      resolve(null);
      return;
    }

    // Check and report errors
    const errObj = await this.reportError(commandName, data);
    if (errObj) {
      reject(errObj);
      return;
    }

    // Build a new driver command object
    const driverCommand = SeleniumHelper.buildSeleniumCommand(commandName);

    // Add command parameters
    if (commandName === SeleniumCommandName.SEND_KEYS_TO_ELEMENT) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      driverCommand.setParameter('value', (data.body as any).text);
    } else {
      driverCommand.setParameters(data.body);
    }

    // Add the element ID to the reported command
    driverCommand.setParameter('id', elementId);

    // Report the command
    const driverCommandReport = new DriverCommandReport(driverCommand, data.result.value, true);
    this.agentClient.reportDriverCommand(driverCommandReport);

    resolve(driverCommandReport);
  }

  /**
   * Finalize the current test repo.
   * This method validates that automatic reports are enabled and tries to detect when a tests ends a new one starts.
   *
   * @param {boolean} force Finalize even if the test name hasn't changed.
   */
  public reportTest(force = false): void {
    // If the name of the test changed, report the previous test to start a new one in the report
    const currentTestName = ReportHelper.inferTestName();
    if (
      !this.reporter.disableTestAutoReports &&
      ((this.latestKnownTestName.length > 0 && this.latestKnownTestName !== currentTestName) || force)
    ) {
      // Report the test
      this.reporter.test(this.latestKnownTestName, true);
    }
    this.latestKnownTestName = currentTestName;
  }

  /**
   * Driver command function wrapper.
   * This method generates a wrapper function that handles the execution and reporting of the WebDriver command.
   *
   * @param {string} commandName The name of the command.
   * @param {Function} fn The original WebDriver command.
   *
   * @returns {Function} Wrapping function instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public reportDriverCommandWrapper(commandName: string, fn: Function): Function {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const mobileCommandsReporter = this;

    // Skip non reported and elements specific commands
    if (NON_REPORTED_COMMANDS.indexOf(commandName) > -1) {
      return fn;
    }

    return async function wrapCommandFn(this: unknown, ...args: unknown[]) {
      let commandResult: unknown;
      let commandError: unknown;

      const resultPromise: Promise<unknown> = new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
        (this as any).once('result', async (data: { body: string; result: { value: unknown } }) => {
          await mobileCommandsReporter.reportDriverCommand(commandName, data, resolve, reject);
        });
      });

      // Check if a test should be reported (i.e., beginning execution of a new test)
      mobileCommandsReporter.reportTest();

      try {
        // Execute the command
        commandResult = await fn.apply(this, args);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        commandError = err;
      }

      // Wait for the command to be reported to the Agent
      await resultPromise;

      if (commandError) {
        throw commandError;
      }

      return commandResult;
    };
  }

  /**
   * Element command function wrapper.
   * This method generates a wrapper function that handles the execution and reporting of the Element based WebDriver command.
   *
   * @param {string} commandName The name of the command.
   * @param {string} elementId The ID of the element.
   * @param {Function} fn The original WebDriver command.
   *
   * @returns {Function} Wrapping function instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async reportElementCommandWrapper<T>(commandName: string, elementId: string, fn: Function): Promise<T> {
    let commandResult: unknown;
    let commandError: unknown;

    const resultPromise: Promise<unknown> = new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.driverClient?.once('result', async (data: { body: unknown; result: { value: unknown } }) => {
        await this.reportElementCommand(commandName, data, elementId, resolve, reject);
      });
    });

    // Skip auto reporting of the next driver command
    this.skipDriverCommandReporting = true;

    // Check if a test should be reported (i.e., beginning execution of a new test)
    this.reportTest();

    try {
      // Execute the command
      commandResult = await fn();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      commandError = err;
    }

    // Re-enable auto reporting of driver commands
    this.skipDriverCommandReporting = false;

    // Wait for the command to be reported to the Agent
    await resultPromise;

    if (commandError) {
      throw commandError;
    }

    return commandResult as T;
  }
} // MobileCommandsReporter
