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

import { Browser, Capability, promise, logging, ProxyConfig } from 'selenium-webdriver';

import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { Options as FireFoxOptions } from 'selenium-webdriver/firefox';
import { Options as IeOptions } from 'selenium-webdriver/ie';

import BaseBuilder from './baseBuilder';
import ThenableBaseDriver, { createDriver } from './web/base/thenableBaseDriver';
import Firefox from './web/firefox';
import Chrome from './web/chrome';
import Edge from './web/edge';
import IE from './web/ie';
import Safari from './web/safari';

export default class Builder extends BaseBuilder<Builder, ThenableBaseDriver> {
  /**
   * Sets the default action to take with an unexpected alert before returning
   * an error.
   * @override
   *
   * @param {string} behavior The desired behavior; should be "accept",
   *     "dismiss", or "ignore". Defaults to "dismiss".
   *
   * @returns {BaseBuilder} A self reference.
   */
  setAlertBehavior(behavior: string): Builder {
    this.seleniumBuilder.setAlertBehavior(behavior);
    return this;
  }

  /**
   * Sets the control flow that created drivers should execute actions in.
   * @override
   *
   * @param {promise.ControlFlow} flow The control flow to use, or {@code null} to.
   *
   * @returns {BaseBuilder} A self reference.
   */
  setControlFlow(flow: promise.ControlFlow): Builder {
    this.seleniumBuilder.setControlFlow(flow);
    return this;
  }

  /**
   * Sets Edge specific options for drivers created by this builder.
   * @override
   *
   * @param {EdgeOptions} options - Edge option.
   *
   * @returns {BaseBuilder} A self reference
   */
  setEdgeOptions(options: EdgeOptions): Builder {
    this.seleniumBuilder.setEdgeOptions(options);
    return this;
  }

  /**
   * Sets Firefox specific options for drivers created by this builder.
   * @override
   *
   * @param {FireFoxOptions} options - firefox options.
   *
   * @returns {BaseBuilder} A self reference.
   */
  setFirefoxOptions(options: FireFoxOptions): Builder {
    this.seleniumBuilder.setFirefoxOptions(options);
    return this;
  }

  /**
   * Sets Ie specific options for drivers created by this builder.
   * @override
   *
   * @param {IeOptions} options - IE options.
   *
   * @returns {BaseBuilder} A self reference.
   */
  setIeOptions(options: IeOptions): Builder {
    this.seleniumBuilder.setIeOptions(options);
    return this;
  }

  /**
   * Sets the logging preferences for the created session.
   * @override
   *
   * @param {logging.Preferences | Object} prefs - The desired logging preferences.
   *
   * @returns {BaseBuilder} A self reference.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  setLoggingPrefs(prefs: logging.Preferences | Object): Builder {
    this.seleniumBuilder.setLoggingPrefs(prefs);
    return this;
  }

  /**
   * Sets the proxy configuration for the target browser.
   * @override
   *
   * @param {ProxyConfig} config - The configuration to use.
   *
   * @returns {BaseBuilder} A self reference.
   */
  setProxy(config: ProxyConfig): Builder {
    this.seleniumBuilder.setProxy(config);
    return this;
  }

  /**
   * Creates a new WebDriver based on this builder's current configuration.
   *
   * @returns {ThenableBaseDriver} A thenable driver instance.
   */
  build(): ThenableBaseDriver {
    // Add TP specific capabilities based on the user "with" calls
    this.addTestProjectCapabilities();

    // Create a copy for any changes we may need to make based on the current environment
    const capabilities = this.seleniumBuilder.getCapabilities();
    const browser = capabilities.get(Capability.BROWSER_NAME) as string;

    if (typeof browser !== 'string') {
      throw TypeError(
        `Target browser must be a string, but is <${typeof browser}>; did you forget to call forBrowser()?`
      );
    }

    // Create a driver instance
    let driver: ThenableBaseDriver;

    switch (browser) {
      case Browser.CHROME:
        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        capabilities.set('goog:chromeOptions', (this.chromeOptions as any)?.options_);

        if (this.chromeOptions) {
          capabilities.merge(this.chromeOptions.toCapabilities());
        }
        driver = createDriver(Chrome, capabilities);
        break;
      case Browser.FIREFOX:
        if (this.seleniumBuilder.getFirefoxOptions()) {
          capabilities.merge(this.seleniumBuilder.getFirefoxOptions().toCapabilities());
        }
        driver = createDriver(Firefox, capabilities);
        break;
      case Browser.IE:
        driver = createDriver(IE, capabilities);
        break;
      case Browser.EDGE:
        driver = createDriver(Edge, capabilities);
        break;
      case Browser.SAFARI:
        if (this.seleniumBuilder.getSafariOptions()) {
          capabilities.merge(this.seleniumBuilder.getSafariOptions().toCapabilities());
        }
        driver = createDriver(Safari, capabilities);
        break;
      default:
        throw new Error(`Do not know how to build driver: ${browser}`);
    }

    // Set default implicit wait
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    driver.manage().timeouts().implicitlyWait(BaseBuilder.DEFAULT_IMPLICIT_TIMEOUT);

    return driver;
  }
}
