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

import ReportType from '../../enums/reportType';
import ISessionRequest from '../../interfaces/ISessionRequest';
import ConfigHelper from '../../sdk/internal/helpers/configHelper';
import ReportSettings from '../reportSettings';

/**
 * Represent a request message object to be sent to the Agent to initialize a new session
 * @property {string} language - Test code language (Nodejs, obviously)
 * @property {string} sdkVersion - Current Nodejs SDK version
 * @property {Capabilities} capabilities - Desired session capabilities
 * @property {string} projectName - Project name to report
 * @property {string} jobName - Job name to report
 */

export default class SessionRequest {
  private language = 'Nodejs';

  private sdkVersion = ConfigHelper.sdkVersion();

  private capabilities: Capabilities;

  private projectName = '';

  private jobName = '';

  constructor(reportSettings: ReportSettings, capabilities?: Capabilities) {
    if (reportSettings !== undefined) {
      this.projectName = reportSettings.projectName;
      this.jobName = reportSettings.jobName;
    }

    if (capabilities === undefined) {
      this.capabilities = new Capabilities();
    } else {
      this.capabilities = capabilities;
    }
  }

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
      m[key] = value;
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
      projectName: this.projectName,
      jobName: this.jobName,
      reportType: (this.capabilities.get('reportType') as string) || (ReportType[ReportType.CLOUD_AND_LOCAL] as string),
    };
  }
}
