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

import { WebDriver, Capabilities } from 'selenium-webdriver';

import CustomHttpCommandExecutor from '../../internal/helpers/customCommandExecutor';
import Reporter from '../../internal/reporter/reporter';
import IReportingDriver from './reportingDriver';

export default class BaseDriver extends WebDriver implements IReportingDriver {
  private static executer: CustomHttpCommandExecutor;

  private reporter!: Reporter;

  static createSession(caps: Capabilities): BaseDriver {
    const customCommandExecutor = new CustomHttpCommandExecutor(caps);
    BaseDriver.executer = customCommandExecutor;

    return super.createSession(customCommandExecutor, caps) as BaseDriver;
  }

  /**
   * Returns an object that has the option to create custom test and report
   * @returns {Reporter} - Instance of the TestProject Reporter
   */
  report(): Reporter {
    // Create new reporter instance if doesn't exists
    if (!this.reporter) {
      this.reporter = new Reporter(BaseDriver.executer);
    }

    return this.reporter;
  }
}
