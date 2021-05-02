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

import { Builder as SeleniumBuilder, Capabilities } from 'selenium-webdriver';

import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as SafariOptions } from 'selenium-webdriver/safari';

import customExceptions from '../exceptions';
import ReportType from '../../enums/reportType';
import TestProjectCapabilities from '../internal/helpers/customCapabilities';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default abstract class BaseBuilder<T, D> {
  /**
   * Default implicit wait timeout in milliseconds.
   */
  protected static readonly DEFAULT_IMPLICIT_TIMEOUT = 15000;

  protected typedSelf = (this as unknown) as T;

  protected seleniumBuilder: SeleniumBuilder = new SeleniumBuilder();

  /* TestProject Extensions */
  protected token?: string;

  protected remoteAgent?: string;

  protected projectName: string | undefined;

  protected jobName: string | undefined;

  protected disableReporting: boolean | undefined;

  protected chromeOptions?: ChromeOptions;

  protected reportType?: ReportType;

  protected reportName?: string;

  protected reportPath?: string;

  /**
   * Configures the target browser for clients created by this instance.
   *
   * @param {string} name - The name of the target browse (Chrome, Ie etc...)
   * @param {string} opt_version - A desired version
   * @param {string} opt_platform - The desired platform
   *
   * @returns {T} A self reference
   */
  forBrowser(name: string, opt_version?: string, opt_platform?: string): T {
    this.seleniumBuilder.forBrowser(name, opt_version, opt_platform);
    return this.typedSelf;
  }

  /**
   * Sets the proxy configuration for the target browser.
   *
   * @param {Object | Capabilities} capabilities - The desired capabilities for a new session
   *
   * @returns {T} A self reference
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  withCapabilities(capabilities: Object | Capabilities): T {
    this.seleniumBuilder.withCapabilities(capabilities);
    return this.typedSelf;
  }

  /**
   * Sets TestProject development token.
   *
   * @param {string} token - The developer token.
   *
   * @returns {T} A self reference
   */
  withToken(token: string): T {
    this.token = token;
    return this.typedSelf;
  }

  /**
   * Sets the address of a TestProject Agent.
   *
   * @param {string} remoteAgent - Agent remote address.
   *
   * @returns {T} A self reference.
   */
  withRemoteAgent(remoteAgent: string): T {
    this.remoteAgent = remoteAgent;
    return this.typedSelf;
  }

  /**
   * Sets project name for the report.
   *
   * @param {string} projectName - Set project name.
   *
   * @returns {T} A self reference.
   */
  withProjectName(projectName: string): T {
    const trimedName = projectName.trim();

    if (!trimedName) {
      throw new customExceptions.InvalidArgumentException('When using withProjectName method you must pass a value');
    }

    this.projectName = trimedName;
    return this.typedSelf;
  }

  /**
   * Sets job name for the report.
   *
   * @param {string} jobName - Set job name.
   *
   * @returns {T} A self reference.
   */
  withJobName(jobName: string): T {
    const trimedName = jobName.trim();

    if (!trimedName) {
      throw new customExceptions.InvalidArgumentException('When using withJobName method you must pass a value');
    }

    this.jobName = trimedName;
    return this.typedSelf;
  }

  /**
   * Sets the report types that the Agent should generate.
   *
   * @param {ReportType} reportType The type of the report.
   *
   * @returns {T} A self reference.
   */
  withReportType(reportType: ReportType): T {
    this.reportType = reportType;
    return this.typedSelf;
  }

  /**
   * Override the default local report name (timestamp based).
   *
   * @param {ReportType} reportName The requested name of the report file.
   *
   * @returns {T} A self reference.
   */
  withReportName(reportName: string): T {
    this.reportName = reportName;
    return this.typedSelf;
  }

  /**
   * Override the default local report path.
   *
   * @param {ReportType} reportName The requested path for storing local reports.
   *
   * @returns {T} A self reference.
   */
  withReportPath(reportPath: string): T {
    this.reportPath = reportPath;
    return this.typedSelf;
  }

  /**
   * Sets the option to disable TestProject reporting.
   *
   * @param {boolean} disableReporting - True for disable otherwise false.
   *
   * @returns {T} A self reference.
   */
  setDisableReporting(disableReporting: boolean): T {
    this.disableReporting = disableReporting;
    return this.typedSelf;
  }

  /**
   * Configures this builder to ignore any environment variable overrides and to
   * only use the configuration specified through this instance's API.
   *
   * @returns {T} A self reference.
   */
  disableEnvironmentOverrides(): T {
    this.seleniumBuilder.disableEnvironmentOverrides();
    return this.typedSelf;
  }

  /**
   * Sets Chrome specific options for drivers created by this builder.
   *
   * @param {ChromeOptions} options - chrome options.
   *
   * @returns {T} A self reference.
   */
  setChromeOptions(options: ChromeOptions): T {
    this.chromeOptions = options;
    this.seleniumBuilder.setChromeOptions(options);
    return this.typedSelf;
  }

  /**
   * Sets whether native events should be used.
   *
   * @param {boolean} enabled - Whether to enable native events.
   *
   * @returns {T} A self reference.
   */
  setEnableNativeEvents(enabled: boolean): T {
    this.seleniumBuilder.setEnableNativeEvents(enabled);
    return this.typedSelf;
  }

  /**
   * Sets Safari specific options for drivers created by this builder.
   *
   * @param {SafariOptions} options - Safari options.
   *
   * @returns {T} A self reference.
   */
  setSafariOptions(options: SafariOptions): T {
    this.seleniumBuilder.setSafariOptions(options);
    return this.typedSelf;
  }

  /**
   * Sets how elements should be scrolled into view for interaction.
   *
   * @param {number} behavior - The desired scroll behavior: either 0 to align with the top
   * of the viewport or 1 to align with the bottom.
   *
   * @returns {T} A self reference.
   */
  setScrollBehavior(behavior: number): T {
    this.seleniumBuilder.setScrollBehavior(behavior);
    return this.typedSelf;
  }

  /**
   * Add TestProject specific capabilities.
   */
  protected addTestProjectCapabilities(): void {
    const capabilities = this.seleniumBuilder.getCapabilities();

    // Set the capability is the value is valid
    const setTPCapability = (cap: TestProjectCapabilities, value: unknown): void => {
      if (value) {
        capabilities.set(cap, value);
      }
    };

    // Add custom properties to capabilities
    setTPCapability(TestProjectCapabilities.DEVELOPMENT_TOKEN, this.token);
    setTPCapability(TestProjectCapabilities.REMOTE_AGENT_ADDRESS, this.remoteAgent);
    setTPCapability(TestProjectCapabilities.PROJECT_NAME, this.projectName);
    setTPCapability(TestProjectCapabilities.JOB_NAME, this.jobName);
    setTPCapability(TestProjectCapabilities.DISABLE_REPORTS, this.disableReporting);
    setTPCapability(
      TestProjectCapabilities.REPORT_TYPE,
      this.reportType ? ReportType[this.reportType] : ReportType.CLOUD_AND_LOCAL
    );
    setTPCapability(TestProjectCapabilities.REPORT_NAME, this.reportName);
    setTPCapability(TestProjectCapabilities.REPORT_PATH, this.reportPath);

    // Update the capabilities
    this.seleniumBuilder.withCapabilities(capabilities);
  }

  /**
   * Creates a new driver based on this builder's current configuration.
   *
   * @returns {D} A new Driver instance.
   */
  abstract build(): D;
}
