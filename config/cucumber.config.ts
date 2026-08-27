const config = {
  require: ['support/hooks.ts', 'src/steps/**/*.ts'],
  format: [
    'html:test-results/reports/cucumber-report.html',
    'json:test-results/reports/cucumber-report.json',
    'progress',
    'allure-cucumberjs/reporter',
  ],
  formatOptions: {
    resultsDir: 'test-results/allure-results',
  },
  paths: ['src/features/**/*.feature'],
};

export default config;