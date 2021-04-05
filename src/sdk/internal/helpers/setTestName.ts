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

export default (mochaIt: string, testName?: string, fileName?: string): void => {
  process.env.MOCHA_CURRENT_TEST = mochaIt;
  if (testName) process.env.MOCHA_CURRENT_DESCRIBE = testName;
  if (fileName) process.env.MOCHA_CURRENT_FILENAME = fileName;
};
