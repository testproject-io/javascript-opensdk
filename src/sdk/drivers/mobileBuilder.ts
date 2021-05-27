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
import MobileDriver from './mobile/base/mobileDriver';
import SessionResponse from '../../rest/messages/sessionResponse';
import AgentClient from '../internal/agent/agentClient';

export default class MobileBuilder<T extends MobileDriver> extends BaseBuilder<MobileBuilder<T>, Promise<T>> {
  constructor(private DriverType: new (sessionResponse: SessionResponse, agentClient: AgentClient) => T) {
    super();
  }

  /**
   * Builds a mobile driver.
   *
   * @returns {Promise<T>} Promise to a MobileDriver instance.
   */
  async build(): Promise<T> {
    // Add TP specific capabilities based on the user "with" calls
    this.addTestProjectCapabilities();

    // Assume that the specific MobileDriver child class has a static `createSession` method.
    // Call this method to create the specific session

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (this.DriverType.createSession(this.seleniumBuilder.getCapabilities()) as unknown) as Promise<T>;
  }
}
