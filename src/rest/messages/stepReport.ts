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

import { Guid } from 'guid-typescript';

/**
 * Payload object sent to the Agent when reporting a test step.
 * @property {string} description - The step description
 * @property {string} message - A message that goes with the step
 * @property {boolean} passed - True if the step should be marked as passed, False otherwise
 * @property {string} screenshot - A base64 encoded screenshot that is associated with the step
 */
export default class StepReport {
  // Generate a random step guid
  public readonly guid = Guid.create().toString();

  constructor(
    public readonly description: string,
    public readonly message: string,
    public readonly passed: boolean,
    public readonly screenshot?: string
  ) {}

  /**
   * StepReport to JSON.
   *
   * @returns { guid: string; description: string; message: string; passed: boolean; screenshot?: string }
   */
  public toJson(): { guid: string; description: string; message: string; passed: boolean; screenshot?: string } {
    return {
      guid: this.guid,
      description: this.description,
      message: this.message,
      passed: this.passed,
      screenshot: this.screenshot ?? undefined,
    };
  }
}
