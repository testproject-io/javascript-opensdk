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
 * Agent session request arguments
 */
export default interface ISessionRequest {
  /**
   * @member {string} language - Test code language (Nodejs, obviously)
   */
  language: string;

  /**
   * @member {string} projectName - The project name
   */
  projectName: string;

  /**
   * @member {string} jobName - The job name
   */
  jobName: string;

  /**
   * @member {unknown} capabilities - The capabilities
   */
  capabilities: unknown;

  /**
   * @member {string} sdkVersion - The SDK version
   */
  sdkVersion: string;

  /**
   * @member {string} reportType - Where to send the report
   */
  reportType: string;

  /**
   * @member {string} reportName - Custom local report name
   */
  reportName: string;

  /**
   * @member {string} reportPath - Custom local report path
   */
  reportPath: string;
}
