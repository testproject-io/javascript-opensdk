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

import { By, Capabilities, error } from 'selenium-webdriver';

import logger from '../../../logger/logger';
import MobileElement from './base/mobileElement';
import MobileDriver from './base/mobileDriver';
import cssToIosClassChainSelector from '../../internal/helpers/mobile/iosCSSLocatorConverter';

export default class IOSDriver extends MobileDriver {
  /**
   * Create a new iOS mobile session.
   *
   * @param {Capabilities} caps Desired capabilities.
   *
   * @returns {IOSDriver} A new instance of an IOSDriver.
   */
  public static async createSession(caps: Capabilities): Promise<IOSDriver> {
    // Validate mandatory iOS capabilities
    if (!caps.has('app') && !caps.has('bundleId')) {
      throw new Error('Both "app" and "bundleId" capabilities are missing!');
    }

    // Force iOS platform capability
    caps.set('platformName', 'iOS');

    return IOSDriver.createMobileSession(caps);
  }

  /**
   * Perform a shake action on the device.
   *
   * @ref http://appium.io/docs/en/commands/device/interactions/shake/
   */
  public async shake(): Promise<void> {
    return this.driverClient.shake();
  }

  /**
   * Rotate the device in three dimensions.
   *
   * @ref http://appium.io/docs/en/commands/device/interactions/rotate/
   */
  public async rotateDevice(
    x: number,
    y: number,
    radius: number,
    rotation: number,
    touchCount: number,
    duration: number,
    element?: string
  ): Promise<void> {
    return this.driverClient.rotateDevice(x, y, radius, rotation, touchCount, duration, element);
  }

  /**
   * Simulate a [touch id](https://support.apple.com/en-ca/ht201371) event (iOS Simulator only).
   * To enable this feature, the `allowTouchIdEnroll` desired capability must be set to true and the Simulator
   * must be [enrolled](https://support.apple.com/en-ca/ht201371).
   *
   * When you set allowTouchIdEnroll to true, it will set the Simulator to be enrolled by default.
   * The enrollment state can be [toggled](http://appium.io/docs/en/commands/device/simulator/toggle-touch-id-enrollment/index.html).
   * This call will only work if Appium process or its parent application (e.g. Terminal.app or Appium.app) has access
   * to Mac OS accessibility in System Preferences > Security & Privacy > Privacy > Accessibility list.
   *
   * @ref http://appium.io/docs/en/commands/device/simulator/touch-id/
   */
  public async touchId(match: boolean): Promise<void> {
    return this.driverClient.touchId(match);
  }

  /**
   * Toggle the simulator being [enrolled](https://support.apple.com/en-ca/ht201371) to accept touchId (iOS Simulator only).
   * To enable this feature, the `allowTouchIdEnroll` desired capability must be set to true.
   * When `allowTouchIdEnroll` is set to true the Simulator will be enrolled by default, and the 'Toggle Touch ID Enrollment'
   * changes the enrollment state. This call will only work if the Appium process or its parent application (e.g., Terminal.app or Appium.app)
   * has access to Mac OS accessibility in System Preferences > Security & Privacy > Privacy > Accessibility list.
   *
   * @ref http://appium.io/docs/en/commands/device/simulator/toggle-touch-id-enrollment/
   */
  public async toggleEnrollTouchId(enabled?: boolean): Promise<void> {
    return this.driverClient.toggleEnrollTouchId(enabled);
  }

  /** @inheritdoc */
  public async findElement(locator: By): Promise<MobileElement> {
    if (!this.driverClient) {
      throw new error.SessionNotCreatedError('Driver not initialized!');
    }

    // Parse locator values
    const locatorPrivate = (locator as unknown) as { using: string; value: string };

    if (locatorPrivate.using === 'css selector') {
      // Convert the CSS selector into iOS Class Chain syntax
      const iosClassChainSelector = cssToIosClassChainSelector(locatorPrivate.value);
      logger.debug(`iosClassChainSelector = ${iosClassChainSelector}`);

      // Check if the selector is of an ID type
      const locatorIdRegex = /\[`name == "(.*)"`\]/g;
      const locatorIdMatch = locatorIdRegex.exec(iosClassChainSelector);
      if (locatorIdMatch && locatorIdMatch[1]) {
        locatorPrivate.using = 'id';
        // eslint-disable-next-line prefer-destructuring
        locatorPrivate.value = locatorIdMatch[1];
      } else {
        locatorPrivate.using = '-ios class chain';
        locatorPrivate.value = iosClassChainSelector;
      }
    }

    // Find and return a new element
    return super.findElementUsing(locatorPrivate.using, locatorPrivate.value);
  }
}
