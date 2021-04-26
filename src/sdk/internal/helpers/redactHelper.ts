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

import { Command } from 'selenium-webdriver';

// eslint-disable-next-line import/no-cycle
import CustomCommandExecutor from './seleniumCommandExecutor';
import { SeleniumHelper, SeleniumCommandName } from './seleniumHelper';

/**
 * Class providing helper methods for command redaction
 *
 * @property {CustomCommandExecutor} customCommandExecutor The command executor used to send Selenium WebDriver commands
 */
export default class RedactHelper {
  constructor(private customCommandExecutor: CustomCommandExecutor) {}

  /**
   * Redacts sensitive contents (passwords) so they do not appear in the reports.
   *
   * @param {Command} command - A string specifying the command to execute.
   *
   * @returns {unknown} A redacted version of the dictionary, where password values are replaced by.
   */
  public async redactCommand(command: Command): Promise<unknown> {
    const commandName = command.getName();
    if (
      commandName === SeleniumCommandName.SEND_KEYS_TO_ELEMENT ||
      commandName === SeleniumCommandName.SEND_KEYS_TO_ACTIVE_ELEMENT
    ) {
      const elementId = (await command.getParameter('id')) as string | undefined;

      if (!elementId) {
        return command.getParameters() as unknown;
      }
      const redactionRequired = await this.redactionRequired(elementId);
      if (!redactionRequired) {
        return command.getParameters() as unknown;
      }

      command.setParameter('text', '***');
      command.setParameter('value', ['*', '*', '*']);
    }

    return command.getParameters() as unknown;
  }

  /**
   * Checks if the element should be redacted.
   *
   * @param {string} elementId - The ID of the element under investigation.
   *
   * @returns {Promise<boolean>} True if the element should be redacted, False otherwise
   */
  private async redactionRequired(elementId: string): Promise<boolean> {
    const platformName = this.customCommandExecutor.agentClient.capabilities.get('platformName') as string;
    const browserName = this.customCommandExecutor.agentClient.capabilities.get('browserName') as string;

    // Check if element is a mobile password element
    if (platformName === 'android') {
      // Check that we're not dealing with mobile web
      if (!browserName) {
        return this.isAndroidPasswordElement(elementId);
      }
    }

    const isSecured = await this.isSecuredElement(elementId);
    return isSecured;
  }

  /**
   * Checks if the element is an Android password element.
   *
   * @param {string} elementId - The ID of the element under investigation.
   *
   * @returns {Promise<boolean>} True if the element is an Android password element, False otherwise.
   */
  private async isAndroidPasswordElement(elementId: string): Promise<boolean> {
    const newCommand = SeleniumHelper.buildSeleniumCommand(SeleniumCommandName.GET_ELEMENT_ATTRIBUTE)
      .setParameter('id', elementId)
      .setParameter('sessionId', this.customCommandExecutor.sessionId)
      .setParameter('name', 'password');

    const getAttributeResponse = await this.customCommandExecutor.execute(newCommand, true);

    return getAttributeResponse && getAttributeResponse instanceof String
      ? getAttributeResponse.toLowerCase() === 'true'
      : false;
  }

  /**
   * Checks if the element is a secured element (an HTML or iOS password element).
   *
   * @param {string} elementId - The ID of the element under investigation.
   *
   * @returns {Promise<boolean>} True if the element is a secured element, False otherwise.
   */
  private async isSecuredElement(elementId: string): Promise<boolean> {
    const command = SeleniumHelper.buildSeleniumCommand(SeleniumCommandName.GET_ELEMENT_ATTRIBUTE)
      .setParameter('sessionId', this.customCommandExecutor.sessionId)
      .setParameter('id', elementId)
      .setParameter('name', 'type');

    const getAttributeResponse = await this.customCommandExecutor.execute(command, true);
    return getAttributeResponse
      ? ['password', 'XCUIElementTypeSecureTextField'].indexOf(getAttributeResponse as string) >= 0
      : false;
  }
}
