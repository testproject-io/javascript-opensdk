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
