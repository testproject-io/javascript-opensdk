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
import { Options } from 'selenium-webdriver/firefox';
import { Capabilities } from 'selenium-webdriver';

import LoginPage from './pageobjects/loginPage';
import ProfilePage from './pageobjects/profilePage';

import ConfigHelper from '../../../../src/sdk/internal/helpers/configHelper';
import { Builder, ThenableBaseDriver } from '../../../../src/index';

describe('Test firefoxbasic login and update profile', () => {
  let driver: ThenableBaseDriver;
  let login: LoginPage;
  let profilePage: ProfilePage;

  beforeEach(() => {
    const firefoxOptions = new Options();
    firefoxOptions.headless();
    driver = new Builder()
      .forBrowser('firefox')
      .withToken(ConfigHelper.developerToken())
      .withCapabilities(Capabilities.firefox())
      .withProjectName('CI - Nodejs')
      .setFirefoxOptions(firefoxOptions)
      .build();
  });

  afterEach(async () => {
    await driver.quit();
  });

  it('should return success if update profile succeeds', async () => {
    login = new LoginPage(driver);
    await login.OpenUrl();
    await login.LoginAs('John Smith', '12345');
    profilePage = new ProfilePage(driver);
    await profilePage.UpdateProfile('Australia', 'Main Street 123', 'john@smith.org', '+1987654321');
    assert.equal(await profilePage.SavedMessageIsDisplayed(), true);
  });
});
