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
import { HttpClient, Request, Response } from 'selenium-webdriver/http';
import { UrlWithStringQuery } from 'url';

/**
 * Custom http client that extends the Selenium HttpClient
 * @property {UrlWithStringQuery} options_ the URL options
 */
export default class CustomHttpClient extends HttpClient {
  // Override the private "options_" field of the base HttpClient
  options_!: UrlWithStringQuery;

  // Default constructor
  constructor() {
    super('http://127.0.0.1');
  }

  /**
   * Set the http address of the remote driver
   */
  public setDriverAddr(driverAddr: string): void {
    const url = new URL(driverAddr);
    /* eslint-disable */
    this.options_.hostname = url.hostname; // '127.0.0.1';
    this.options_.path = url.pathname; //'/wd/hub';
    this.options_.port = url.port; //'5555';
    this.options_.protocol = url.protocol; //'http:';
    /* eslint-enable */
  }

  /**
   * Send the http request.
   *
   * @returns {promise.Promise<Response>}
   */
  send(httpRequest: Request): promise.Promise<Response> {
    return super.send(httpRequest);
  }
}
