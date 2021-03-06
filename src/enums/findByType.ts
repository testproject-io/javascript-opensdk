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

/**
 * Supported element locator strategies.
 *
 * @enum {number}
 */
const enum FindByType {
  ID = 0,
  NAME = 1,
  CLASSNAME = 2,
  CSSSELECTOR = 3,
  LINKTEXT = 4,
  PARTIALLINKTEXT = 5,
  TAG_NAME = 6,
  XPATH = 7,
  ACCESSIBILITYID = 8,
  IOSUIAUTOMATION = 9,
  ANDROIDUIAUTOMATOR = 10,
  NAMEDTEXTFIELD = 11,
}

export default FindByType;
