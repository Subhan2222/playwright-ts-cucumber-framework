import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../pages/login.page';

Given('I open the login page', async function () {
  const loginPage = new LoginPage((this as any).page);
  await loginPage.goto();
});

When('I enter valid credentials', async function () {
  const loginPage = new LoginPage((this as any).page);
  await loginPage.login('Admin', 'admin123');
});

Then('I should be logged in successfully', async function () {
  const loginPage = new LoginPage((this as any).page);
  const loggedIn = await loginPage.isLoggedIn();
  if (!loggedIn) {
    throw new Error('Login was not successful');
  }
});
