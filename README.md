# TestProject JavaScript OpenSDK for Node.js

[TestProject](https://testproject.io) is a **Free** Test Automation platform for Web, Mobile and API testing. \
To get familiar with the TestProject, visit our main [documentation](https://docs.testproject.io/) website.

TestProject SDK is a single, integrated interface to scripting with the most popular open source test automation frameworks.

From now on, you can effortlessly execute Selenium and Appium native tests using a single automation platform that already takes care of all the complex setup, maintenance and configs.

With one unified SDK available across multiple languages, developers and testers receive a go-to toolset, solving some of the greatest challenges in open source test automation.

With TestProject SDK, users save a bunch of time and enjoy the following benefits out of the box:

- 100% open source and available as an [NPM](https://www.npmjs.com/package/@tpio/javascript-opensdk) package.
- 5-minute simple Selenium setup with a single [Agent](https://docs.testproject.io/testproject-agents) deployment.
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

The TestProject JavaScript OpenSDK is available on [NPM](https://www.npmjs.com/package/@tpio/javascript-opensdk). All you need to do is add it as an NPM module using::

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

TestProject's OpenSDK overrides standard Selenium drivers with extended functionality. \
Below is the packages structure containing all supported drivers:

```ascii
src
 └── sdk
      └── drivers
             └── web
                  ├── chrome
                  ├── edge
                  ├── firefox
                  ├── ie (Legacy Internet Explorer)
                  └── safari
```

## Development token

The SDK uses a development token for communication with the Agent and the TestProject platform.\
Drivers search the developer token in an environment variable `TP_DEV_TOKEN`.\
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

## Implicit project and job names

The SDK will attempt to infer Project and Job names automatically when running test using the [Mocha](https://mochajs.org) framework:

Directory `e2e_tests/chrome` contains `my_tests.spec.ts` test file.\
When executing `my_tests.spec.ts`, The SDK will infer `e2e_tests/chrome` as the project name (replacing any slashes `/` with dots `.`).\
The job name will be set to the file name, skipping the `.spec.ts` suffix, for example: `my_tests`.

## Explicit project and job names

Project and Job names can be also specified explicitly using the `withProjectName` and `withJobName` method of the builder:

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

Tests are reported automatically when a test **ends** or when driver _quits_.\
This behavior can be overridden or disabled (see [Disabling Reports](#disabling-reports) section below).

## Manual reporting

To report tests manually, use `driver.report().tests()` method and it's overloads, for example:

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
If this feature is disabled, or in addition, manual reports can be performed, for example:

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
Doing so, allows us to present beautifully designed reports and statistics in it's dashboards.

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

## The importance of using the quit() method

Even more so than with regular Selenium based tests, it is important to make sure that you call the `quit()` method of the driver object at the end of every test that uses the TestProject SDK.
Upon calling `quit()`, the SDK will send all remaining report items to the Agent, ensuring that your report on the TestProject platform is complete.

# License

The TestProject JavaScript OpenSDK is licensed under the LICENSE file in the root directory of the project source tree.
