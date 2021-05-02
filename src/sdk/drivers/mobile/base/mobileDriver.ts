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

import { By, Capabilities } from 'selenium-webdriver';
import WebDriver, { Client } from 'webdriver';

import logger from '../../../../logger/logger';
import IReportingDriver from '../../interfaces/reportingDriver';
import Reporter from '../../../reporter/reporter';
import AgentClient from '../../../internal/agent/agentClient';
import SessionResponse from '../../../../rest/messages/sessionResponse';
import MobileCommandsReporter from '../../../internal/helpers/mobileCommandsReporter';

import MobileElement from './mobileElement';

/**
 * Base class for mobile drivers.
 */
export default abstract class MobileDriver implements IReportingDriver {
  /**
   * Custom mobile commands reporter class instance.
   */
  protected commandsReporter: MobileCommandsReporter;

  /**
   * TestProject reporter instance.
   */
  protected reporter: Reporter;

  /**
   * WebDriver client instance.
   */
  protected driverClient: Client;

  /**
   * Class constructor.
   *
   * @param {SessionResponse} sessionResponse Agent's session response object.
   * @param {AgentClient} agentClient Agent client instance.
   */
  constructor(sessionResponse: SessionResponse, protected agentClient: AgentClient) {
    // Setup reporting
    this.reporter = new Reporter(this.agentClient, this.takeScreenshot.bind(this));
    this.commandsReporter = new MobileCommandsReporter(this.agentClient, this.reporter);

    // Parse the Appium server address
    const url = new URL(sessionResponse.serverAddress);

    // Attach to the session
    this.driverClient = WebDriver.attachToSession(
      {
        sessionId: sessionResponse.sessionId,
        hostname: url.hostname,
        port: parseInt(url.port, 10),
        path: url.pathname,
        protocol: url.protocol.slice(0, -1),
        isW3C: sessionResponse.dialect === 'W3C',
        isMobile: true,
        logLevel: 'warn',
      },
      undefined, // modifier
      undefined, // userPrototype
      this.commandsReporter.reportDriverCommandWrapper.bind(this.commandsReporter)
    );

    // Update the driver client in the reporter
    this.commandsReporter.setDriverClient(this.driverClient);
  }

  /**
   * Static method for creating a new mobile session.
   *
   * @param {MobileDriver} this MobileDriver instance.
   * @param {Capabilities} caps Requested capabilities object.
   *
   * @returns {Promise<T>} A promise to a newly created MobileDriver instance.
   */
  protected static async createMobileSession<T extends MobileDriver>(
    this: {
      new (sessionResponse: SessionResponse, agentClient: AgentClient): T;
    },
    caps: Capabilities
  ): Promise<T> {
    // Validate mandatory mobile capabilities
    if (!caps.has('udid')) {
      throw new Error('Mandatory "udid" capability is missing!');
    }

    // If browser name was not specified, set an empty value
    if (!caps.has('browserName')) {
      caps.set('browserName', '');
    }

    // New agent client instance
    // TODO: Check for existing one for reuse?
    const agentClient = new AgentClient(caps);

    // Create a new session
    const sessionResponse = await agentClient.startSession();
    logger.debug(`Start session response:\n${JSON.stringify(sessionResponse, null, 2)}`);

    // Create new driver instance
    const mobileDriver = new this(sessionResponse, agentClient);

    // TODO: Use constant
    await mobileDriver.driverClient.setImplicitTimeout(15000);

    return mobileDriver;
  }

  /**
   * Quit the development session.
   */
  public async quit(): Promise<void> {
    // Report the last test
    this.commandsReporter.reportTest(true);

    // Terminate the session
    await this.agentClient.quitSession();
  }

  /**
   * Return an instance of a TestProject reporter class.
   *
   * @returns {Reporter} TestProject reporter instance.
   */
  report(): Reporter {
    return this.reporter;
  }

  //#region WebDriver function overloads

  /**
   * Reset the currently running app for this session.
   *
   * @ref http://appium.io/docs/en/commands/device/app/reset-app/
   */
  public async resetApp(): Promise<void> {
    await this.driverClient.reset();
  }

  /**
   * Hide soft keyboard.
   *
   * @ref http://appium.io/docs/en/commands/device/keys/hide-keyboard/
   *
   */
  public async hideKeyboard(): Promise<void> {
    await this.driverClient.hideKeyboard();
  }

  /**
   * Whether or not the soft keyboard is shown.
   *
   * @returns {boolean} true if keyboard is shown or false otherwise.
   * @ref http://appium.io/docs/en/commands/device/keys/is-keyboard-shown/
   *
   */
  public async isKeyboardShown(): Promise<boolean> {
    return this.driverClient.isKeyboardShown();
  }

  /**
   * Takes a screenshot of the context's viewport.
   *
   * @returns {string} Base64 representation of a screenshot.
   * @ref https://w3c.github.io/webdriver/#dfn-take-screenshot
   */
  public async takeScreenshot(): Promise<string> {
    return this.driverClient.takeScreenshot();
  }

  //#endregion

  //#region Custom Methods

  /**
   * Find an element using a custom locator strategy.
   *
   * @param {string} using Locator strategy.
   * @param {string} value Locator value.
   *
   * @returns {MobileElement} A MobileElement class instance.
   */
  public async findElementUsing(using: string, value: string): Promise<MobileElement> {
    const elementRef = await this.driverClient.findElement(using, value);

    // Create a new mobile element instance
    return new MobileElement(
      this.driverClient,
      this.commandsReporter,
      using,
      value,
      elementRef['element-6066-11e4-a52e-4f735466cecf']
    );
  }

  //#endregion

  //#region Abstract Methods

  /**
   * Find an element using Selenium's By object.
   *
   * @param {By} locator Selenium's By locator instance.
   *
   * @returns {MobileElement} A MobileElement class instance.
   */
  public abstract findElement(locator: By): Promise<MobileElement>;

  //#endregion
}
