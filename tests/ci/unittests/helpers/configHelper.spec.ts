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

import ConfigHelper from '../../../../src/sdk/internal/helpers/configHelper';
import Endpoints from '../../../../src/sdk/internal/agent/agentClientEnums';

describe('Test ConfigHelper', () => {
  let previousAgentUrl: string;
  let previousToken: string | undefined;

  before(() => {
    previousAgentUrl = ConfigHelper.agentServiceAddress();

    try {
      previousToken = ConfigHelper.developerToken();
    } catch (e) {
      previousToken = undefined;
    }
  });

  after(() => {
    process.env.TP_AGENT_URL = previousAgentUrl;

    if (previousToken) {
      process.env.TP_DEV_TOKEN = previousToken;
    } else {
      delete process.env.TP_DEV_TOKEN;
    }
  });

  it('Should return the default agent service address', () => {
    delete process.env.TP_AGENT_URL;
    const agentAddress = ConfigHelper.agentServiceAddress();
    assert.equal(agentAddress, 'http://127.0.0.1:8585');
  });

  it('Should resolves to specified value', () => {
    process.env.TP_AGENT_URL = 'some_address';
    const agentAddress = ConfigHelper.agentServiceAddress();
    assert.equal(agentAddress, 'some_address');
  });

  it('Should return concat to strings represent url http://127.0.0.1:8585/api/development/session', () => {
    process.env.TP_AGENT_URL = 'http://localhost:8585';
    const agentAddress = ConfigHelper.agentServiceAddress();
    const editedAgentAddress = agentAddress[agentAddress.length - 1] === '/' ? agentAddress.slice(0, -1) : agentAddress;
    const address = editedAgentAddress.concat(Endpoints.DevelopmentSession);
    assert.equal(address, 'http://127.0.0.1:8585/api/development/session');
  });

  it('Should return exception raised', () => {
    delete process.env.TP_DEV_TOKEN;
    assert.throws(
      () => ConfigHelper.developerToken(),
      'No development token defined in TP_DEV_TOKEN environment variable'
    );
  });

  it('Should return exception raised', () => {
    process.env.TP_DEV_TOKEN = 'some_token';
    assert.equal(ConfigHelper.developerToken(), 'some_token');
  });
});
