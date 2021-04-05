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

import TakeScreenshotConditionType from '../enums/screenshotConditionType';
import SleepTimingType from '../enums/sleepTimingType';

/**
 * Represents settings for automatic step reporting.
 *
 * @property {number} sleepTime - Is the sleep time number in milliseconds.
 * @property {SleepTimingType} sleepTimingType - Defines if the sleep will occur 'Before' or 'After' step execution.
 * @property {number} timeout - Timeout of the driver
 * @property {boolean} invertResult - Will invert step execution result when True.
 * @property {TakeScreenshotConditionType} screenshotCondition - TakeScreenshotConditionType enums
 */
export default class StepSettings {
  constructor(
    public sleepTime: number = 0,
    public sleepTimingType: SleepTimingType = SleepTimingType.None,
    public timeout: number = -1,
    public invertResult: boolean = false,
    public screenshotCondition: TakeScreenshotConditionType = TakeScreenshotConditionType.Failure
  ) {}
}
