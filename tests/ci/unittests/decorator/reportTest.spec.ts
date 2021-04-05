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

function SetEnvVarToObj(project: string, job: string, test: string) {
  const TESTVAROBJ = { TP_JOB_NAME: job, TP_PROJECT_NAME: project, TP_TEST_NAME: test };
  process.env.TESTVAROBJ = JSON.stringify(TESTVAROBJ);
}

function RemoveTESTVAROBJ() {
  if (process.env.TESTVAROBJ) {
    delete process.env.TESTVAROBJ;
  }
}

describe('Test set and remove environment variables', () => {
  it('Should set environment variables and pass', () => {
    SetEnvVarToObj('My project', 'My job', 'My test');
    const testParams = JSON.parse(process.env.TESTVAROBJ as string) as {
      TP_JOB_NAME: string;
      TP_PROJECT_NAME: string;
      TP_TEST_NAME: string;
    };
    assert.equal(testParams.TP_PROJECT_NAME, 'My project');
    assert.equal(testParams.TP_JOB_NAME, 'My job');
    assert.equal(testParams.TP_TEST_NAME, 'My test');
  });

  it('Should remove environment variables', () => {
    RemoveTESTVAROBJ();
    process.env.TP_TEST_NAME = 'Another test';
    assert.equal(process.env.TP_TEST_NAME, 'Another test');
    delete process.env.TP_TEST_NAME;
    assert.equal(process.env.TP_TEST_NAME, undefined);
  });
});
