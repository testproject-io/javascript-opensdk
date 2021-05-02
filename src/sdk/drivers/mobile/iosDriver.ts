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
