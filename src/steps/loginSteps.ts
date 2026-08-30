import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { LoginPage } from '../pages/loginPage';

setDefaultTimeout(30 * 60 * 1000);

// ==================== Background ====================
Given('the user navigates to the OrangeHRM login page', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.goto();
    console.log('✓ User navigated to OrangeHRM login page');
  } catch (error) {
    console.error('✗ Failed to navigate to login page:', error);
    throw error;
  }
});

// ==================== LOGIN-01: Verify all login page elements ====================
Then('the Login page should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isLoginPageDisplayed();
    if (!isVisible) throw new Error('Login page is not displayed');
    console.log('✓ Login page is displayed');
  } catch (error) {
    console.error('✗ Login page verification failed:', error);
    throw error;
  }
});

Then('the Login title should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isLoginTitleVisible();
    if (!isVisible) throw new Error('Login title is not visible');
    console.log('✓ Login title is visible');
  } catch (error) {
    console.error('✗ Login title verification failed:', error);
    throw error;
  }
});

Then('the company branding image should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isCompanyBrandingVisible();
    if (!isVisible) throw new Error('Company branding image is not visible');
    console.log('✓ Company branding image is visible');
  } catch (error) {
    console.error('✗ Company branding verification failed:', error);
    throw error;
  }
});

Then('the OrangeHRM logo should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isOrangeHRMLogoVisible();
    if (!isVisible) throw new Error('OrangeHRM logo is not visible');
    console.log('✓ OrangeHRM logo is visible');
  } catch (error) {
    console.error('✗ OrangeHRM logo verification failed:', error);
    throw error;
  }
});

Then('the Username field should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isUsernameFieldVisible();
    if (!isVisible) throw new Error('Username field is not visible');
    console.log('✓ Username field is visible');
  } catch (error) {
    console.error('✗ Username field verification failed:', error);
    throw error;
  }
});

Then('the Password field should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isPasswordFieldVisible();
    if (!isVisible) throw new Error('Password field is not visible');
    console.log('✓ Password field is visible');
  } catch (error) {
    console.error('✗ Password field verification failed:', error);
    throw error;
  }
});

Then('the Login button should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isLoginButtonVisible();
    if (!isVisible) throw new Error('Login button is not visible');
    console.log('✓ Login button is visible');
  } catch (error) {
    console.error('✗ Login button verification failed:', error);
    throw error;
  }
});

Then('the Forgot Password link should be visible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isForgotPasswordLinkVisible();
    if (!isVisible) throw new Error('Forgot Password link is not visible');
    console.log('✓ Forgot Password link is visible');
  } catch (error) {
    console.error('✗ Forgot Password link verification failed:', error);
    throw error;
  }
});

Then('the demo credentials section should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isDemoCredentialsSectionVisible();
    if (!isVisible) throw new Error('Demo credentials section is not displayed');
    console.log('✓ Demo credentials section is displayed');
  } catch (error) {
    console.error('✗ Demo credentials section verification failed:', error);
    throw error;
  }
});

Then('the application version should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isApplicationVersionVisible();
    if (!isVisible) throw new Error('Application version is not displayed');
    console.log('✓ Application version is displayed');
  } catch (error) {
    console.error('✗ Application version verification failed:', error);
    throw error;
  }
});

Then('the copyright information should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isCopyrightInfoVisible();
    if (!isVisible) throw new Error('Copyright information is not displayed');
    console.log('✓ Copyright information is displayed');
  } catch (error) {
    console.error('✗ Copyright information verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-02: Verify login form field properties ====================
Then('the Username field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const value = await loginPage.getUsernamePlaceholder();
    if (value !== placeholder) throw new Error(`Username placeholder is ${value}, expected ${placeholder}`);
    console.log(`✓ Username placeholder is "${placeholder}"`);
  } catch (error) {
    console.error('✗ Username placeholder verification failed:', error);
    throw error;
  }
});

Then('the Password field placeholder should be {string}', async function (placeholder: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const value = await loginPage.getPasswordPlaceholder();
    if (value !== placeholder) throw new Error(`Password placeholder is ${value}, expected ${placeholder}`);
    console.log(`✓ Password placeholder is "${placeholder}"`);
  } catch (error) {
    console.error('✗ Password placeholder verification failed:', error);
    throw error;
  }
});

Then('the Username field should be focused by default', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const focused = await loginPage.isUsernameFieldFocused();
    if (!focused) throw new Error('Username field is not focused');
    console.log('✓ Username field is focused by default');
  } catch (error) {
    console.error('✗ Username field focus verification failed:', error);
    throw error;
  }
});

Then('the Password field type should be {string}', async function (type: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const fieldType = await loginPage.getPasswordFieldType();
    if (fieldType !== type) throw new Error(`Password field type is ${fieldType}, expected ${type}`);
    console.log(`✓ Password field type is "${type}"`);
  } catch (error) {
    console.error('✗ Password field type verification failed:', error);
    throw error;
  }
});

Then('the Username field should have label {string}', async function (label: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const labelText = await loginPage.getUsernameLabel();
    if (labelText !== label) throw new Error(`Username label is ${labelText}, expected ${label}`);
    console.log(`✓ Username label is "${label}"`);
  } catch (error) {
    console.error('✗ Username label verification failed:', error);
    throw error;
  }
});

Then('the Password field should have label {string}', async function (label: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const labelText = await loginPage.getPasswordLabel();
    if (labelText !== label) throw new Error(`Password label is ${labelText}, expected ${label}`);
    console.log(`✓ Password label is "${label}"`);
  } catch (error) {
    console.error('✗ Password label verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-03: Verify successful login ====================
When('the user enters username {string}', async function (username: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.enterUsername(username);
    console.log(`✓ Username "${username}" entered`);
  } catch (error) {
    console.error('✗ Failed to enter username:', error);
    throw error;
  }
});

When('the user enters password {string}', async function (password: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.enterPassword(password);
    console.log('✓ Password entered');
  } catch (error) {
    console.error('✗ Failed to enter password:', error);
    throw error;
  }
});

When('clicks on Login button', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.clickLoginButton();
    console.log('✓ Login button clicked');
  } catch (error) {
    console.error('✗ Failed to click login button:', error);
    throw error;
  }
});

Then('the user should be redirected to Dashboard page', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isLoggedIn = await loginPage.isLoggedIn();
    if (!isLoggedIn) throw new Error('User is not logged in');
    console.log('✓ User redirected to Dashboard page');
  } catch (error) {
    console.error('✗ Dashboard redirect verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-04: Verify invalid login attempts ====================
Then('an invalid credentials error message should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isErrorMessageDisplayed();
    if (!isVisible) throw new Error('Error message is not displayed');
    console.log('✓ Invalid credentials error message displayed');
  } catch (error) {
    console.error('✗ Error message verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-05: Verify mandatory field validations ====================
Then('the required validation message should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isRequiredValidationDisplayed();
    if (!isVisible) throw new Error('Required validation message is not displayed');
    console.log('✓ Required validation message displayed');
  } catch (error) {
    console.error('✗ Validation message verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-06: Verify forgot password navigation ====================
When('the user clicks the Forgot Password link', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.clickForgotPasswordLink();
    console.log('✓ Forgot Password link clicked');
  } catch (error) {
    console.error('✗ Failed to click Forgot Password link:', error);
    throw error;
  }
});

Then('the user should be redirected to Forgot Password page', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isForgotPage = await loginPage.isForgotPasswordPageLoaded();
    if (!isForgotPage) throw new Error('User is not on Forgot Password page');
    console.log('✓ User redirected to Forgot Password page');
  } catch (error) {
    console.error('✗ Forgot Password redirect verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-07: Verify keyboard accessibility ====================
When('the user presses Tab key', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.pressTab();
    console.log('✓ Tab key pressed');
  } catch (error) {
    console.error('✗ Failed to press Tab key:', error);
    throw error;
  }
});

Then('the Password field should receive focus', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const focused = await loginPage.isPasswordFieldFocused();
    if (!focused) throw new Error('Password field did not receive focus');
    console.log('✓ Password field received focus');
  } catch (error) {
    console.error('✗ Password field focus verification failed:', error);
    throw error;
  }
});

When('the user presses Tab key again', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.pressTab();
    console.log('✓ Tab key pressed again');
  } catch (error) {
    console.error('✗ Failed to press Tab key again:', error);
    throw error;
  }
});

Then('the Login button should receive focus', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const focused = await loginPage.isLoginButtonFocused();
    if (!focused) throw new Error('Login button did not receive focus');
    console.log('✓ Login button received focus');
  } catch (error) {
    console.error('✗ Login button focus verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-08: Verify login using Enter key ====================
When('presses Enter key', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.pressEnterOnPasswordField();
    console.log('✓ Enter key pressed on password field');
  } catch (error) {
    console.error('✗ Failed to press Enter key:', error);
    throw error;
  }
});

// ==================== LOGIN-09: Verify social media links ====================
Then('LinkedIn icon should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isLinkedInIconVisible();
    if (!isVisible) throw new Error('LinkedIn icon is not displayed');
    console.log('✓ LinkedIn icon is displayed');
  } catch (error) {
    console.error('✗ LinkedIn icon verification failed:', error);
    throw error;
  }
});

Then('Facebook icon should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isFacebookIconVisible();
    if (!isVisible) throw new Error('Facebook icon is not displayed');
    console.log('✓ Facebook icon is displayed');
  } catch (error) {
    console.error('✗ Facebook icon verification failed:', error);
    throw error;
  }
});

Then('Twitter icon should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isTwitterIconVisible();
    if (!isVisible) throw new Error('Twitter icon is not displayed');
    console.log('✓ Twitter icon is displayed');
  } catch (error) {
    console.error('✗ Twitter icon verification failed:', error);
    throw error;
  }
});

Then('YouTube icon should be displayed', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isVisible = await loginPage.isYouTubeIconVisible();
    if (!isVisible) throw new Error('YouTube icon is not displayed');
    console.log('✓ YouTube icon is displayed');
  } catch (error) {
    console.error('✗ YouTube icon verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-10: Verify social media navigation ====================
When('the user clicks {string} icon', async function (socialMedia: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    await loginPage.clickSocialMediaIcon(socialMedia);
    console.log(`✓ ${socialMedia} icon clicked`);
  } catch (error) {
    console.error(`✗ Failed to click ${socialMedia} icon:`, error);
    throw error;
  }
});

Then('the respective page should open in a new tab', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const newTabOpened = await loginPage.isNewTabOpened();
    if (!newTabOpened) throw new Error('New page did not open');
    console.log('✓ New tab opened successfully');
  } catch (error) {
    console.error('✗ New tab verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-11: Verify login form security ====================
Then('the login form method should be {string}', async function (method: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const formMethod = await loginPage.getFormMethod();
    if (formMethod?.toUpperCase() !== method.toUpperCase()) {
      throw new Error(`Form method is ${formMethod}, expected ${method}`);
    }
    console.log(`✓ Form method is "${method}"`);
  } catch (error) {
    console.error('✗ Form method verification failed:', error);
    throw error;
  }
});

Then('the login form action should contain {string}', async function (action: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const formAction = await loginPage.getFormAction();
    if (!formAction?.includes(action)) {
      throw new Error(`Form action does not contain ${action}`);
    }
    console.log(`✓ Form action contains "${action}"`);
  } catch (error) {
    console.error('✗ Form action verification failed:', error);
    throw error;
  }
});

Then('the CSRF token should be present', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isPresent = await loginPage.isCSRFTokenPresent();
    if (!isPresent) throw new Error('CSRF token is not present');
    console.log('✓ CSRF token is present');
  } catch (error) {
    console.error('✗ CSRF token verification failed:', error);
    throw error;
  }
});

Then('the Password field should be masked', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const isMasked = await loginPage.isPasswordFieldMasked();
    if (!isMasked) throw new Error('Password field is not masked');
    console.log('✓ Password field is masked');
  } catch (error) {
    console.error('✗ Password field masking verification failed:', error);
    throw error;
  }
});

// ==================== LOGIN-12: Verify image accessibility ====================
Then('the company branding image should have alt text {string}', async function (altText: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const alt = await loginPage.getCompanyBrandingAltText();
    if (alt !== altText) throw new Error(`Company branding alt text is ${alt}, expected ${altText}`);
    console.log(`✓ Company branding alt text is "${altText}"`);
  } catch (error) {
    console.error('✗ Company branding alt text verification failed:', error);
    throw error;
  }
});

Then('the logo image should have alt text {string}', async function (altText: string): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const alt = await loginPage.getLogoAltText();
    if (alt !== altText) throw new Error(`Logo alt text is ${alt}, expected ${altText}`);
    console.log(`✓ Logo alt text is "${altText}"`);
  } catch (error) {
    console.error('✗ Logo alt text verification failed:', error);
    throw error;
  }
});

Then('all interactive elements should be keyboard accessible', async function (): Promise<void> {
  try {
    const loginPage: LoginPage = this.pageManager.getLoginPage();
    const accessible = await loginPage.areAllElementsKeyboardAccessible();
    if (!accessible) throw new Error('Not all interactive elements are keyboard accessible');
    console.log('✓ All interactive elements are keyboard accessible');
  } catch (error) {
    console.error('✗ Keyboard accessibility verification failed:', error);
    throw error;
  }
});
