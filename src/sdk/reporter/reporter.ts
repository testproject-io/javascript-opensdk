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

import logger from '../../logger/logger';
import CustomTestReport from '../../rest/messages/customTestReport';
import StepReport from '../../rest/messages/stepReport';
import AgentClient from '../internal/agent/agentClient';
import ReportHelper from '../internal/helpers/reportHelper';

// Driver function for taking screenshots
type GetScreenshot = () => Promise<string>;

/**
 * Exposes reporting actions to the WebDriver object.
 */
export default class Reporter {
  /**
   * Enables or disables all types of reports.
   */
  public disableReports = false;

  /**
   * Enables or disables driver commands reporting.
   */
  public disableCommandReports = false;

  /**
   * Enables or disables automatic test reporting.
   */
  public disableTestAutoReports = false;

  constructor(private agentClient: AgentClient, private getScreenshot: GetScreenshot) {
    const disableAutoReports = process.env.TP_DISABLE_AUTO_REPORTS;

    // Check if automatic test and driver command reports should be disabled
    if (disableAutoReports && disableAutoReports.toLowerCase() === 'true') {
      this.disableTestAutoReports = true;
      this.disableCommandReports = true;
    }
  }

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
    if (this.disableReports) {
      logger.debug(`Step ${description} ${passed ? 'passed' : 'failed'}`);
      return;
    }

    // Take a screenshot if requested
    let screenshotData: string | undefined;
    if (screenshot) {
      try {
        // Do not report the screenshot command
        this.disableCommandReports = true;
        screenshotData = await this.getScreenshot();
      } finally {
        this.disableCommandReports = false;
      }
    }

    const stepReport = new StepReport(description, message, passed, screenshotData);
    this.agentClient.reportStep(stepReport);
  }

  /**
   * Sends a test report to the Agent Client.
   *
   * @param {string} name - The test name
   * @param {boolean} passed - True (default) if the test should be marked as passed, False otherwise
   * @param {string} message - A message that goes with the test
   *
   * @returns {void}
   */
  public test(name?: string, passed = true, message?: string): void {
    if (!this.disableReports) {
      const testName = name ?? ReportHelper.inferTestName();
      const testReport = new CustomTestReport(testName, passed, message);

      this.agentClient.reportTest(testReport);
    }
  }
}
