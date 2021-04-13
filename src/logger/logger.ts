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

import { createLogger, transports, format } from 'winston';
import strace from 'stack-trace';

// TODO: Generate stack-trace only for DEBUG builds
const customFormat = format.printf((msg) => {
  let fileMeta = '';

  // Extract the filename and line number from the stack trace
  strace.get().every((element) => {
    if (
      element.getFileName()?.includes('javascript-opensdk/dist/src') &&
      !element.getFileName()?.includes('logger.js')
    ) {
      const fileName = element.getFileName();
      fileMeta = `${fileName.substring(fileName.indexOf('javascript-opensdk'))}:${element.getLineNumber()}`;
      return false;
    }
    return true;
  });

  return `${msg.timestamp as string} [${msg.level}] (${fileMeta}): ${msg.message}`;
});

const logger = createLogger({
  transports: [
    new transports.Console({
      level: 'warn',
      format: format.combine(
        format((info) => {
          const newInfo = info;
          newInfo.level = info.level.toUpperCase().padEnd(7, ' ');
          return newInfo;
        })(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.colorize({ all: true }),
        customFormat
      ),
    }),
  ],
});

export default logger;
