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
import { IPayLoadDriverCommandReport } from '../../interfaces/iPayLoadDriverCommandReport';

/**
 * Payload object sent to the Agent when reporting a driver command.
 *
 * @property {Command} command - The name of the command that was executed
 * @property {unknown | undefined} result - The result of the command that was executed
 * @property {boolean} passed - Indication whether or not command execution was performed successfully
 * @property {string} screenshot - Screenshot as base64 encoded string
 */
export default class DriverCommandReport {
  constructor(
    private command: Command,
    private result: unknown | undefined,
    private passed: boolean,
    private screenshot?: string
  ) {}

  /**
   * Creates a JSON representation of the current DriverCommandReport instance.
   *
   * @returns {IPayLoadDriverCommandReport}
   */
  public ToJson(): IPayLoadDriverCommandReport {
    const payload: {
      commandName: string;
      commandParameters: unknown;
      result: unknown;
      passed: boolean;
      screenshot?: string;
    } = {
      commandName: this.command.getName(),
      commandParameters: this.command.getParameters(),
      result: this.result,
      passed: this.passed,
    };

    // Add screenshot to report if it is provided
    if (this.screenshot) {
      payload.screenshot = this.screenshot;
    }

    return payload;
  }
}
