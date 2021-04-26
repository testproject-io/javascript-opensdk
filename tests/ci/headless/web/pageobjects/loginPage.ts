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

import { By } from 'selenium-webdriver';

import { ThenableBaseDriver } from '../../../../../src/index';

export default class LoginPage {
  url = 'https://example.testproject.io/web/';

  textfield_name = '#name';

  textfield_password = '#password';

  button_dologin = '#login';

  driver: ThenableBaseDriver;

  constructor(driver: ThenableBaseDriver) {
    this.driver = driver;
  }

  public async OpenUrl(): Promise<void> {
    await this.driver.get(this.url);
  }

  public async LoginAs(username: string, password: string): Promise<void> {
    await this.driver.findElement(By.css(this.textfield_name)).sendKeys(username);
    await this.driver.findElement(By.css(this.textfield_password)).sendKeys(password);
    await this.driver.findElement(By.css(this.button_dologin)).click();
  }
}
