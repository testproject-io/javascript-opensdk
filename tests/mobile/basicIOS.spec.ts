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

import { By, Capabilities } from 'selenium-webdriver';

import logger from '../../src/logger/logger';
import IOSDriver from '../../src/sdk/drivers/mobile/iosDriver';
import MobileBuilder from '../../src/sdk/drivers/mobileBuilder';

describe.skip('Basic iOS Test', () => {
  let driver: IOSDriver;

  beforeEach(async () => {
    driver = await new MobileBuilder(IOSDriver)
      .withCapabilities(
        new Capabilities({
          udid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
          app: 'demo-sim.ipa',
          bundleId: 'io.testproject.Demo',
        })
      )
      .build();
  });

  afterEach(async () => {
    await driver?.quit();
  });

  it('Login and Logout', async () => {
    const name = await driver.findElement(By.id('name'));
    await name.sendKeys('Some Name');
    await name.clear();
    await name.sendKeys('John Smith');

    const pass = await driver.findElement(By.id('password'));
    await pass.sendKeys('12345');

    const login = await driver.findElement(By.id('login'));
    logger.debug(`login button enabled: ${(await login.isEnabled()) ? 'true' : 'false'}`);
    await login.click();

    // Hide the keyboard
    await driver.hideKeyboard();

    const logout = await driver.findElement(By.id('logout'));
    await logout.click();

    // await driver.takeScreenshot();
    // await driver.report().step('Custom Step Report', 'Some Message', true, true);
  });
});
