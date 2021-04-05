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

import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { error, By, Capabilities } from 'selenium-webdriver';

import LoginPage from '../../pageobjects/web/loginPage';
import ProfilePage from '../../pageobjects/web/profilePage';

import ConfigHelper from '../../../src/sdk/internal/helpers/configHelper';
import ThenableBaseDriver from '../../../src/sdk/drivers/base/thenableBaseDriver';
import Builder from '../../../src/sdk/drivers/builder';

// Chai Promise extensions
chai.use(chaiAsPromised);

describe('test basic flow', () => {
  let driver: ThenableBaseDriver;
  let login: LoginPage;

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

  it('should login and check if greeting displayed', async () => {
    login = new LoginPage(driver);
    await login.OpenUrl();
    await login.LoginAs('John Smith', '12345');
    assert.equal(await new ProfilePage(driver).GreetingsAreDisplayed(), true);
  });

  it('should fail finding #does_not_exist', async () => {
    login = new LoginPage(driver);
    await login.OpenUrl();
    await login.LoginAs('John Smith', '12345');
    assert.equal(await new ProfilePage(driver).GreetingsAreDisplayed(), true);
    await expect(driver.findElement(By.css('#does_not_exist'))).to.eventually.be.rejectedWith(error.NoSuchElementError);
  });
});
