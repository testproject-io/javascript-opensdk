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
 * Contains settings to be used in the report.
 *
 * @property {string} projectName - Project name to report
 * @property {string} jobName - Job name to report
 * @property {string} reportType - Report type (Cloud, Local or Both)
 * @property {string} reportName - Custom local report file name
 * @property {string} reportPath - Custom local report path
 */
export default class ReportSettings {
  constructor(
    public projectName: string = '',
    public jobName: string = '',
    public reportType: string = '',
    public reportName: string = '',
    public reportPath: string = ''
  ) {}
}
