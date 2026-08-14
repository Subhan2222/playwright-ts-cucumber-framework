// Generate a readable HTML report from Cucumber JSON results
import reporter from 'cucumber-html-reporter';

const options: any = {
  theme: 'bootstrap',
  jsonFile: 'test-results/reports/cucumber-report.json',
  output: 'test-results/reports/cucumber-extended-report.html',
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    'App Version': '1.0.0',
    'Test Environment': process.env.TEST_ENV || 'local',
    Browser: process.env.BROWSER || 'chromium',
    Platform: process.platform,
    Executed: 'Local'
  }
};

reporter.generate(options);
