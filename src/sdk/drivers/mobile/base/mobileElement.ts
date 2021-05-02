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

import { Client } from 'webdriver';

import { SeleniumCommandName } from '../../../internal/helpers/seleniumHelper';
import MobileCommandsReporter from '../../../internal/helpers/mobileCommandsReporter';

export default class MobileElement {
  constructor(
    private driverClient: Client,
    private commandsReporter: MobileCommandsReporter,
    readonly using: string,
    readonly value: string,
    readonly id: string
  ) {}

  /**
   * Is Element Enabled determines if the referenced element is enabled or not.
   * This operation only makes sense on form controls.
   *
   * @returns {boolean} true if enabled or false otherwise
   * @ref https://w3c.github.io/webdriver/#dfn-is-element-enabled
   */
  public async isEnabled(): Promise<boolean> {
    return this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.IS_ELEMENT_ENABLED,
      this.id,
      this.driverClient.isElementEnabled.bind(this.driverClient, this.id)
    );
  }

  /**
   * Determines if the referenced element is selected or not.
   * This operation only makes sense on input elements of the Checkbox and Radio Button states, or option elements.
   *
   * @returns {boolean} true if enabled or false otherwise
   * @ref https://w3c.github.io/webdriver/#dfn-is-element-selected
   */
  public async isSelected(): Promise<boolean> {
    return this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.IS_ELEMENT_SELECTED,
      this.id,
      this.driverClient.isElementSelected.bind(this.driverClient, this.id)
    );
  }

  /**
   * Determines the visibility of an element which is guided by what is perceptually visible to the human eye.
   * In this context, an element's `displayedness` does not relate to the `visibility` or `display` style properties.
   *
   * @returns {boolean} true if enabled or false otherwise
   * @ref https://w3c.github.io/webdriver/#element-displayedness
   */
  public async isDisplayed(): Promise<boolean> {
    return this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.IS_ELEMENT_DISPLAYED,
      this.id,
      this.driverClient.isElementDisplayed.bind(this.driverClient, this.id)
    );
  }

  /**
   * Return the requested attribute value of a web element.
   *
   * @param {string} attr Attribute name
   * @returns {string} Attribute value
   * @ref https://w3c.github.io/webdriver/#dfn-get-element-attribute
   */
  public async getAttribute(attr: string): Promise<string> {
    return this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.GET_ELEMENT_ATTRIBUTE,
      this.id,
      this.driverClient.getElementAttribute.bind(this.driverClient, this.id, attr)
    );
  }

  /**
   * Return an element’s text "as rendered".
   * An element's rendered text is also used for locating a elements by their link text and partial link text.
   *
   * @returns {string} Element's text
   * @ref https://w3c.github.io/webdriver/#dfn-get-element-text
   */
  public async getText(): Promise<string> {
    return this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.GET_ELEMENT_TEXT,
      this.id,
      this.driverClient.getElementText.bind(this.driverClient, this.id)
    );
  }

  /**
   * Scrolls into view the form control element and then sends the provided keys to the element.
   * In case the element is not keyboard-interactable, an element not interactable error is returned.
   * The key input state used for input may be cleared mid-way through "typing" by sending the null key, which is U+E000 (NULL).
   *
   * @param {string} value String representing the keys for sending to the element.
   * @ref https://w3c.github.io/webdriver/#dfn-element-send-keys
   *
   */
  public async sendKeys(value: string): Promise<void> {
    await this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.SEND_KEYS_TO_ELEMENT,
      this.id,
      this.driverClient.elementSendKeys.bind(this.driverClient, this.id, value)
    );
  }

  /**
   * Scrolls into view an editable or resettable element and then attempts to clear its selected files or text content.
   *
   * @ref https://w3c.github.io/webdriver/#dfn-element-clear
   */
  public async clear(): Promise<void> {
    await this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.CLEAR_ELEMENT,
      this.id,
      this.driverClient.elementClear.bind(this.driverClient, this.id)
    );
  }

  /**
   * Scrolls into view the element if it is not already pointer-interactable, and clicks its in-view center point.
   * If the element's center point is obscured by another element, an element click intercepted error is returned.
   * If the element is outside the viewport, an element not interactable error is returned.
   *
   * @ref https://w3c.github.io/webdriver/#dfn-element-click
   */
  public async click(): Promise<void> {
    await this.commandsReporter.reportElementCommandWrapper(
      SeleniumCommandName.CLICK_ELEMENT,
      this.id,
      this.driverClient.elementClick.bind(this.driverClient, this.id)
    );
  }
}
