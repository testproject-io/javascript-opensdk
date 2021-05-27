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

import logger from '../../../logger/logger';
import MobileElement from './base/mobileElement';
import cssToUiAutomatorSelector from '../../internal/helpers/mobile/androidCSSLocatorConverter';
import MobileDriver from './base/mobileDriver';

export default class AndroidDriver extends MobileDriver {
  /**
   * Create a new Android mobile session.
   *
   * @param {Capabilities} caps Desired capabilities.
   *
   * @returns {AndroidDriver} A new instance of an AndroidDriver.
   */
  public static async createSession(caps: Capabilities): Promise<AndroidDriver> {
    // Validate mandatory Android capabilities
    if (!caps.has('app') && !(caps.has('appPackage') && caps.has('appActivity'))) {
      throw new Error('Mandatory "app" or "appPackage"/"appActivity" capabilities are missing!');
    }

    // Force Android platform capability
    caps.set('platformName', 'Android');

    return AndroidDriver.createMobileSession(caps);
  }

  /**
   * Start an Android activity by providing package name and activity name.
   *
   * @ref http://appium.io/docs/en/commands/device/activity/start-activity/
   */
  public async startActivity(
    appPackage: string,
    appActivity: string,
    appWaitPackage?: string,
    appWaitActivity?: string,
    intentAction?: string,
    intentCategory?: string,
    intentFlags?: string,
    optionalIntentArguments?: string,
    dontStopAppOnReset?: string
  ): Promise<void> {
    return this.driverClient.startActivity(
      appPackage,
      appActivity,
      appWaitPackage,
      appWaitActivity,
      intentAction,
      intentCategory,
      intentFlags,
      optionalIntentArguments,
      dontStopAppOnReset
    );
  }

  /**
   * Get the name of the current Android package.
   *
   * @ref http://appium.io/docs/en/commands/device/activity/current-package/
   */
  public async getCurrentPackage(): Promise<string> {
    return this.driverClient.getCurrentPackage();
  }

  /**
   * Get the name of the current Android activity.
   *
   * @ref http://appium.io/docs/en/commands/device/activity/current-activity/
   */
  public async getCurrentActivity(): Promise<string> {
    return this.driverClient.getCurrentActivity();
  }

  /**
   * Check whether the device is locked or not.
   *
   * @ref http://appium.io/docs/en/commands/device/interactions/is-locked/
   */
  public async isLocked(): Promise<boolean> {
    return this.driverClient.isLocked();
  }

  /**
   * Unlock the device.
   *
   * @ref http://appium.io/docs/en/commands/device/interactions/unlock/
   */
  public async unlock(): Promise<void> {
    return this.driverClient.unlock();
  }

  /**
   * Appium Protocol Command
   *
   * Press a particular key on the device.
   * @ref http://appium.io/docs/en/commands/device/keys/press-keycode/
   *
   */
  public async pressKeyCode(keycode: number, metastate?: number, flags?: number): Promise<void> {
    return this.driverClient.pressKeyCode(keycode, metastate, flags);
  }

  /**
   * Press and hold a particular key code on the device.
   *
   * @ref http://appium.io/docs/en/commands/device/keys/long-press-keycode/
   */
  public async longPressKeyCode(keycode: number, metastate?: number, flags?: number): Promise<void> {
    return this.driverClient.longPressKeyCode(keycode, metastate, flags);
  }

  /**
   * Toggle airplane mode on device.
   *
   * @ref http://appium.io/docs/en/commands/device/network/toggle-airplane-mode/
   */
  public async toggleAirplaneMode(): Promise<void> {
    return this.driverClient.toggleAirplaneMode();
  }

  /**
   * Replace the value to element directly.
   *
   * @ref https://github.com/appium/appium-base-driver/blob/master/docs/mjsonwp/protocol-methods.md#appium-extension-endpoints
   */
  public async replaceValue(elementId: string, value: string): Promise<void> {
    return this.driverClient.replaceValue(elementId, value);
  }

  /**
   * Place a file onto the device in a particular place.
   *
   * @ref http://appium.io/docs/en/commands/device/files/push-file/
   */
  public async pushFile(path: string, data: string): Promise<void> {
    return this.driverClient.pushFile(path, data);
  }

  /**
   * Authenticate users by using their finger print scans on supported emulators.
   *
   * @ref http://appium.io/docs/en/commands/device/authentication/finger-print/
   */
  public async fingerPrint(fingerprintId: number): Promise<void> {
    return this.driverClient.fingerPrint(fingerprintId);
  }

  /**
   * Whether or not the soft keyboard is shown.
   *
   * @returns {boolean} true if keyboard is shown or false otherwise.
   * @ref http://appium.io/docs/en/commands/device/keys/is-keyboard-shown/
   */
  public async isKeyboardShown(): Promise<boolean> {
    return this.driverClient.isKeyboardShown();
  }

  /**
   * Get display density from device.
   *
   * @returns {number} display density from device.
   *
   * @ref https://github.com/appium/appium-base-driver/blob/master/docs/mjsonwp/protocol-methods.md#appium-extension-endpoints
   */
  public async getDisplayDensity(): Promise<number> {
    return this.driverClient.getDisplayDensity() as Promise<number>;
  }

  /**
   * Set network speed (Emulator only)
   *
   * @ref http://appium.io/docs/en/commands/device/network/network-speed/
   */
  public async toggleNetworkSpeed(): Promise<void> {
    return this.driverClient.toggleNetworkSpeed();
  }

  /**
   * Open Android notifications (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/system/open-notifications/
   */
  public async openNotifications(): Promise<void> {
    return this.driverClient.openNotifications();
  }

  /**
   * Get test coverage data.
   *
   * @ref http://appium.io/docs/en/commands/device/app/end-test-coverage/
   */
  public async endCoverage(intent: string, path: string): Promise<void> {
    return this.driverClient.endCoverage(intent, path);
  }

  /**
   * Make GSM call (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/network/gsm-call/
   */
  public async gsmCall(phoneNumber: string, action: string): Promise<void> {
    return this.driverClient.gsmCall(phoneNumber, action);
  }

  /**
   * Set GSM signal strength (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/network/gsm-signal/
   */
  public async gsmSignal(signalStrength: string, signalStrengh?: string): Promise<void> {
    return this.driverClient.gsmSignal(signalStrength, signalStrengh);
  }

  /**
   * Set GSM voice state (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/network/gsm-voice/
   */
  public async gsmVoice(state: string): Promise<void> {
    return this.driverClient.gsmVoice(state);
  }

  /**
   * Set the battery percentage (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/emulator/power_capacity/
   */
  public async powerCapacity(percent: number): Promise<void> {
    return this.driverClient.powerCapacity(percent);
  }

  /**
   * Simulate an SMS message (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/network/send-sms/
   */
  public async sendSms(phoneNumber: string, message: string): Promise<void> {
    return this.driverClient.sendSms(phoneNumber, message);
  }

  /**
   * Set the state of the battery charger to connected or not (Emulator only).
   *
   * @ref http://appium.io/docs/en/commands/device/emulator/power_ac/
   */
  public async powerAC(state: string): Promise<void> {
    return this.driverClient.powerAC(state);
  }

  /**
   * Retrieve visibility and bounds information of the status and navigation bars.
   *
   * @ref http://appium.io/docs/en/commands/device/system/system-bars/
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  public async getSystemBars(): Promise<object[]> {
    return this.driverClient.getSystemBars();
  }

  /**
   * Switch the state of the location service.
   *
   * @ref http://appium.io/docs/en/commands/device/network/toggle-location-services/
   */
  public async toggleLocationServices(): Promise<void> {
    return this.driverClient.toggleLocationServices();
  }

  /**
   * Switch the state of the wifi service.
   *
   * @ref http://appium.io/docs/en/commands/device/network/toggle-wifi/
   */
  public async toggleWiFi(): Promise<void> {
    return this.driverClient.toggleWiFi();
  }

  /**
   * Switch the state of data service.
   *
   * @ref http://appium.io/docs/en/commands/device/network/toggle-data/
   */
  public async toggleData(): Promise<void> {
    return this.driverClient.toggleData();
  }

  /** @inheritdoc */
  public async findElement(locator: By): Promise<MobileElement> {
    // Parse locator values
    const locatorPrivate = (locator as unknown) as { using: string; value: string };

    if (locatorPrivate.using === 'css selector') {
      // Convert the CSS selector into UiAutomator2 syntax
      const uiAutomatorSelector = cssToUiAutomatorSelector(locatorPrivate.value);
      logger.debug(`uiAutomatorSelector = ${uiAutomatorSelector}`);

      // Check if the selector is of an ID type
      const locatorIdRegex = /new UiSelector\(\).resourceId\("android:id\/(.+)"\)/g;
      const locatorIdMatch = locatorIdRegex.exec(uiAutomatorSelector);
      if (locatorIdMatch && locatorIdMatch[1]) {
        locatorPrivate.using = 'id';
        // eslint-disable-next-line prefer-destructuring
        locatorPrivate.value = locatorIdMatch[1];
      } else {
        locatorPrivate.using = '-android uiautomator';
        locatorPrivate.value = uiAutomatorSelector;
      }
    }

    // Find and return a new element
    return super.findElementUsing(locatorPrivate.using, locatorPrivate.value);
  }
}
