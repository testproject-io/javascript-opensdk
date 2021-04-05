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

import { Capabilities } from 'selenium-webdriver';

/**
 * Object representing the current Agent session
 * @property {string} remoteAddress - The Agent address
 * @property {string} sessionId - A unique identifier for the current Agent session
 * @property {string} dialect - The WebDriver dialect associated with the session (W3C or OSS)
 * @property {any} capabilities - driver-specific capabilities
 */
export default class AgentSession {
  constructor(
    public remoteAddress: string,
    public sessionId: string,
    public dialect: string,
    public capabilities: Capabilities
  ) {}
}
