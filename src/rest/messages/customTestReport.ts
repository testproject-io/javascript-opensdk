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

/**
 * Payload object sent to the Agent when reporting a test.
 *
 * @property {string} name - The test name
 * @property {boolean} passed - True if the test should be marked as passed, False otherwise
 * @property {string} message - A message that goes with the test
 */

export default class CustomTestReport {
  constructor(public name: string, public passed: boolean, public message?: string) {}

  /**
   * Generates a json representation of the test payload.
   *
   * @returns {name: string; passed: boolean; message: string | undefined}
   */
  public toJson(): { name: string; passed: boolean; message: string | undefined } {
    return {
      name: this.name,
      passed: this.passed,
      message: this.message,
    };
  }
}
