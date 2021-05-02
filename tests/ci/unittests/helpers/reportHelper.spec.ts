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

import ReportHelper from '../../../../src/sdk/internal/helpers/reportHelper';

describe('Report Helper Test', () => {
  it('Should return test name correctly', () => {
    assert.equal(ReportHelper.inferTestName(), 'Should return test name correctly');
  });

  it('Should return project name correctly', () => {
    assert.equal(ReportHelper.inferProjectName(), 'tests.ci.unittests.helpers');
  });

  it('Should return job name correctly', () => {
    assert.equal(ReportHelper.inferJobName(), 'Report Helper Test');
  });

  it('Should return test name is inferred correctly from method name and parameter values', () => {
    const parameters = ['panda', 'polar bear', 'african wild dog'];
    if (process.env.TP_PROJECT_NAME) delete process.env.TP_PROJECT_NAME;
    assert.equal(
      `${ReportHelper.inferTestName()}${parameters.toString()}`,
      `Should return test name is inferred correctly from method name and parameter values${parameters.toString()}`
    );
  });
});
