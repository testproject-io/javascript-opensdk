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

import FindByType from '../../../../src/enums/findByType';
import LocatorBy from '../../../../src/enums/locatorBy';
import { SeleniumHelper } from '../../../../src/sdk/internal/helpers/seleniumHelper';

describe('Test elementsearchcriteria', () => {
  it('Should return test valid search criteria fields', () => {
    const esc = SeleniumHelper.create_search_criteria(LocatorBy.CSS_SELECTOR, '#css');
    assert.equal(esc.findByType, FindByType.CSSSELECTOR);
    assert.equal(esc.byValue, '#css');
    assert.equal(esc.index, -1);
  });

  it('Should invalid search criteria raises exception', () => {
    assert.throws(
      () => SeleniumHelper.create_search_criteria(undefined, 'empty'),
      'Unsupported locator strategy: undefined'
    );
  });
});
