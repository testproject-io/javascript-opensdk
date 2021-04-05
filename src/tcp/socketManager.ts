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

import { SocketConnectOpts, Socket } from 'net';

import logger from '../logger/logger';

/**
 * Managed the development TCP socket connection.
 */
export default class SocketManager {
  private static currInstance?: SocketManager;

  private socket?: Socket;

  public static instance(): SocketManager {
    // Return the singleton instance of the SocketManager class
    if (!SocketManager.currInstance) {
      SocketManager.currInstance = new SocketManager();
    }
    return SocketManager.currInstance;
  }

  /**
   * Opens a connection to the Agent development socket.
   *
   * @param {string} socketAddress The address for the socket
   * @param {number} socketPort The development socket port to connect to
   */
  public openSocket(socketAddress: string, socketPort: number): void {
    // Check if there is already a opened socket
    if (this.socket) {
      logger.debug('OpenSocket(): Socket already exists');
      return;
    }

    // Check if the socket is connected
    if (this.isConnected()) {
      logger.debug('open_socket(): Socket is already connected');
      return;
    }

    // Initialize the new socket
    this.socket = new Socket();

    // Create the socket options object
    const socketOptions: SocketConnectOpts = {
      host: socketAddress,
      port: socketPort,
    };

    this.socket
      .connect(socketOptions, () => {
        if (!this.isConnected()) {
          throw new Error('Failed connecting to Agent socket');
        }

        logger.debug(`Socket connection to ${socketAddress}:${socketPort} established successfully`);
      })
      .on('error', (res) => {
        logger.error(`Socket Connection Failed! message:${res.message}`);
        throw new Error(res.message);
      });
  }

  /**
   * Sends a simple message to the socket to see if it's connected.
   *
   * @returns {boolean} True if the socket is connected, False otherwise
   */
  private isConnected(): boolean {
    if (!this.socket) {
      return false;
    }

    try {
      this.socket.write('test');
      return true;
    } catch (error) {
      logger.error(`Socket not connected: ${error instanceof Error ? error.message : ''}`);
      return false;
    }
  }

  /**
   * Close the connection to the Agent development socket.
   */
  public closeSocket(): void {
    if (this.isConnected()) {
      this.socket?.destroy();
      if (!this.socket?.destroyed) {
        logger.error('Failed to close socket connection to Agent');
        return;
      }

      this.socket = undefined;
    }
  }
}
