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
 * Helper class representing an item to be reported.
 *
 * @property {unknown} reportAsJson - JSON payload representing the item to be reported
 * @property {string} url - Agent endpoint the payload should be POSTed to
 * @property {string} token - Token used to authenticate with the Agent
 * @property {string} endPoint - Agent client endpoint
 */
export default class QueueItem {
  constructor(
    public reportAsJson: unknown,
    public url: string,
    public token: string | undefined,
    public endPoint: string
  ) {}
}
