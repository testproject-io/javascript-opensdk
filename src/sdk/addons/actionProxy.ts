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

import ProxyDescriptor from '../../classes/proxyDescriptor';

/**
 * Base class that needs to be extended by custom Actions.
 *
 * @property {ProxyDescriptor} proxyDescriptor - Contains the description of the custom action
 */
export default class ActionProxy {
  private proxyDescriptor?: ProxyDescriptor;

  /**
   * Getter for the ProxyDescriptor.
   *
   * @returns {ProxyDescriptor | undefined}
   */
  public get ProxyDescriptor(): ProxyDescriptor | undefined {
    return this.proxyDescriptor;
  }

  /**
   * Setter for the ProxyDescriptor.
   *
   * @param {ProxyDescriptor | undefined} v
   */
  public set ProxyDescriptor(v: ProxyDescriptor | undefined) {
    this.proxyDescriptor = v;
  }
}
