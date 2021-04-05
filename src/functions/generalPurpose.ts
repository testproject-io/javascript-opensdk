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

import { Command } from 'selenium-webdriver';
import sleep from 'sleep-promise';

import logger from '../logger/logger';
import SleepTimingType from '../enums/sleepTimingType';
import { SeleniumCommandName } from '../sdk/internal/helpers/seleniumHelper';

/**
 * Sleep before comamnd execution.
 *
 * @param {SleepTimingType} sleep_timing_type - Object containing SleepTimingType
 * @param {number} sleep_time - Containing sleep time by milliseconds
 * @param {Command} command - Containing the selenium command
 *
 * @returns {Promise<void>}
 */
export default async function HandleSleep(
  sleep_timing_type: SleepTimingType,
  sleep_time: number,
  command: Command,
  step_executed = false
): Promise<void> {
  // Skip the QUIT command
  if (command.getName() === SeleniumCommandName.QUIT) {
    return;
  }

  if (sleep_timing_type !== SleepTimingType.None) {
    const sleepTimingTypeCondition = step_executed ? SleepTimingType.After : SleepTimingType.Before;

    if (sleep_timing_type === sleepTimingTypeCondition) {
      logger.debug(`Step is designed to sleep for ${sleep_time} milliseconds`);
      logger.debug(`${sleep_timing_type} execution.`);

      await sleep(sleep_time);
    }
  }
}
