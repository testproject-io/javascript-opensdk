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

import FindByType from '../enums/findByType';

/**
 * Defines an object type representing search criteria for a web element.
 *
 * @property {FindByType} findByType - The locator strategy to be used (id, name, etc.)
 * @property {string} byValue - The associated locator strategy value
 * @property {number} index - An index indicating which occurrence of the element should be used
 */
export default class ElementSearchCriteria {
  constructor(public findByType: FindByType, public byValue: string, public index = -1) {}

  /**
   * Returns a JSON representation of the object to be sent to the Agent.
   *
   * @returns A JSON representation of the object
   */
  public toJson(): { byType: FindByType; byValue: string; index: number } {
    return {
      byType: this.findByType,
      byValue: this.byValue,
      index: this.index,
    };
  }
}
