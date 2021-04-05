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

import { Command, ICommandName } from 'selenium-webdriver';

import ElementSearchCriteria from '../../../classes/elementSearchCriteria';
import FindByType from '../../../enums/findByType';
import LocatorBy from '../../../enums/locatorBy';
import tpExceptions from '../../exceptions';

// Require the selenium command js file directly, as the command names are not exported correctly
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const SeleniumCommandNamespace = require('selenium-webdriver/lib/command.js');

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const SeleniumCommandName = SeleniumCommandNamespace.Name as ICommandName;

/**
 * Contains helper methods for Selenium actions, mostly locator-related
 */
export class SeleniumHelper {
  /**
   * Translator method to create element search criteria to send to the Agent.
   *
   * @param {LocatorBy | undefined} by - The element locator strategy to be used
   * @param {string} byValue - The associated element locator strategy value
   *
   * @returns {ElementSearchCriteria}
   */
  public static create_search_criteria(by: LocatorBy | undefined, byValue: string): ElementSearchCriteria {
    if (by === LocatorBy.ID) {
      return new ElementSearchCriteria(FindByType.ID, byValue);
    }
    if (by === LocatorBy.NAME) {
      return new ElementSearchCriteria(FindByType.NAME, byValue);
    }
    if (by === LocatorBy.XPATH) {
      return new ElementSearchCriteria(FindByType.XPATH, byValue);
    }
    if (by === LocatorBy.CLASS_NAME) {
      return new ElementSearchCriteria(FindByType.CLASSNAME, byValue);
    }
    if (by === LocatorBy.CSS_SELECTOR) {
      return new ElementSearchCriteria(FindByType.CSSSELECTOR, byValue);
    }
    if (by === LocatorBy.LINK_TEXT) {
      return new ElementSearchCriteria(FindByType.LINKTEXT, byValue);
    }
    if (by === LocatorBy.TAG_NAME) {
      return new ElementSearchCriteria(FindByType.TAG_NAME, byValue);
    }
    if (by === LocatorBy.PARTIAL_LINK_TEXT) {
      return new ElementSearchCriteria(FindByType.PARTIALLINKTEXT, byValue);
    }
    throw new tpExceptions.SdkException(`Unsupported locator strategy: ${by || 'undefined'}`);
  }

  /**
   * Creates and returns an locator used in an addon based on a locator strategy.
   *
   * @param {LocatorBy} by - The element locator strategy to be used
   * @param {string} byValue - The associated element locator strategy value
   * @returns
   */
  public static create_addon_locator(by: LocatorBy, byValue: string): unknown {
    if (by === LocatorBy.ID) {
      return { id: byValue };
    }
    if (by === LocatorBy.NAME) {
      return { name: byValue };
    }
    if (by === LocatorBy.XPATH) {
      return { xpath: byValue };
    }
    if (by === LocatorBy.CLASS_NAME) {
      return { className: byValue };
    }
    if (by === LocatorBy.CSS_SELECTOR) {
      return { cssSelector: byValue };
    }
    if (by === LocatorBy.LINK_TEXT) {
      return { linkText: byValue };
    }
    if (by === LocatorBy.TAG_NAME) {
      return { tagName: byValue };
    }
    if (by === LocatorBy.PARTIAL_LINK_TEXT) {
      return { partialLinkText: byValue };
    }
    throw new tpExceptions.SdkException(`Unsupported locator strategy: ${by as LocatorBy}`);
  }

  public static buildSeleniumCommand(cmdName: string): Command {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return new SeleniumCommandNamespace.Command(cmdName) as Command;
  }
}
