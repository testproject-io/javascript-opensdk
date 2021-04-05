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

import logger from '../../../logger/logger';
import tpExceptions from '../../exceptions';

/**
 * Contains helper methods for SDK configuration
 */
export default class ConfigHelper {
  /**
   * Returns the Agent service address as defined in the TP_AGENT_URL environment variable.
   *
   * @returns {string} - Agent service address.
   */
  public static agentServiceAddress(): string {
    let address = process.env.TP_AGENT_URL;

    if (!address) {
      logger.info('No Agent service address found in TP_AGENT_URL environment variable');
      logger.info('Defaulting to http://127.0.0.1:8585 (localhost)');

      return 'http://127.0.0.1:8585';
    }

    // Replace 'localhost' with '127.0.0.1' to prevent delays as a result of DNS lookups
    address = address.replace('localhost', '127.0.0.1');

    return address;
  }

  /**
   * Returns the TestProject developer token as defined in the TP_DEV_TOKEN environment variable.
   *
   * @returns {string} - the developer token.
   */
  public static developerToken(): string {
    const token = process.env.TP_DEV_TOKEN;

    if (!token) {
      logger.error('No developer token was found, did you set it in the TP_DEV_TOKEN environment variable?');
      logger.error('You can get a developer token from https://app.testproject.io/#/integrations/sdk');
      throw new tpExceptions.SdkException('No development token defined in TP_DEV_TOKEN environment variable');
    }

    return token;
  }

  /**
   * Returns the SDK version as defined in the definitions module.
   *
   * @returns {string} - The current SDK version.
   */
  public static sdkVersion(): string {
    return process.env.TP_SDK_VERSION ?? '0.0.0';
  }
}
