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

import { Capabilities, error as SeleniumError } from 'selenium-webdriver';
import async from 'async';
import axios, { AxiosError, AxiosResponse } from 'axios';
import parse from 'url-parse';

import ReportSettings from '../../../rest/reportSettings';
import AgentSession from '../session/agentSession';
import SessionRequest from '../../../rest/messages/sessionRequest';
import SessionResponse from '../../../rest/messages/sessionResponse';
import ConfigHelper from '../helpers/configHelper';
import Endpoints from './agentClientEnums';
import SocketManager from '../../../tcp/socketManager';
import TestProjectCapabilities from '../helpers/customCapabilities';
import StepReport from '../../../rest/messages/stepReport';
import QueueItem from '../../../classes/queueItem';
import AgentClientRest from './agentClientRest';
import logger from '../../../logger/logger';
import CustomTestReport from '../../../rest/messages/customTestReport';
import DriverCommandReport from '../../../rest/messages/driverCommandReport';
import ISessionRequest from '../../../interfaces/ISessionRequest';
import ReportHelper from '../helpers/reportHelper';
import OperationResult from '../../../executionResults/operationResult';

class AgentClient {
  // TODO: Use constants
  // private static REPORTS_QUEUE_TIMEOUT = 10;

  // Minimum Agent version number that supports session reuse
  // private static MIN_SESSION_REUSE_CAPABLE_VERSION = '0.64.20';

  private token: string;

  public capabilities: Capabilities;

  private reportSettings: ReportSettings;

  private remoteAddress: string;

  // Class variable containing the current known Agent version
  public agentVersion?: string;

  public agentSession!: AgentSession;

  // Async queue for reporting command in the background
  private asyncReportingQueue?: async.QueueObject<QueueItem>;

  constructor(caps: Capabilities) {
    this.capabilities = caps;
    this.token = caps.get(TestProjectCapabilities.DEVELOPMENT_TOKEN) as string;

    // Check if a custom token was specified
    if (caps.has(TestProjectCapabilities.DEVELOPMENT_TOKEN)) {
      this.token = caps.get(TestProjectCapabilities.DEVELOPMENT_TOKEN) as string;
    } else {
      this.token = ConfigHelper.developerToken();
    }

    // Check if a custom remote address was specified
    if (caps.has(TestProjectCapabilities.REMOTE_AGENT_ADDRESS)) {
      this.remoteAddress = caps.get(TestProjectCapabilities.REMOTE_AGENT_ADDRESS) as string;
    } else {
      this.remoteAddress = ConfigHelper.agentServiceAddress();
    }

    // Build reporting settings object
    this.reportSettings = new ReportSettings(
      (caps.get(TestProjectCapabilities.PROJECT_NAME) as string) || ReportHelper.inferProjectName(),
      (caps.get(TestProjectCapabilities.JOB_NAME) as string) || ReportHelper.inferJobName(),
      (caps.get(TestProjectCapabilities.REPORT_TYPE) as string) || '',
      (caps.get(TestProjectCapabilities.REPORT_NAME) as string) || '',
      (caps.get(TestProjectCapabilities.REPORT_PATH) as string) || ''
    );

    // Create and asynchronous queue for reporting results to the Agent
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.asyncReportingQueue = async.queue(async (task: QueueItem, callback: async.ErrorCallback) => {
      let jsonString = JSON.stringify(task.reportAsJson);
      if (jsonString.length > 256) {
        jsonString = `${jsonString.substring(0, 256)}...`;
      }
      logger.debug(`Sending POST to Agent: ${task.endPoint}\n${jsonString}`);

      // Report the command to the Agent
      const response = await AgentClientRest.Post(task.url, task.reportAsJson, this.token);

      // Call the error callback function
      if (!response.passed) {
        callback(Error(response.message));
      } else {
        callback();
      }
    }, 1);
  }

  /**
   * Starts a new development session with the Agent
   * @returns {Promise<SessionResponse>} promise of the agent session response
   */
  public async startSession(): Promise<SessionResponse> {
    try {
      // Build a session request message
      const sessionRequest: ISessionRequest = new SessionRequest(this.reportSettings, this.capabilities).toObject();

      // Create the agent path
      const agentUrl = `${this.remoteAddress}${Endpoints.DevelopmentSession}`;

      // Send a session request message to the Agent
      const response = await axios
        .post(agentUrl, sessionRequest, { headers: { Authorization: this.token } })
        .catch((error: AxiosError) => {
          let errMsg = error.message;

          if (error.response) {
            errMsg += `: ${(error.response as AxiosResponse<OperationResult>).data.message}`;
          }

          if (error.code === 'ECONNREFUSED') {
            errMsg = `
            Failed connecting to the TestProject Agent at ${this.remoteAddress}.
            Please make sure that the TestProject Agent is running and try again.`;
          }
          logger.error(errMsg);
          throw new SeleniumError.SessionNotCreatedError(errMsg);
        });

      const sessionResponse: SessionResponse = Object.assign(new SessionResponse(), response.data as unknown);

      // Store the Agent session values
      this.agentVersion = sessionResponse.agentVersion;
      this.agentSession = new AgentSession(
        sessionResponse.serverAddress,
        sessionResponse.sessionId,
        sessionResponse.dialect,
        sessionResponse.capabilities
      );

      // Open a TCP connection
      SocketManager.instance().openSocket(parse(this.remoteAddress).hostname, sessionResponse.devSocketPort);

      logger.debug(`Development session ${sessionResponse.sessionId} started...`);
      return sessionResponse;
    } catch (error) {
      throw new SeleniumError.SessionNotCreatedError(error);
    }
  }

  /**
   * Terminate the development session.
   * @returns {Promise<void>}
   */
  public async quitSession(): Promise<void> {
    // Drain the reporting queue before terminating the session
    if (this.asyncReportingQueue?.length() || this.asyncReportingQueue?.running()) {
      logger.debug('Waiting for the reporting queue to drain...');
      await this.asyncReportingQueue?.drain();
    }

    // Close the development session TCP socket
    logger.debug('Closing the development session');
    SocketManager.instance().closeSocket();
  }

  /**
   * Sends test report to the Agent
   * @param {CustomTestReport} testReport - object containing the test to be reported
   * @returns {void}
   */
  public reportTest(testReport: CustomTestReport): void {
    const path = `${this.remoteAddress}${Endpoints.ReportTest}`;
    const queueItem = new QueueItem(testReport.toJson(), path, this.token, Endpoints.ReportTest);
    this.asyncReportingQueue?.push(queueItem);
  }

  /**
   * Sends step report to the Agent
   * @param {StepReport} stepReport - object containing the step to be reported
   * @returns {void}
   */
  public reportStep(stepReport: StepReport): void {
    const path = `${this.remoteAddress}${Endpoints.ReportStep}`;
    const queueItem = new QueueItem(stepReport.toJson(), path, this.token, Endpoints.ReportStep);
    this.asyncReportingQueue?.push(queueItem);
  }

  /**
   * Sends command report to the Agent
   * @param {DriverCommandReport} driverCommandReport - object containing the driver command to be reported
   * @returns {void}
   */
  public reportDriverCommand(driverCommandReport: DriverCommandReport): void {
    const path = `${this.remoteAddress}${Endpoints.ReportDriverCommand}`;
    const queueItem = new QueueItem(driverCommandReport.ToJson(), path, this.token, Endpoints.ReportDriverCommand);
    this.asyncReportingQueue?.push(queueItem);
  }
}

export default AgentClient;
