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

import { assert } from 'chai';

import CustomTestReport from '../../../../../src/rest/messages/customTestReport';

describe('Test to json', () => {
  const testResultsReport = new CustomTestReport('my_name', true, 'my_message');

  it('Should return json', () => {
    assert.deepEqual(testResultsReport.toJson(), {
      name: 'my_name',
      passed: true,
      message: 'my_message',
    });
  });
});
