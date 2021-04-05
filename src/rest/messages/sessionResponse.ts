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
 * Represent a response message object returned by the Agent when initializing a new session.
 *
 * @property {number} devSocketPort - The developer socket port
 * @property {string} serverAddress - The Agent address
 * @property {string} sessionId - Unique identifier for the current development session
 * @property {string} dialect - Indicates the WebDriver dialect (W3C or OSS)
 * @property {Capabilities} capabilities - Desired session capabilities
 * @property {string} version - Agent version, required to check backwards compatibility
 */
export default class SessionResponse {
  public devSocketPort = 0;

  public serverAddress = '';

  public sessionId = '';

  public dialect = '';

  public capabilities = new Capabilities();

  public agentVersion = '';
}
