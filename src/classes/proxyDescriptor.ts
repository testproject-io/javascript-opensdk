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

/**
 * Describes an Addon and an Action to be executed via the Agent.
 *
 * @property {string} guid - A unique GUID used to identify the addon
 * @property {string} className - The name of the action class that is contained in the addon
 * @property {By} by - Locator strategy for the element associated with this action
 * @property {string} byValue - Corresponding locator strategy value
 * @property {unknown} parameters - Parameters and their values associated with the action
 */
export default class ProxyDescriptor {
  constructor(public guid: string, public className: string) {}

  /**
   * Getter for the element locator strategy
   *
   * @returns {By}
   */
  public get by(): By {
    return this.by;
  }

  /**
   * Setter for the element locator strategy
   *
   * @param {By} val
   */
  public set by(val: By) {
    this.by = val;
  }

  /**
   * Getter for the element locator value
   *
   * @returns {string}
   */
  public get byValue(): string {
    return this.byValue;
  }

  /**
   * Setter for the element locator value
   * @param {string} val
   */
  public set byValue(val: string) {
    this.byValue = val;
  }

  /**
   * Getter for the action parameters
   *
   * @returns {unknown}
   */
  public get parameters(): unknown {
    return this.parameters;
  }

  /**
   * Setter for the action parameters
   *
   * @param {any} val
   */
  public set parameters(val: unknown) {
    this.parameters = val;
  }
}
