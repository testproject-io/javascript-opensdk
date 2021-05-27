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

import { assert } from 'chai';
import { Capabilities } from 'selenium-webdriver';
import ReportType from '../../../../../src/enums/reportType';

import SessionRequest from '../../../../../src/rest/messages/sessionRequest';
import ReportSettings from '../../../../../src/rest/reportSettings';

describe('test sessionrequest to json', () => {
  it('Should return json', () => {
    const sdkVersion = { sdkVersion: '1.2.3.4' }; // # mock the response to get_sdk_version() as this will change over time
    const capabilities: Capabilities = new Capabilities().set('param', 'value');
    const reportSettings = new ReportSettings(
      'my_project',
      'my_job',
      ReportType[ReportType.CLOUD_AND_LOCAL],
      'My Report',
      '/dummy/path'
    );
    const sessionRequest = new SessionRequest(reportSettings, capabilities);
    assert.deepEqual(
      { ...sessionRequest.toObject(), ...sdkVersion },
      {
        language: 'Nodejs',
        projectName: 'my_project',
        jobName: 'my_job',
        capabilities: { param: 'value' },
        sdkVersion: '1.2.3.4',
        reportType: ReportType[ReportType.CLOUD_AND_LOCAL] as string,
        reportName: 'My Report',
        reportPath: '/dummy/path',
      }
    );
  });
});
