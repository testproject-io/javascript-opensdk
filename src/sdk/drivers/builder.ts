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

import {
  Browser,
  Capability,
  logging,
  promise,
  ProxyConfig,
  Builder as SeleniumBuilder,
  Capabilities,
} from 'selenium-webdriver';

import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import { Options as FireFoxOptions } from 'selenium-webdriver/firefox';
import { Options as IeOptions } from 'selenium-webdriver/ie';
import { Options as SafariOptions } from 'selenium-webdriver/safari';

import TestProjectCapabilities from '../internal/helpers/customCapabilities';
import ThenableBaseDriver, { createDriver } from './base/thenableBaseDriver';
import customExceptions from '../exceptions';
import Firefox from './web/firefox';
import Chrome from './web/chrome';
import Edge from './web/edge';
import IE from './web/ie';
import Safari from './web/safari';
import ReportType from '../../enums/reportType';

/**
 * TestProject WebDriver Builder.
 * @extends SeleniumBuilder
 *
 * @property {string | undefined} token - User token
 * @property {string | undefined} remoteAddr - Agent url
 * @property {string | undefined} projectName - The project name
 * @property {string | undefined} jobName - The job name
 * @property {boolean | undefined} disableReports - Disable report flag
 */
export default class Builder extends SeleniumBuilder {
  /* TestProject Extensions */
  token: string | undefined;

  remoteAgent: string | undefined;

  projectName: string | undefined;

  jobName: string | undefined;

  disableReporting: boolean | undefined;

  chromeOptions?: ChromeOptions;

  reportType = ReportType.CLOUD_AND_LOCAL;

  /* Selenium WebDriver Overrides */

  /**
   * Configures the target browser for clients created by this instance.
   *
   * @param {string} name - The name of the target browse (Chrome, Ie etc...)
   * @param {string} opt_version - A desired version
   * @param {string} opt_platform - The desired platform
   *
   * @returns {Builder} A self reference
   */
  forBrowser(name: string, opt_version?: string, opt_platform?: string): Builder {
    return super.forBrowser(name, opt_version, opt_platform) as Builder;
  }

  /**
   * Sets the proxy configuration for the target browser.
   *
   * @param {Object | Capabilities} capabilities - The desired capabilities for a new session
   *
   * @returns {Builder} A self reference
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  withCapabilities(capabilities: Object | Capabilities): Builder {
    return super.withCapabilities(capabilities) as Builder;
  }

  /**
   * Sets TestProject development token.
   *
   * @param {string} token - The developer token.
   *
   * @returns {Builder} A self reference
   */
  withToken(token: string): Builder {
    this.token = token;
    return this;
  }

  /**
   * Sets the address of a TestProject Agent.
   *
   * @param {string} remoteAgent - Agent remote address.
   *
   * @returns {Builder} A self reference.
   */
  withRemoteAgent(remoteAgent: string): Builder {
    this.remoteAgent = remoteAgent;
    return this;
  }

  /**
   * Sets project name for the report.
   *
   * @param {string} projectName - Set project name.
   *
   * @returns {Builder} A self reference.
   */
  withProjectName(projectName: string): Builder {
    const trimedName = projectName.trim();

    if (!trimedName) {
      throw new customExceptions.InvalidArgumentException('When using withProjectName method you must pass a value');
    }

    this.projectName = trimedName;
    return this;
  }

  /**
   * Sets job name for the report.
   *
   * @param {string} jobName - Set job name.
   *
   * @returns {Builder} A self reference.
   */
  withJobName(jobName: string): Builder {
    const trimedName = jobName.trim();

    if (!trimedName) {
      throw new customExceptions.InvalidArgumentException('When using withJobName method you must pass a value');
    }

    this.jobName = trimedName;
    return this;
  }

  /**
   * Sets the option to disable TestProject reporting.
   *
   * @param {boolean} disableReporting - True for disable otherwise false.
   *
   * @returns {Builder} A self reference.
   */
  setDisableReporting(disableReporting: boolean): Builder {
    this.disableReporting = disableReporting;
    return this;
  }

  /**
   * Configures this builder to ignore any environment variable overrides and to
   * only use the configuration specified through this instance's API.
   *
   * @returns {Builder} A self reference.
   */
  disableEnvironmentOverrides(): Builder {
    return super.disableEnvironmentOverrides() as Builder;
  }

  /**
   * Sets the default action to take with an unexpected alert before returning
   * an error.
   *
   * @param {string} behavior The desired behavior; should be "accept",
   *     "dismiss", or "ignore". Defaults to "dismiss".
   *
   * @returns {Builder} A self reference.
   */
  setAlertBehavior(behavior: string): Builder {
    return super.setAlertBehavior(behavior) as Builder;
  }

  /**
   * Sets Chrome specific options for drivers created by this builder.
   *
   * @param {ChromeOptions} options - chrome options.
   *
   * @returns {Builder} A self reference.
   */
  setChromeOptions(options: ChromeOptions): Builder {
    this.chromeOptions = options;
    return super.setChromeOptions(options) as Builder;
  }

  /**
   * Sets the control flow that created drivers should execute actions in.
   *
   * @param {promise.ControlFlow} flow The control flow to use, or {@code null} to.
   *
   * @returns {Builder} A self reference.
   */
  setControlFlow(flow: promise.ControlFlow): Builder {
    return super.setControlFlow(flow) as Builder;
  }

  /**
   * Sets Edge specific options for drivers created by this builder.
   *
   * @param {EdgeOptions} options - Edge option.
   *
   * @returns {Builder} A self reference
   */
  setEdgeOptions(options: EdgeOptions): Builder {
    return super.setEdgeOptions(options) as Builder;
  }

  /**
   * Sets whether native events should be used.
   *
   * @param {boolean} enabled - Whether to enable native events.
   *
   * @returns {Builder} A self reference.
   */
  setEnableNativeEvents(enabled: boolean): Builder {
    return super.setEnableNativeEvents(enabled) as Builder;
  }

  /**
   * Sets Firefox specific options for drivers created by this builder.
   *
   * @param {FireFoxOptions} options - firefox options.
   *
   * @returns {Builder} A self reference.
   */
  setFirefoxOptions(options: FireFoxOptions): Builder {
    return super.setFirefoxOptions(options) as Builder;
  }

  /**
   * Sets Ie specific options for drivers created by this builder.
   *
   * @param {IeOptions} options - IE options.
   *
   * @returns {Builder} A self reference.
   */
  setIeOptions(options: IeOptions): Builder {
    return super.setIeOptions(options) as Builder;
  }

  /**
   * Sets the logging preferences for the created session.
   *
   * @param {logging.Preferences | Object} prefs - The desired logging preferences.
   *
   * @returns {Builder} A self reference.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  setLoggingPrefs(prefs: logging.Preferences | Object): Builder {
    return super.setLoggingPrefs(prefs) as Builder;
  }

  /**
   * Sets the proxy configuration for the target browser.
   * @param {ProxyConfig} config - The configuration to use.
   * @returns {Builder} A self reference.
   */
  setProxy(config: ProxyConfig): Builder {
    return super.setProxy(config) as Builder;
  }

  /**
   * Sets Safari specific options for drivers created by this builder.
   *
   * @param {SafariOptions} options - Safari options.
   *
   * @returns {Builder} A self reference.
   */
  setSafariOptions(options: SafariOptions): Builder {
    return super.setSafariOptions(options) as Builder;
  }

  /**
   * Sets how elements should be scrolled into view for interaction.
   *
   * @param {number} behavior - The desired scroll behavior: either 0 to align with the top
   * of the viewport or 1 to align with the bottom.
   *
   * @returns {Builder} A self reference.
   */
  setScrollBehavior(behavior: number): Builder {
    return super.setScrollBehavior(behavior) as Builder;
  }

  /**
   * Sets the control flow that created drivers should execute actions in.
   *
   * @param {promise.ControlFlow} flow The control flow to use, or {@code null} to.
   *
   * @returns {Builder} A self reference.
   */
  setReportType(reportType: ReportType): Builder {
    this.reportType = reportType;
    return this;
  }

  /**
   * Creates a new WebDriver client based on this builder's current configuration.
   *
   * @returns {ThenableWebDriver} A new WebDriver instance.
   */
  build(): ThenableBaseDriver {
    // Create a copy for any changes we may need to make based on the current
    // environment.
    const capabilities = this.getCapabilities();
    const browser = capabilities.get(Capability.BROWSER_NAME) as string;

    if (typeof browser !== 'string') {
      throw TypeError(
        `Target browser must be a string, but is <${typeof browser}>; did you forget to call forBrowser()?`
      );
    }

    // Add custom properties to capabilities
    if (this.token) {
      capabilities.set(TestProjectCapabilities.DEVELOPMENT_TOKEN, this.token);
    }

    if (this.remoteAgent) {
      capabilities.set(TestProjectCapabilities.REMOTE_AGENT_ADDRESS, this.remoteAgent);
    }

    if (this.projectName) {
      capabilities.set(TestProjectCapabilities.PROJECT_NAME, this.projectName);
    }

    if (this.jobName) {
      capabilities.set(TestProjectCapabilities.JOB_NAME, this.jobName);
    }

    if (this.disableReporting) {
      capabilities.set(TestProjectCapabilities.DISABLE_REPORTS, this.disableReporting);
    }

    // Always set the report type (Cloud & Local as default)
    capabilities.set(TestProjectCapabilities.REPORT_TYPE, ReportType[this.reportType]);

    // Check for a native browser.
    switch (browser) {
      case Browser.CHROME:
        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        capabilities.set('goog:chromeOptions', (this.chromeOptions as any)?.options_);
        return createDriver(Chrome, capabilities);
      case Browser.FIREFOX:
        capabilities.merge(this.getFirefoxOptions());
        return createDriver(Firefox, capabilities);
      case Browser.IE:
        return createDriver(IE, capabilities);
      case Browser.EDGE:
        return createDriver(Edge, capabilities);
      case Browser.SAFARI:
        return createDriver(Safari, capabilities);
      default:
        throw new Error(`Do not know how to build driver: ${browser}; did you forget to call usingServer(url)?`);
    }
  }
}
