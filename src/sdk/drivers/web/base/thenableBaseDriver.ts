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

import { promise } from 'selenium-webdriver';

import BaseDriver from './baseDriver';
import Reporter from '../../../reporter/reporter';

/**
 * Thenable Base Driver - Extends base driver and IThenable BaseDriver
 * @interface
 */
export default interface ThenableBaseDriver extends BaseDriver, promise.IThenable<BaseDriver> {
  /**
   * @method report
   */
  report(): Reporter;
}

const THENABLE_DRIVERS = new Map();

/* eslint-disable */
export function createDriver(ctor: any, ...args: any[]): ThenableBaseDriver {
  let thenableWebDriverProxy = THENABLE_DRIVERS.get(ctor);
  if (!thenableWebDriverProxy) {
    /**
     * @extends {WebDriver}  // Needed since `ctor` is dynamically typed.
     * @implements {ThenableWebDriver}
     */
    thenableWebDriverProxy = class extends ctor {
      /**
       * @param {!IThenable<!Session>} session
       * @param {...?} rest
       */
      constructor(session: any, ...rest: any) {
        super(session, ...rest);

        const pd = this.getSession().then((session: any) => new ctor(session, ...rest));

        /** @override */
        this.then = pd.then.bind(pd);

        /** @override */
        this.catch = pd.catch.bind(pd);
      }
    };
    THENABLE_DRIVERS.set(ctor, thenableWebDriverProxy);
  }
  return thenableWebDriverProxy.createSession(...args);
}
/* eslint-enable */
