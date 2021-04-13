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

import logger from '../../../logger/logger';
import CustomTestReport from '../../../rest/messages/customTestReport';
import StepReport from '../../../rest/messages/stepReport';
import CustomCommandExecutor from '../helpers/customCommandExecutor';
import ReportHelper from '../helpers/reportHelper';

/**
 * Exposes reporting actions to the WebDriver object.
 *
 * @property {CustomCommandExecutor} - The command executor used to send Selenium WebDriver commands
 */
export default class Reporter {
  constructor(private customCommandExecutor: CustomCommandExecutor) {}

  /**
   * Sends a step report to the Agent Client.
   *
   * @param {string} description - The step description
   * @param {string} message - A message that goes with the step
   * @param {boolean} passed - True if the step should be marked as passed, False otherwise
   * @param {boolean} screenshot - True if take a screenshot, False otherwise
   *
   * @returns {Promise<void>}
   */
  public async step(description: string, message: string, passed: boolean, screenshot?: boolean): Promise<void> {
    // First update the current test name and report a test if necessary
    this.customCommandExecutor.updateKnownTestName();
    if (this.customCommandExecutor.disableReports) {
      logger.debug(`Step ${description} ${passed ? 'passed' : 'failed'}`);
      return;
    }

    // Take a screenshot if requested
    let screenshotData: string | undefined;
    if (screenshot) {
      screenshotData = (await this.customCommandExecutor.createScreenshot()) as string;
    }

    const stepReport = new StepReport(description, message, passed, screenshotData);
    this.customCommandExecutor.agentClient.reportStep(stepReport);
  }

  /**
   * Sends a test report to the Agent Client.
   *
   * @param {string} name - The test name
   * @param {boolean} passed - True(default) if the test should be marked as passed, False otherwise
   * @param {string} message - A message that goes with the test
   *
   * @returns {void}
   */
  public test(name?: string, passed = true, message?: string): void {
    if (!this.customCommandExecutor.disableReports) {
      const testName = name ?? ReportHelper.inferTestName();
      if (!this.customCommandExecutor.disableAutoTestReports) {
        const envFlag = process.env.RFW_SUPPRESS_WARNINGS;
        const convertedValue = envFlag && (envFlag === 'true' || envFlag === 'false') ? envFlag === 'true' : undefined;
        if (convertedValue) {
          logger.warn(
            'Automatic reporting is enabled, disable this using disable_reports flag\nwhen creating a driver instance to avoid duplicates in the report'
          );
        }
      }

      const testReport = new CustomTestReport(testName, passed, message);
      this.customCommandExecutor.agentClient.reportTest(testReport);
    }
  }

  /**
   * Disable auto reports
   *
   * @param {boolean} disabled - True for disable auto reports
   *
   * @returns {void}
   */
  public disableAutoTestReports(disabled: boolean): void {
    this.customCommandExecutor.disableAutoTestReports = disabled;
  }
}
