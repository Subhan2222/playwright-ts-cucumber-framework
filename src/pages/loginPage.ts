import type { Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/env';

class LoginPage {
  private readonly SELECTORS = {
    loginForm: 'form',
    loginTitle: 'h1, h2, [class*="title"]',
    companyBranding: '[class*="brand"], [class*="company"]',
    orangeLogo: '[class*="logo"]',
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    forgotPasswordLink: 'a[href*="forgot"], [class*="forgot"]',
    demoCredentialsSection: '[class*="demo"], [class*="credentials"]',
    applicationVersion: '[class*="version"], [class*="app"]',
    copyrightInfo: '[class*="copy"], footer',
    dashboardHeading: 'h6:has-text("Dashboard")',
    errorMessage: '[class*="error"], [class*="alert"], [role="alert"]',
    requiredValidation: '[class*="required"], [class*="validation"]',
    linkedInIcon: '[class*="linkedin"], a[href*="linkedin"]',
    facebookIcon: '[class*="facebook"], a[href*="facebook"]',
    twitterIcon: '[class*="twitter"], a[href*="twitter"]',
    youtubeIcon: '[class*="youtube"], a[href*="youtube"]',
    form: 'form',
    csrfToken: 'input[name*="csrf"], input[name*="token"]',
    usernameLabel: 'label[for="username"]',
    passwordLabel: 'label[for="password"]',
  };

  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto(): Promise<void> {
    try {
      const env = getEnvConfig();
      const url = `${env.baseUrl}${env.loginPath}`;
      await this.page.goto(url);
    } catch (error) {
      console.error('Error navigating to the login page:', error);
      throw error;
    }
  }

  public async isLoginPageDisplayed(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.loginForm, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
       console.error('Login form not visible within the timeout period.', error);
      return false;
    }
  }

  public async isLoginTitleVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.loginTitle, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Login title not visible within the timeout period.', error);
      return false;
    }
  }

  public async isCompanyBrandingVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.companyBranding, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Company branding not visible within the timeout period.', error);
      return false;
    }
  }

  public async isOrangeHRMLogoVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.orangeLogo, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Orange HRM logo not visible within the timeout period.', error);
      return false;
    }
  }

  public async isUsernameFieldVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.usernameInput, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Username field not visible within the timeout period.', error);
      return false;
    }
  }

  public async isPasswordFieldVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordInput, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Password field not visible within the timeout period.', error);
      return false;
    }
  }

  public async isLoginButtonVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.submitButton, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Login button not visible within the timeout period.', error);
      return false;
    }
  }

  public async isForgotPasswordLinkVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.forgotPasswordLink, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Forgot Password link not visible within the timeout period.', error);
      return false;
    }
  }

  public async isDemoCredentialsSectionVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.demoCredentialsSection, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Demo credentials section not visible within the timeout period.', error);
      return false;
    }
  }

  public async isApplicationVersionVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.applicationVersion, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Application version not visible within the timeout period.', error);
      return false;
    }
  }

  public async isCopyrightInfoVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.copyrightInfo, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Copyright info not visible within the timeout period.', error);
      return false;
    }
  }

  // ==================== Field Properties ====================
  public async getUsernamePlaceholder(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.usernameInput, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.usernameInput, 'placeholder');
    } catch (error) {
      console.error('Username field not visible within the timeout period.', error);
      return null;
    }
  }

  public async getPasswordPlaceholder(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordInput, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.passwordInput, 'placeholder');
    } catch (error) {
      console.error('Password field not visible within the timeout period.', error);
      return null;
    }
  }

  public async isUsernameFieldFocused(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.usernameInput, { state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() =>
        (document.activeElement as HTMLInputElement)?.name === 'username'
      );
    } catch (error) {
      console.error('Username field not visible within the timeout period.', error);
      return false;
    }
  }

  public async getPasswordFieldType(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordInput, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.passwordInput, 'type');
    } catch (error) {
      console.error('Password field not visible within the timeout period.', error);
      return null;
    }
  }

  public async getUsernameLabel(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.usernameLabel, { state: 'visible', timeout: 5000 });
      return await this.page.textContent(this.SELECTORS.usernameLabel);
    } catch (error) {
      console.error('Username label not visible within the timeout period.', error);
      return null;
    }
  }

  public async getPasswordLabel(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordLabel, { state: 'visible', timeout: 5000 });
      return await this.page.textContent(this.SELECTORS.passwordLabel);
    } catch (error) {
      console.error('Password label not visible within the timeout period.', error);
      return null;
    }
  }

  // ==================== Login Actions ====================
  public async enterUsername(username: string): Promise<void> {
    try {
      await this.page.fill(this.SELECTORS.usernameInput, username);
    } catch (error) {
      console.error('Error entering username:', error);
      throw error;
    }
  }

  public async enterPassword(password: string): Promise<void> {
    try {
      await this.page.fill(this.SELECTORS.passwordInput, password);
    } catch (error) {
      console.error('Error entering password:', error);
      throw error;
    }
  }

  public async clickLoginButton(): Promise<void> {
    try {
      await this.page.click(this.SELECTORS.submitButton);
    } catch (error) {
      console.error('Error clicking login button:', error);
      throw error;
    }
  }

  public async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.locator(this.SELECTORS.dashboardHeading).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // ==================== Error and Validation ====================
  public async isErrorMessageDisplayed(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.errorMessage, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      console.error('Error message not visible within the timeout period.');
      return false;
    }
  }

  public async isRequiredValidationDisplayed(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.requiredValidation, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      console.error('Required validation not visible within the timeout period.');
      return false;
    }
  }

  // ==================== Navigation Actions ====================
  public async clickForgotPasswordLink(): Promise<void> {
    try {
      await this.page.click(this.SELECTORS.forgotPasswordLink);
    } catch (error) {
      console.error('Error clicking forgot password link:', error);
      throw error;
    }
  }

  public async isForgotPasswordPageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/forgot**', { timeout: 5000 });
      return this.page.url().includes('forgot');
    } catch {
      return false;
    }
  }

  // ==================== Keyboard Accessibility ====================
  public async pressTab(): Promise<void> {
    try {
      await this.page.press('body', 'Tab');
    } catch (error) {
      console.error('Error pressing Tab:', error);
      throw error;
    }
  }

  public async isPasswordFieldFocused(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordInput, { state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() =>
        (document.activeElement as HTMLInputElement)?.name === 'password'
      );
    } catch (error) {
      console.error('Password field not visible within the timeout period.', error);
      return false;
    }
  }

  public async isLoginButtonFocused(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.submitButton, { state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() =>
        (document.activeElement as HTMLButtonElement)?.type === 'submit'
      );
    } catch (error) {
      console.error('Login button not visible within the timeout period.', error);
      return false;
    }
  }

  public async pressEnterOnPasswordField(): Promise<void> {
    await this.page.press(this.SELECTORS.passwordInput, 'Enter');
  }

  // ==================== Social Media ====================
  public async isLinkedInIconVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.linkedInIcon, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('LinkedIn icon not visible within the timeout period.', error);
      return false;
    }
  }

  public async isFacebookIconVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.facebookIcon, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Facebook icon not visible within the timeout period.', error);
      return false;
    }
  }

  public async isTwitterIconVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.twitterIcon, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Twitter icon not visible within the timeout period.', error);
      return false;
    }
  }

  public async isYouTubeIconVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.youtubeIcon, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('YouTube icon not visible within the timeout period.', error);
      return false;
    }
  }

  public async clickSocialMediaIcon(socialMedia: string): Promise<void> {
    try {
      const selector = this.SELECTORS[`${socialMedia.toLowerCase()}Icon` as keyof typeof this.SELECTORS];
      await this.page.click(selector);
    } catch (error) {
      console.error(`Error clicking ${socialMedia} icon:`, error);
      throw error;
    }
  }

  public async isNewTabOpened(): Promise<boolean> {
    try {
      const context = this.page.context();
      const newPage = await context.waitForEvent('page', { timeout: 5000 });
      await newPage.close();
      return true;
    } catch (error) {
      console.error('Error occurred while waiting for new tab:', error);
      return false;
    }
  }

  // ==================== Form Security ====================
  public async getFormMethod(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.form, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.form, 'method');
    } catch (error) {
      console.error('Form not visible within the timeout period.', error);
      return null;
    }
  }

  public async getFormAction(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.form, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.form, 'action');
    } catch (error) {
      console.error('Form not visible within the timeout period.', error);
      return null;
    }
  }

  public async isCSRFTokenPresent(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.csrfToken, { state: 'visible', timeout: 5000 });
      return true;
    } catch (error) {
      console.error('CSRF token not visible within the timeout period.', error);
      return false;
    }
  }

  public async isPasswordFieldMasked(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.passwordInput, { state: 'visible', timeout: 5000 });
      const fieldType = await this.page.getAttribute(this.SELECTORS.passwordInput, 'type');
      return fieldType === 'password';
    } catch (error) {
      console.error('Password field not visible within the timeout period.', error);
      return false;
    }
  }

  // ==================== Accessibility ====================
  public async getCompanyBrandingAltText(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.companyBranding, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.companyBranding, 'alt');
    } catch (error) {
      console.error('Company branding not visible within the timeout period.', error);
      return null;
    }
  }

  public async getLogoAltText(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.SELECTORS.orangeLogo, { state: 'visible', timeout: 5000 });
      return await this.page.getAttribute(this.SELECTORS.orangeLogo, 'alt');
    } catch (error) {
      console.error('Logo not visible within the timeout period.', error);
      return null;
    }
  }

  public async areAllElementsKeyboardAccessible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.SELECTORS.form, { state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, input');
        let allAccessible = true;
        buttons.forEach((btn) => {
          const tabindex = btn.getAttribute('tabindex');
          if (tabindex === '-1') {
            allAccessible = false;
          }
        });
        return allAccessible;
      });
    } catch (error) {
      console.error('Form not visible within the timeout period.', error);
      return false;
    }
  }
}

export { LoginPage };

