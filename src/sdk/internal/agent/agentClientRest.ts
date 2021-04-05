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

import axios, { AxiosError, AxiosResponse } from 'axios';
import logger from '../../../logger/logger';
import OperationResult from '../../../executionResults/operationResult';

export default class AgentClientRest {
  /**
   * Agent client Post http.
   *
   * @param {string} path - Path for the request
   * @param {unknown} body - The body for the request
   * @param {string} token - The developer token for authorization
   *
   * @returns {Promise<OperationResult>}
   */
  static async Post(path: string, body: unknown, token: string): Promise<OperationResult> {
    const ret = await axios
      .post(path, body, { headers: { Authorization: token } })
      .then((response: AxiosResponse<OperationResult>) => new OperationResult(true, response.status, '', response.data))
      .catch((error: AxiosError<string>) => {
        let agentData: Map<string, string>;
        try {
          agentData = JSON.parse(error.response?.data as string) as Map<string, string>;
        } catch (e) {
          agentData = new Map<string, string>();
        }

        logger.error(`API call to ${path} returned an error:`, error);

        return new OperationResult(false, error.response?.status, agentData.get('message'), error.response?.data);
      });

    return ret;
  }
}
