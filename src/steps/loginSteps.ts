import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../pages/loginPage';


function getLoginPage(world: any): LoginPage {
  return world.pageManager.getLoginPage();
}

// ==================== Background ====================
Given('the user navigates to the OrangeHRM login page', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.goto();
});

// ==================== LOGIN-01: Verify all login page elements ====================
Then('the Login page should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isLoginPageDisplayed();
});

Then('the Login title should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  const isVisible = await loginPage.isLoginTitleVisible();
});

Then('the company branding image should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isCompanyBrandingVisible();
});

Then('the OrangeHRM logo should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isOrangeHRMLogoVisible();
});

Then('the Username field should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isUsernameFieldVisible();

});

Then('the Password field should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isPasswordFieldVisible();
});

Then('the Login button should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isLoginButtonVisible();
});

Then('the Forgot Password link should be visible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isForgotPasswordLinkVisible();
});

Then('the demo credentials section should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isDemoCredentialsSectionVisible();
});

Then('the application version should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isApplicationVersionVisible();
});

Then('the copyright information should be displayed', async function (): Promise<void> {
  await getLoginPage(this).isCopyrightInfoVisible();

});

// ==================== LOGIN-02: Verify login form field properties ====================
Then('the Username field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getUsernamePlaceholder();
});

Then('the Password field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getPasswordPlaceholder();
});

Then('the Username field should be focused by default', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isUsernameFieldFocused();
});

Then('the Password field type should be {string}', async function (type: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getPasswordFieldType();
});

Then('the Username field should have label {string}', async function (label: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getUsernameLabel();
});

Then('the Password field should have label {string}', async function (label: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getPasswordLabel();
});

// ==================== LOGIN-03: Verify successful login ====================
When('the user enters username {string}', async function (username: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.enterUsername(username);
});

When('the user enters password {string}', async function (password: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.enterPassword(password);
});

When('clicks on Login button', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.clickLoginButton();
});

Then('the user should be redirected to Dashboard page', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isLoggedIn();
});

// ==================== LOGIN-04: Verify invalid login attempts ====================
Then('an invalid credentials error message should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isErrorMessageDisplayed();
});

// ==================== LOGIN-05: Verify mandatory field validations ====================
Then('the required validation message should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isRequiredValidationDisplayed();
});

// ==================== LOGIN-06: Verify forgot password navigation ====================
When('the user clicks the Forgot Password link', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.clickForgotPasswordLink();
});

Then('the user should be redirected to Forgot Password page', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isForgotPasswordPageLoaded();
});

// ==================== LOGIN-07: Verify keyboard accessibility ====================
When('the user presses Tab key', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.pressTab();
});

Then('the Password field should receive focus', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isPasswordFieldFocused()
});

When('the user presses Tab key again', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.pressTab();
});

Then('the Login button should receive focus', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isLoginButtonFocused()
});

// ==================== LOGIN-08: Verify login using Enter key ====================
When('presses Enter key', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.pressEnterOnPasswordField();
});

// ==================== LOGIN-09: Verify social media links ====================
Then('LinkedIn icon should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isLinkedInIconVisible();
});

Then('Facebook icon should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isFacebookIconVisible();
});

Then('Twitter icon should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isTwitterIconVisible();
});

Then('YouTube icon should be displayed', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isYouTubeIconVisible();
});

// ==================== LOGIN-10: Verify social media navigation ====================
When('the user clicks {string} icon', async function (socialMedia: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.clickSocialMediaIcon(socialMedia);
});

Then('the respective page should open in a new tab', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isNewTabOpened();
});

// ==================== LOGIN-11: Verify login form security ====================
Then('the login form method should be {string}', async function (method: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getFormMethod();
});

Then('the login form action should contain {string}', async function (action: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getFormAction();
});

Then('the CSRF token should be present', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isCSRFTokenPresent();
});

Then('the Password field should be masked', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.isPasswordFieldMasked();
});

// ==================== LOGIN-12: Verify image accessibility ====================
Then('the company branding image should have alt text {string}', async function (altText: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getCompanyBrandingAltText();
});

Then('the logo image should have alt text {string}', async function (altText: string): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.getLogoAltText();
});

Then('all interactive elements should be keyboard accessible', async function (): Promise<void> {
  const loginPage: LoginPage = this.pageManager.getLoginPage();
  await loginPage.areAllElementsKeyboardAccessible();
});
