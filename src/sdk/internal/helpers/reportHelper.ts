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

import path from 'path';
import os from 'os';
import { get as stackTraceGet } from 'stack-trace';

import logger from '../../../logger/logger';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const detectMocha = require('detect-mocha');
require('../mochaHooks');

/**
 * Provides helper functions used in reporting command, tests and steps
 */
export default class ReportHelper {
  /**
   * Infer test name from regular env param or from custom env mocha param.
   *
   * @returns {string} The inferred test name (typically the test method name)
   */
  public static inferTestName(): string {
    const { TP_TEST_NAME, MOCHA_IT } = process.env;

    return TP_TEST_NAME ?? MOCHA_IT ?? 'Unnamed Test';
  }

  /**
   * Infer project name from regular env param or the path to the current mocha test file name.
   *
   * @returns {string} The inferred project name (typically the folder containing the test file)
   */
  public static inferProjectName(): string {
    const { TP_PROJECT_NAME } = process.env;

    if (TP_PROJECT_NAME) {
      return TP_PROJECT_NAME;
    }

    let result = 'Unnamed Project';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (detectMocha()) {
      const callStackList = stackTraceGet();

      // eslint-disable-next-line no-restricted-syntax
      for (const file of callStackList) {
        if (file?.getFileName()?.includes('.spec')) {
          // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
          const fileName: RegExpMatchArray | null = file?.getFileName().match(/tests.*/);

          if (fileName && fileName[0]) {
            const removeFileNameRegex = fileName[0].slice(0, fileName[0].lastIndexOf(path.sep));
            const seperator = os.platform() === 'win32' ? path.sep + path.sep : path.sep;
            result = removeFileNameRegex.replace(new RegExp(seperator, 'g'), '.');
            break;
          }
        }
      }
    } else {
      // TODO
      // Try finding the right entry in the call stack (for unittest or when no testing framework is used)
    }

    return result;
  }

  /**
   * Infer job name from regular env param.
   *
   * @returns {string} The inferred job name (typically the test file name (without the .ts extension)
   */
  public static inferJobName(): string {
    const { TP_JOB_NAME, MOCHA_DESCRIBE_TREE } = process.env;

    // User specified project name
    if (TP_JOB_NAME) {
      return TP_JOB_NAME;
    }

    // Mocha inferred project name
    if (MOCHA_DESCRIBE_TREE) {
      return MOCHA_DESCRIBE_TREE;
    }

    let result = 'Unnamed Job';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (detectMocha()) {
      logger.debug('Attempting to infer job name using inspect.stack()');
      logger.debug("Inferred job name '{result}' from inspect.stack()");
      const callStackList = stackTraceGet();

      // eslint-disable-next-line no-restricted-syntax
      for (const file of callStackList) {
        if (file?.getFileName()?.includes('.spec')) {
          const fileName = file?.getFileName();
          const editFileName = fileName.replace(/^.*[\\/]/, '');
          result = editFileName.replace('.spec.js', '');
          return result;
        }
      }
    }

    return result;
  }
}
