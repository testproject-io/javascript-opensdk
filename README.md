[![Build](https://github.com/testproject-io/javascript-opensdk/actions/workflows/build_online.yml/badge.svg)](https://github.com/testproject-io/javascript-opensdk/actions/workflows/build_online.yml)
![npm (tag)](https://img.shields.io/npm/v/@tpio/javascript-opensdk/latest)
![npm (tag)](https://img.shields.io/npm/v/@tpio/javascript-opensdk/beta)

# TestProject JavaScript OpenSDK for Node.js

[TestProject](https://testproject.io) is a **Free** Test Automation platform for Web, Mobile and API testing. \
To get familiar with the TestProject, visit our main [documentation](https://docs.testproject.io/) website.

TestProject SDK is a single, integrated interface to scripting with the most popular open source test automation frameworks.

From now on, you can effortlessly execute Selenium and Appium native tests using a single automation platform that already takes care of all the complex setup, maintenance and configs.

With one unified SDK available across multiple languages, developers and testers receive a go-to toolset, solving some of the greatest challenges in open source test automation.

With TestProject SDK, users save a bunch of time and enjoy the following benefits out of the box:

- 100% open source and available as an [NPM](https://www.npmjs.com/package/@tpio/javascript-opensdk) package.
- 5-minute simple Selenium and Appium setup with a single [Agent](https://docs.testproject.io/testproject-agents) deployment.
- Automatic test reports in HTML/PDF format (including screenshots).
- Collaborative reporting dashboards with execution history and RESTful API support.
- Always up-to-date with the latest and stable Selenium driver version.
- A simplified, familiar syntax for both web and mobile applications.
- Complete test runner capabilities for both local and remote executions, anywhere.
- Cross platform support for Mac, Windows, Linux and Docker.
- Ability to store and execute tests locally on any source control tool, such as Git.

# Getting started

To get started, you need to complete the following prerequisites checklist:

- Login to your account at https://app.testproject.io/ or [register](https://app.testproject.io/signup/) a new one.
- [Download](https://app.testproject.io/#/download) and install an Agent for your operating system or pull a container from [Docker Hub](https://hub.docker.com/r/testproject/agent).
- Run the Agent and [register](https://docs.testproject.io/getting-started/installation-and-setup#register-the-agent) it with your Account.
- Get a development token from [Integrations / SDK](https://app.testproject.io/#/integrations/sdk) page.

> You must have Node.js v12 or newer installed.

## Installation

The TestProject JavaScript OpenSDK is available on [NPM](https://www.npmjs.com/package/@tpio/javascript-opensdk). All you need to do is add it as an NPM module using:

```shell
npm install @tpio/javascript-opensdk
```

and you're good to go.

# Test Development

Using a TestProject driver is exactly identical to using a Selenium driver.\
Changing the import statement is enough in most cases.

> Following examples are based on the `Chrome` driver, however are applicable to any other supported drivers.

Here's an example of how to create a TestProject version of the `Chrome` driver:

```javascript
// import { Builder } from 'selenium-webdriver';  <-- replace this import
import { Builder } from '@tpio/javascript-opensdk';

const createChromeDriver = async () => {
  const driver = await new Builder().forBrowser('chrome').build();

  //////////////////////////////
  // Your test code goes here //
  //////////////////////////////

  await driver.quit();
};
```

Here's a complete test example:

```javascript
import { By } from 'selenium-webdriver';
import { Builder } from '@tpio/javascript-opensdk';

export const simpleTest = async (): Promise<void> => {
  const driver = await new Builder().forBrowser('chrome').build();

  await driver.get('https://example.testproject.io/web/');
  await driver.findElement(By.css('#name')).sendKeys('John Smith');
  await driver.findElement(By.css('#password')).sendKeys('12345');
  await driver.findElement(By.css('#login')).click();

  const passed = await driver.findElement(By.css('#logout')).isDisplayed();

  console.log(passed ? 'Test Passed' : 'Test Failed');

  await driver.quit();
};
```

## Drivers

TestProject's OpenSDK overrides standard Selenium/Appium drivers with extended functionality. \
Below is the package's structure containing all supported drivers:

```ascii
src
 └── sdk
      └── drivers
             ├── web
             │    ├── chrome
             │    ├── edge
             │    ├── firefox
             │    ├── ie (Legacy Internet Explorer)
             │    └── safari
             └── mobile
                  ├── androidDriver
                  └── iosDriver
```

## Development token

The SDK uses a development token for communication with the Agent and the TestProject platform.\
Drivers search for the development token in an environment variable called `TP_DEV_TOKEN`.\
Alternatively, the token can be set using the `withToken` method on the builder:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const createChromeDriver = async () => {
  const driver = await new Builder().forBrowser('chrome').withToken('YOUR_TOKEN_GOES_HERE').build();

  //////////////////////////////
  // Your test code goes here //
  //////////////////////////////

  await driver.quit();
};
```

## Remote Agent

By default, drivers communicate with the local Agent listening on http://localhost:8585.

Agent URL (host and port), can be also provided explicitly using driver builder:

```javascript
driver = new Builder().forBrowser('chrome').withToken('YOUR_DEV_TOKEN').withRemoteAgent('http://URL:PORT').build();
```

It can also be set using the `TP_AGENT_URL` environment variable.

**NOTE:** By default, the agent binds to localhost.
In order to allow the SDK to communicate with agents running on a remote machine (_On the same network_), the agent should bind to an external interface.
For additional documentation on how to achieve such, please refer [here](https://docs.testproject.io/testproject-agents/testproject-agent-cli#start)

## Implicit project and job names

The SDK will attempt to infer Project and Job names automatically when running tests using the [Mocha](https://mochajs.org) framework. For example:

- Directory `e2e_tests/chrome` contains `my_tests.spec.ts` test file.
- When executing `my_tests.spec.ts`, the SDK will infer `e2e_tests/chrome` as the project name (replacing any slashes `/` with dots `.`).
- The job name will be set to the file name, skipping the `.spec.ts` suffix. In this example: `my_tests`.

## Explicit project and job names

Project and Job names can be also specified explicitly using the `withProjectName` and `withJobName` methods of the builder:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const createChromeDriver = async () => {
  const driver = await new Builder()
    .forBrowser('chrome')
    .withProjectName('PROJECT NAME')
    .withJobName('JOB_NAME')
    .build();

  //////////////////////////////
  // Your test code goes here //
  //////////////////////////////

  await driver.quit();
};
```

# Test Reports

## Automatic reporting

Tests are reported automatically when a test **ends** or when the driver _quits_.\
This behavior can be overridden or disabled (see [Disabling Reports](#disabling-reports) section below).

## Manual reporting

To report tests manually, use the `driver.report().tests()` method and its overloads. For example:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const createChromeDriver = async () => {
  const driver = await new Builder().forBrowser('chrome').build();
  let passed = true;

  //////////////////////////////
  // Your test code goes here //
  //////////////////////////////

  driver.report().test('My test name', passed);
  await driver.quit();
};
```

Steps are reported automatically when driver commands are executed.\
If this feature is disabled (or in addition to automatic reports) manual reports can be performed. For example:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const testReportStepManually = async () => {
  const driver = await new Builder().forBrowser('chrome').build();

  driver.report().step('First Step', 'Completed successfully', true);
  driver.report().step('Second Step', 'Failed', false);
  driver.report().test('My Test', false); // Report the test as failed

  await driver.quit();
};
```

## Disabling Reports

TestProject OpenSDK reports all driver commands and their results to the TestProject Cloud.\
Doing so allows us to present beautifully designed reports and statistics in its dashboards.

Reports can be completely disabled using the `setDisableReporting` method of the builder:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const testWithoutReports = async () => {
  const disableReports = true;
  const driver = await new Builder().forBrowser('chrome').setDisableReporting(true).build();

  //////////////////////////////
  // Your test code goes here //
  //////////////////////////////

  await driver.quit();
};
```

If reports were not disabled when the driver was created, they can be disabled or enabled later.
However, if reporting was explicitly disabled when the driver was created, they **cannot** be enabled later.

Reports can be temporarily disable using the `disableAutoTestReports` method of `report()` and enabled later:

```javascript
import { Builder } from '@tpio/javascript-opensdk';

const testTemporarilyDisableAllReportingThenReenableItLater = async () => {
  const driver = await new Builder().forBrowser('chrome').build();

  driver.report().disableAutoTestReports(true);
  await this.driver.get('https://example.testproject.io/web/'); //This statement will not be reported
  driver.report().disableAutoTestReports(false);
  await driver.quit();
};
```

## The importance of using the quit() method

Even more so than with regular Selenium-based tests, it is important to make sure that you call the `quit()` method of the driver object at the end of every test that uses the TestProject SDK.
Upon calling `quit()`, the SDK will send all remaining report items to the Agent, ensuring that your report on the TestProject platform is complete.

# Examples

Examples are available at the [OpenSDK Examples](https://github.com/testproject-io/opensdk-examples/tree/main/javascript) repo, but tests from this repo can be used as simple examples as well:

- Simple Flows
  - [Web](tests/ci/headless/web/chromeBasic.spec.ts)
  - [Android](tests/mobile/basicAndroid.spec.ts)
  - [iOS](tests/mobile/basicIOS.spec.ts)

# License

The TestProject JavaScript OpenSDK is licensed under the LICENSE file in the root directory of the project source tree.
