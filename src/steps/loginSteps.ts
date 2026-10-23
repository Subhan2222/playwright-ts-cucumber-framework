import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../pages/loginPage';
import { basePage } from '../../utils/basePage';
import { getEnvConfig } from '../../utils/envConfig';
import { decryptUserDataFile, getUserCredentials, getUserCredentialsById } from '../../utils/userCredentials';

function getLoginPage(world: any): LoginPage {
  return world.pageManager.getLoginPage();
}

// ==================== Background ====================
Given('the user navigates to the OrangeHRM login page', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  const page = new basePage(this.page);
  const env = getEnvConfig();
  await page.navigateTo(env.loginPath);
  await LoginPage.isLoginPageDisplayed();
});

// ==================== LOGIN-01: Verify all login page elements ====================
Then('the Login page should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isLoginPageDisplayed();
});

Then('the Login title should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  const isVisible = await LoginPage.isLoginTitleVisible();
});

Then('the company branding image should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isCompanyBrandingVisible();
});

Then('the OrangeHRM logo should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isOrangeHRMLogoVisible();
});

Then('the Username field should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isUsernameFieldVisible();

});

Then('the Password field should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isPasswordFieldVisible();
});

Then('the Login button should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isLoginButtonVisible();
});

Then('the Forgot Password link should be visible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isForgotPasswordLinkVisible();
});

Then('the demo credentials section should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isDemoCredentialsSectionVisible();
});

Then('the application version should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isApplicationVersionVisible();
});

Then('the copyright information should be displayed', async function (): Promise<void> {
  await getLoginPage(this).isCopyrightInfoVisible();

});

// ==================== LOGIN-02: Verify login form field properties ====================
Then('the Username field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getUsernamePlaceholder();
});

Then('the Password field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getPasswordPlaceholder();
});

Then('the Username field should be focused by default', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isUsernameFieldFocused();
});

Then('the Password field type should be {string}', async function (type: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getPasswordFieldType();
});

Then('the Username field should have label {string}', async function (label: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getUsernameLabel();
});

Then('the Password field should have label {string}', async function (label: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getPasswordLabel();
});

// ==================== LOGIN-03: Verify successful login ====================

Given('the user logs in with credentials for user ID {string}', async function (userId: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await decryptUserDataFile();
  const user = getUserCredentialsById(userId);
  await LoginPage.enterUsername(user.username);
  await LoginPage.enterPassword(user.password);
});

When('the user enters password {string}', async function (password: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.enterPassword(password);
});

When('the user enters username {string}', async function (username: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.enterUsername(username);
})

When('clicks on Login button', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.clickLoginButton();
});

Then('the user should be redirected to Dashboard page', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isLoggedIn();
});

// ==================== LOGIN-04: Verify invalid login attempts ====================
Then('an invalid credentials error message should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isErrorMessageDisplayed();
});

// ==================== LOGIN-05: Verify mandatory field validations ====================
Then('the required validation message should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isRequiredValidationDisplayed();
});

// ==================== LOGIN-06: Verify forgot password navigation ====================
When('the user clicks the Forgot Password link', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.clickForgotPasswordLink();
});

Then('the user should be redirected to Forgot Password page', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isForgotPasswordPageLoaded();
});

// ==================== LOGIN-07: Verify keyboard accessibility ====================
When('the user presses Tab key', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.pressTab();
});

Then('the Password field should receive focus', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isPasswordFieldFocused()
});

When('the user presses Tab key again', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.pressTab();
});

Then('the Login button should receive focus', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isLoginButtonFocused()
});

// ==================== LOGIN-08: Verify login using Enter key ====================
When('presses Enter key', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.pressEnterOnPasswordField();
});

// ==================== LOGIN-09: Verify social media links ====================
Then('LinkedIn icon should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isLinkedInIconVisible();
});

Then('Facebook icon should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isFacebookIconVisible();
});

Then('Twitter icon should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isTwitterIconVisible();
});

Then('YouTube icon should be displayed', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isYouTubeIconVisible();
});

// ==================== LOGIN-10: Verify social media navigation ====================
When('the user clicks {string} icon', async function (socialMedia: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.clickSocialMediaIcon(socialMedia);
});

Then('the respective page should open in a new tab', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isNewTabOpened();
});

// ==================== LOGIN-11: Verify login form security ====================
Then('the login form method should be {string}', async function (method: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getFormMethod();
});

Then('the login form action should contain {string}', async function (action: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getFormAction();
});

Then('the CSRF token should be present', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isCSRFTokenPresent();
});

Then('the Password field should be masked', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.isPasswordFieldMasked();
});

// ==================== LOGIN-12: Verify image accessibility ====================
Then('the company branding image should have alt text {string}', async function (altText: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getCompanyBrandingAltText();
});

Then('the logo image should have alt text {string}', async function (altText: string): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.getLogoAltText();
});

Then('all interactive elements should be keyboard accessible', async function (): Promise<void> {
  const LoginPage = getLoginPage(this);
  await LoginPage.areAllElementsKeyboardAccessible();
});
