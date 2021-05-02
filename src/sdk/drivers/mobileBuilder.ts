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

import BaseBuilder from './baseBuilder';
import AndroidDriver from './mobile/androidDriver';
import IOSDriver from './mobile/iosDriver';
import MobileDriver from './mobile/base/mobileDriver';

/**
 * Enum supported mobile platforms.
 * @enum {string}
 */
export enum Platform {
  Android = 'Android',
  iOS = 'iOS',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class MobileBuilder extends BaseBuilder<MobileBuilder, Promise<MobileDriver>> {
  private platform?: Platform;

  /**
   * Set the target mobile platform.
   *
   * @param {Platform} platform Target mobile platform
   *
   * @returns {MobileBuilder} Self reference
   */
  withPlatform(platform: Platform): MobileBuilder {
    this.platform = platform;
    return this;
  }

  /**
   * Builds a mobile driver.
   *
   * @returns {Promise<MobileDriver>} Promise to a MobileDriver instance.
   */
  async build(): Promise<MobileDriver> {
    // Make sure a target platform was selected
    if (!this.platform) {
      throw new Error('You must choose the target platform by calling the `withPlatform()` method!');
    }

    // Add TP specific capabilities based on the user "with" calls
    this.addTestProjectCapabilities();

    switch (this.platform) {
      case Platform.Android:
        return AndroidDriver.createSession(this.seleniumBuilder.getCapabilities());
        break;
      case Platform.iOS:
        return IOSDriver.createSession(this.seleniumBuilder.getCapabilities());
        break;
      default:
        throw new Error(`Unsupported platform: ${Platform[this.platform] as string}`);
    }
  }
}
