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

import LoginPage from '../../pageobjects/web/loginPage';

import logger from '../../../src/logger/logger';
import ConfigHelper from '../../../src/sdk/internal/helpers/configHelper';
import ThenableBaseDriver from '../../../src/sdk/drivers/base/thenableBaseDriver';
import Builder from '../../../src/sdk/drivers/builder';

describe('Test is reported as passed', () => {
  let driver: ThenableBaseDriver;
  let login: LoginPage;
  let title: string;

  beforeEach(() => {
    driver = new Builder()
      .forBrowser('chrome')
      .withToken(ConfigHelper.developerToken())
      .withCapabilities(Capabilities.chrome())
      .build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it('Should pass test', async () => {
    login = new LoginPage(driver);
    await login.OpenUrl();
    await login.LoginAs('John Smith', '12345');
    title = await driver.getTitle();
    try {
      assert.equal(title, 'Incorrect Title'); // This assertion fails and will be reported
    } catch (error) {
      logger.error(error instanceof Error ? error.message : '');
    }
  });
});
