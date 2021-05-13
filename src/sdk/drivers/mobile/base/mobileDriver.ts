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
import { ProtocolCommandResponse, StringsReturn } from '@wdio/protocols/build/types';

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
    return this.driverClient.reset();
  }

  /**
   * Launch an app on device.
   * iOS tests with XCUITest can also use the `mobile: launchApp` method.
   * See detailed [documentation](http://appium.io/docs/en/writing-running-appium/ios/ios-xctest-mobile-apps-management/index.html#mobile-launchapp).
   *
   * @ref http://appium.io/docs/en/commands/device/app/launch-app/
   */
  public async launchApp(): Promise<void> {
    await this.driverClient.launchApp();
  }

  /**
   * Send the currently running app for this session to the background.
   * iOS tests with XCUITest can also use the `mobile: terminateApp` method
   * to terminate the current app (see detailed [documentation](http://appium.io/docs/en/writing-running-appium/ios/ios-xctest-mobile-apps-management/index.html#mobile-terminateapp)),
   * and the `mobile: activateApp` to activate an existing application on
   * the device under test and moves it to the foreground (see detailed [documentation](http://appium.io/docs/en/writing-running-appium/ios/ios-xctest-mobile-apps-management/index.html#mobile-activateapp)).
   *
   * @ref http://appium.io/docs/en/commands/device/app/background-app/
   */
  public async backgroundApp(seconds: number | null): Promise<void> {
    return this.driverClient.background(seconds);
  }

  /**
   * Get app strings.
   *
   * @ref http://appium.io/docs/en/commands/device/app/get-app-strings/
   */
  public async getAppStrings(language?: string, stringFile?: string): Promise<StringsReturn> {
    return this.driverClient.getStrings(language, stringFile);
  }

  /**
   * No description available, please see reference link.
   *
   * @ref https://github.com/appium/appium-base-driver/blob/master/docs/mjsonwp/protocol-methods.md#appium-extension-endpoints
   */
  public async setValueImmediate(elementId: string, value: string): Promise<void> {
    return this.driverClient.setValueImmediate(elementId, value);
  }

  /**
   * This functionality is only available from within a native context.
   * 'Touch Perform' works similarly to the other singular touch interactions,
   * except that this allows you to chain together more than one touch action as one command.
   * This is useful because Appium commands are sent over the network and there's latency between commands.
   * This latency can make certain touch interactions impossible because some interactions need to be performed in one sequence.
   * Vertical, for example, requires pressing down, moving to a different y coordinate, and then releasing.
   * For it to work, there can't be a delay between the interactions.
   *
   * @ref http://appium.io/docs/en/commands/interactions/touch/touch-perform/
   *
   * @example
   * ```js
   * // do a horizontal swipe by percentage
   * const startPercentage = 10;
   * const endPercentage = 90;
   * const anchorPercentage = 50;
   *
   * const { width, height } = driver.getWindowSize();
   * const anchor = height// anchorPercentage / 100;
   * const startPoint = width// startPercentage / 100;
   * const endPoint = width// endPercentage / 100;
   * driver.touchPerform([
   *   {
   *     action: 'press',
   *     options: {
   *       x: startPoint,
   *       y: anchor,
   *     },
   *   },
   *   {
   *     action: 'wait',
   *     options: {
   *       ms: 100,
   *     },
   *   },
   *   {
   *     action: 'moveTo',
   *     options: {
   *       x: endPoint,
   *       y: anchor,
   *     },
   *   },
   *   {
   *     action: 'release',
   *     options: {},
   *   },
   * ]);
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async touchPerform(actions: object[]): Promise<void> {
    return this.driverClient.touchPerform(actions);
  }

  /**
   * This functionality is only available from within a native context.
   * Perform a multi touch action sequence.
   *
   * @ref http://appium.io/docs/en/commands/interactions/touch/multi-touch-perform/
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async multiTouchPerform(actions: object[]): Promise<void> {
    return this.driverClient.multiTouchPerform(actions);
  }

  /**
   * Get events stored in appium server.
   *
   * @ref https://github.com/appium/appium/blob/master/docs/en/commands/session/events/get-events.md
   */
  public async getEvents(type: string[]): Promise<ProtocolCommandResponse> {
    return this.driverClient.getEvents(type);
  }

  /**
   * Store a custom event.
   *
   * @ref https://github.com/appium/appium/blob/master/docs/en/commands/session/events/log-event.md
   */
  public async logEvent(vendor: string, event: string): Promise<void> {
    return this.driverClient.logEvent(vendor, event);
  }

  /**
   * Hide soft keyboard.
   *
   * @ref http://appium.io/docs/en/commands/device/keys/hide-keyboard/
   */
  public async hideKeyboard(): Promise<void> {
    await this.driverClient.hideKeyboard();
  }

  /**
   * Appium Protocol Command
   *
   * Get the time on the device.
   *
   * @returns {string} time on the device.
   * @ref http://appium.io/docs/en/commands/device/system/system-time/
   *
   */
  public async getDeviceTime(): Promise<string> {
    return this.driverClient.getDeviceTime();
  }

  /**
   * Get the given app status on the device
   *
   * @ref http://appium.io/docs/en/commands/device/app/app-state/
   */
  public async appState(appId?: string, bundleId?: string): Promise<number> {
    return this.driverClient.queryAppState(appId, bundleId);
  }

  /**
   * Check whether the specified app is installed on the device.
   *
   * @ref http://appium.io/docs/en/commands/device/app/is-app-installed/
   */
  public async isAppInstalled(appId?: string, bundleId?: string): Promise<boolean> {
    return this.driverClient.isAppInstalled(appId, bundleId);
  }

  /**
   * Terminate the given app on the device
   *
   * @ref http://appium.io/docs/en/commands/device/app/terminate-app/
   */
  public async terminateApp(appId?: string, bundleId?: string): Promise<void> {
    return this.driverClient.terminateApp(appId, bundleId);
  }

  /**
   * Returns the information of the system state which is supported to read as like cpu, memory, network traffic, and battery.
   *
   * @returns {string[]} information of the system state which is supported
   * @ref http://appium.io/docs/en/commands/device/performance-data/get-performance-data/
   */
  public async getPerformanceData(packageName: string, dataType: string, dataReadTimeout?: number): Promise<string[]> {
    return this.driverClient.getPerformanceData(packageName, dataType, dataReadTimeout);
  }

  /**
   * Returns the information types of the system state which is supported to read as like cpu, memory, network traffic, and battery.
   *
   * @returns {string[]} information types of the system state
   * @ref http://appium.io/docs/en/commands/device/performance-data/performance-data-types/
   */
  public async getPerformanceDataTypes(): Promise<string[]> {
    return this.driverClient.getPerformanceDataTypes();
  }

  /**
   * Activate the given app onto the device
   *
   * @ref http://appium.io/docs/en/commands/device/app/activate-app/
   */
  public async activateApp(appId?: string, bundleId?: string): Promise<void> {
    return this.driverClient.activateApp(appId, bundleId);
  }

  /**
   * Install the given app onto the device.
   *
   * @ref http://appium.io/docs/en/commands/device/app/install-app/
   */
  public async installApp(appPath: string): Promise<void> {
    return this.driverClient.installApp(appPath);
  }

  /**
   * Remove an app from the device.
   *
   * @ref http://appium.io/docs/en/commands/device/app/remove-app/
   */
  public async removeApp(appId?: string, bundleId?: string): Promise<void> {
    return this.driverClient.removeApp(appId, bundleId);
  }

  /**
   * Close an app on device.
   *
   * @ref http://appium.io/docs/en/commands/device/app/close-app/
   */
  public async closeApp(): Promise<void> {
    return this.driverClient.closeApp();
  }

  /**
   * Lock the device.
   *
   * @ref http://appium.io/docs/en/commands/device/interactions/lock/
   */
  public async lock(seconds?: number): Promise<void> {
    return this.driverClient.lock(seconds);
  }

  /**
   * Start recording the screen.
   *
   * @ref http://appium.io/docs/en/commands/device/recording-screen/start-recording-screen/
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async startRecordingScreen(options?: object): Promise<void> {
    return this.startRecordingScreen(options);
  }

  /**
   * Stop recording screen
   *
   * @ref http://appium.io/docs/en/commands/device/recording-screen/stop-recording-screen/
   */
  public async stopRecordingScreen(
    remotePath?: string,
    username?: string,
    password?: string,
    method?: string
  ): Promise<string> {
    return this.driverClient.stopRecordingScreen(remotePath, username, password, method);
  }

  /**
   * Get the time on the device.
   *
   * @ref http://appium.io/docs/en/commands/device/system/system-time/
   */
  public async systemTime(): Promise<string> {
    return this.driverClient.getDeviceTime();
  }

  /**
   * Appium Protocol Command
   *
   * Retrieve a file from the device's file system.
   * @ref http://appium.io/docs/en/commands/device/files/pull-file/
   *
   */
  public pullFile(path: string): Promise<string> {
    return this.driverClient.pullFile(path);
  }

  /**
   * Takes a screenshot of the context's viewport.
   *
   * @returns {string} Base64 representation of a screenshot.
   *
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
