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

import StepReport from '../../../../../src/rest/messages/stepReport';

describe('Test to json StepReport', () => {
  it('Should return JSON without screenshot', () => {
    const stepReport = new StepReport('my_description', 'my_message', true, undefined);
    const editStepReport = { ...stepReport.toJson(), guid: '12-ab-34-cd' }; // mock for guid as this will change each time
    assert.deepEqual(editStepReport, {
      guid: '12-ab-34-cd',
      description: 'my_description',
      message: 'my_message',
      passed: true,
      screenshot: undefined,
    });
  });

  it('Should return JSON with screenshot', () => {
    const stepReport = new StepReport('another_description', 'another_message', false, 'base64_screenshot_here');
    const editStepReport = { ...stepReport.toJson(), guid: '56-ef-78-gh' }; // mock for guid as this will change each time
    assert.deepEqual(editStepReport, {
      guid: '56-ef-78-gh',
      description: 'another_description',
      message: 'another_message',
      passed: false,
      screenshot: 'base64_screenshot_here',
    });
  });
});
