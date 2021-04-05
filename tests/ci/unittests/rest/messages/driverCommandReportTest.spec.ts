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

import DriverCommandReport from '../../../../../src/rest/messages/driverCommandReport';
import { SeleniumHelper } from '../../../../../src/sdk/internal/helpers/seleniumHelper';

describe('Test instances are considered equal', () => {
  const c = SeleniumHelper.buildSeleniumCommand('command');
  c.setParameter('param', 'value');
  let dcr: DriverCommandReport;
  const anotherResults: Map<string, string> = new Map<string, string>();
  const results: Map<string, string> = new Map([['result', 'value']]);

  before(() => {
    dcr = new DriverCommandReport(c, results, true);
  });

  afterEach(() => {
    anotherResults.clear();
  });

  it('Should return test instances with same arguments', () => {
    const anotherDcr = new DriverCommandReport(c, anotherResults.set('result', 'value'), true);
    assert.deepEqual(dcr, anotherDcr);
  });

  it('Should return test instances with different arguments', () => {
    const anotherDcr = new DriverCommandReport(c, anotherResults.set('result', 'another_value'), true);
    assert.notEqual(dcr, anotherDcr);
  });
});

describe('Test to json DriverCommandReport', () => {
  const c = SeleniumHelper.buildSeleniumCommand('command');
  c.setParameter('param', 'value');
  let dcr: DriverCommandReport;

  it('Should return json', () => {
    dcr = new DriverCommandReport(c, undefined, true);
    assert.deepEqual(dcr.ToJson(), {
      commandName: 'command',
      commandParameters: { param: 'value' },
      result: undefined,
      passed: true,
    });
  });

  it('Should return json with screenshot', () => {
    const anotherDcr = new DriverCommandReport(c, undefined, false);
    assert.deepEqual(anotherDcr.ToJson(), {
      commandName: 'command',
      commandParameters: { param: 'value' },
      result: undefined,
      passed: false,
    });
  });
});
