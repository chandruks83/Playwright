import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'],['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {},

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'api-testing', //can give any name
      testMatch: 'example*', //Name of the test files
      dependencies: ['smoke-test'], //Dependant on smokeTest, it will not run if smoke test fails
    },
    {
      name:'smoke-test', //Just a name 
      testMatch: 'smoke*' //Can give the test filename or use * to run all test files starting with smoke
    }
,
    {
      name:'Mytest', //Just a name 
      testMatch: 'mytest*' //Can give the test filename or use * to run all test files starting with smoke
    }
  ],


});
