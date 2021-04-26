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

import logger from '../../../../../src/logger/logger';
import { ThenableBaseDriver } from '../../../../../src/index';

export default class ProfilePage {
  textlabel_greetings = '#greetings';

  textlabel_saved = '.tp-saved';

  dropdown_country = '#country';

  textfield_address = '#address';

  textfield_email = '#email';

  textfield_phone = '#phone';

  button_save = '#save';

  button_logout = '#logout';

  driver: ThenableBaseDriver;

  constructor(driver: ThenableBaseDriver) {
    this.driver = driver;
  }

  public async GreetingsAreDisplayed(): Promise<boolean> {
    const result = await this.driver.findElement(By.css(this.textlabel_greetings)).isDisplayed();
    return result;
  }

  public async SavedMessageIsDisplayed(): Promise<boolean> {
    const result = await this.driver.findElement(By.css(this.textlabel_saved)).isDisplayed();
    return result;
  }

  public async UpdateProfile(country: string, address: string, email: string, phone: string): Promise<void> {
    const dropdown = await this.driver.findElement(By.css(this.dropdown_country));
    await dropdown.sendKeys(country).catch((err) => {
      logger.error(err);
    });
    await this.driver
      .findElement(By.css(this.textfield_address))
      .sendKeys(address)
      .catch((err) => {
        logger.error(err);
      });

    await this.driver
      .findElement(By.css(this.textfield_email))
      .sendKeys(email)
      .catch((err) => {
        logger.error(err);
      });

    await this.driver
      .findElement(By.css(this.textfield_phone))
      .sendKeys(phone)
      .catch((err) => {
        logger.error(err);
      });

    await this.driver
      .findElement(By.css(this.button_save))
      .click()
      .catch((err) => {
        logger.error(err);
      });
  }

  public async LogOut(): Promise<void> {
    await this.driver.findElement(By.css(this.button_save)).click();
  }
}
