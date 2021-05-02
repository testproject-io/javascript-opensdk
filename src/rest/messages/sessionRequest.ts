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

import ISessionRequest from '../../interfaces/ISessionRequest';
import ConfigHelper from '../../sdk/internal/helpers/configHelper';
import ReportSettings from '../reportSettings';

/**
 * Represent a request message object to be sent to the Agent to initialize a new session
 * @property {string} language Test code language (Nodejs, obviously)
 * @property {string} sdkVersion Current Nodejs SDK version
 * @property {ReportSettings} reportSettings Report settings
 * @property {Capabilities} capabilities Desired session capabilities
 */

export default class SessionRequest {
  private language = 'Nodejs';

  private sdkVersion = ConfigHelper.sdkVersion();

  constructor(private reportSettings: ReportSettings, private capabilities: Capabilities) {}

  /**
   * Capabilities as object.
   *
   * @returns {Map<string, unknown>}
   */
  private capsAsObject(): Map<string, unknown> {
    // Disabling linting to allow the following ugly object mangling
    /* eslint-disable */
    const caps = this.capabilities as any;

    const m: any = {};
    caps.map_.forEach((value: string, key: string) => {
      // Filter out TestProject specific capabilities
      if (!key.startsWith('_tp')) {
        m[key] = value;
      }
    });

    return m;
    /* eslint-enable */
  }

  /**
   * SessionRequest to JSON.
   *
   * @returns {ISessionRequest}
   */
  public toObject(): ISessionRequest {
    return {
      language: this.language,
      sdkVersion: this.sdkVersion,
      capabilities: this.capsAsObject(),
      projectName: this.reportSettings.projectName,
      jobName: this.reportSettings.jobName,
      reportType: this.reportSettings.reportType,
      reportName: this.reportSettings.reportName,
      reportPath: this.reportSettings.reportPath,
    };
  }
}
