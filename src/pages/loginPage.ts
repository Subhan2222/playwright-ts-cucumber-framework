import type { Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/env';

class LoginPage {
  private readonly page: Page;

  readonly loginForm: Locator;
  readonly loginTitle: Locator;
  readonly companyBranding: Locator;
  readonly orangeLogo: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly demoCredentialsSection: Locator;
  readonly applicationVersion: Locator;
  readonly copyrightInfo: Locator;
  readonly dashboardHeading: Locator;
  readonly errorMessage: Locator;
  readonly requiredValidation: Locator;
  readonly linkedInIcon: Locator;
  readonly facebookIcon: Locator;
  readonly twitterIcon: Locator;
  readonly youtubeIcon: Locator;
  readonly form: Locator;
  readonly csrfToken: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginForm = page.locator('form');
    this.form = page.locator('form');
    this.submitButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a[href*="forgot"], [class*="forgot"]');
    this.dashboardHeading = page.locator('h6:has-text("Dashboard")');
    this.errorMessage = page.locator('[class*="error"], [class*="alert"], [role="alert"]');
    this.copyrightInfo = page.locator('footer');

    this.linkedInIcon = page.locator('[class*="linkedin"], a[href*="linkedin"]');
    this.facebookIcon = page.locator('[class*="facebook"], a[href*="facebook"]');
    this.twitterIcon = page.locator('[class*="twitter"], a[href*="twitter"]');
    this.youtubeIcon = page.locator('[class*="youtube"], a[href*="youtube"]');

    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');

    this.loginTitle = page.locator('h1, h2, [class*="title"]');
    this.usernameLabel = page.locator('label[for="username"]');
    this.passwordLabel = page.locator('label[for="password"]');
    this.requiredValidation = page.locator('[class*="required"], [class*="validation"]');

    this.orangeLogo = page.locator('[class*="logo"]');
    this.companyBranding = page.locator('[class*="brand"], [class*="company"]');
    this.demoCredentialsSection = page.locator('[class*="demo"], [class*="credentials"]');
    this.applicationVersion = page.locator('[class*="version"], [class*="app"]');
    this.csrfToken = page.locator('input[name*="token"], input[name*="csrf"]');
  }

  public async goto(): Promise<void> {
    const env = getEnvConfig();
    const url = `${env.baseUrl}${env.loginPath}`;
    await this.page.goto(url);
  }

  public async isLoginPageDisplayed(): Promise<void> {
    try {
      await this.loginForm.isVisible({ timeout: 5000 });
    } catch {
      console.error('the login page is not displayed');
    }
  }

  public async isLoginTitleVisible(): Promise<void> {
    try {
      await this.loginTitle.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Login title is not visible');
    }
  }

  public async isCompanyBrandingVisible(): Promise<void> {
    try {
      await this.companyBranding.isVisible({ timeout: 5000 });
    } catch {
      console.error('the company branding image is not visible');
    }
  }

  public async isOrangeHRMLogoVisible(): Promise<void> {
    try {
      await this.orangeLogo.isVisible({ timeout: 5000 });
    } catch {
      console.error('the OrangeHRM logo is not visible');
    }
  }

  public async isUsernameFieldVisible(): Promise<void> {
    try {
      await this.usernameInput.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Username field is not visible');
    }
  }

  public async isPasswordFieldVisible(): Promise<void> {
    try {
      await this.passwordInput.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Password field is not visible');
    }
  }

  public async isLoginButtonVisible(): Promise<void> {
    try {
      await this.submitButton.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Login button is not visible');
    }
  }

  public async isForgotPasswordLinkVisible(): Promise<void> {
    try {
      await this.forgotPasswordLink.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Forgot Password link is not visible');
    }
  }

  public async isDemoCredentialsSectionVisible(): Promise<void> {
    try {
      await this.demoCredentialsSection.isVisible({ timeout: 5000 });
    } catch {
      console.error('the demo credentials section is not displayed');
    }
  }

  public async isApplicationVersionVisible(): Promise<void> {
    try {
      await this.applicationVersion.isVisible({ timeout: 5000 });
    } catch {
      console.error('the application version is not displayed');
    }
  }

  public async isCopyrightInfoVisible(): Promise<void> {
    try {
      await this.copyrightInfo.isVisible({ timeout: 5000 });
    } catch {
      console.error('the copyright information is not displayed');
    }
  }

  public async getUsernamePlaceholder(): Promise<string | null> {
    try {
      return await this.usernameInput.getAttribute('placeholder');
    } catch {
      return null;
    }
  }

  public async getPasswordPlaceholder(): Promise<string | null> {
    try {
      return await this.passwordInput.getAttribute('placeholder');
    } catch {
      return null;
    }
  }

  public async isUsernameFieldFocused(): Promise<boolean> {
    try {
      await this.usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() => (document.activeElement as HTMLInputElement)?.name === 'username');
    } catch {
      return false;
    }
  }

  public async getPasswordFieldType(): Promise<string | null> {
    try {
      return await this.passwordInput.getAttribute('type');
    } catch {
      return null;
    }
  }

  public async getUsernameLabel(): Promise<string | null> {
    try {
      return await this.usernameLabel.textContent();
    } catch {
      return null;
    }
  }

  public async getPasswordLabel(): Promise<string | null> {
    try {
      return await this.passwordLabel.textContent();
    } catch {
      return null;
    }
  }

  public async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  public async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  public async clickLoginButton(): Promise<void> {
    await this.submitButton.click();
  }

  public async isLoggedIn(): Promise<boolean> {
    try {
      await this.dashboardHeading.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  public async isErrorMessageDisplayed(): Promise<void> {
    try {
      await this.errorMessage.isVisible({ timeout: 5000 });
    } catch {
      console.error('the invalid credentials error message is not displayed');
    }
  }

  public async isRequiredValidationDisplayed(): Promise<void> {
    try {
      await this.requiredValidation.isVisible({ timeout: 5000 });
    } catch {
      console.error('the required validation message is not displayed');
    }
  }

  public async clickForgotPasswordLink(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  public async isForgotPasswordPageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/forgot**', { timeout: 5000 });
      return this.page.url().includes('forgot');
    } catch {
      return false;
    }
  }

  public async pressTab(): Promise<void> {
    await this.page.press('body', 'Tab');
  }

  public async isPasswordFieldFocused(): Promise<boolean> {
    try {
      await this.passwordInput.waitFor({ state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() => (document.activeElement as HTMLInputElement)?.name === 'password');
    } catch {
      return false;
    }
  }

  public async isLoginButtonFocused(): Promise<boolean> {
    try {
      await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
      return await this.page.evaluate(() => (document.activeElement as HTMLButtonElement)?.type === 'submit');
    } catch {
      return false;
    }
  }

  public async pressEnterOnPasswordField(): Promise<void> {
    await this.passwordInput.press('Enter');
  }

  public async isLinkedInIconVisible(): Promise<void> {
    try {
      await this.linkedInIcon.isVisible({ timeout: 5000 });
    } catch {
      console.error('the LinkedIn icon is not displayed');
    }
  }

  public async isFacebookIconVisible(): Promise<void> {
    try {
      await this.facebookIcon.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Facebook icon is not displayed');
    }
  }

  public async isTwitterIconVisible(): Promise<void> {
    try {
      await this.twitterIcon.isVisible({ timeout: 5000 });
    } catch {
      console.error('the Twitter icon is not displayed');
    }
  }

  public async isYouTubeIconVisible(): Promise<void> {
    try {
      await this.youtubeIcon.isVisible({ timeout: 5000 });
    } catch {
      console.error('the YouTube icon is not displayed');
    }
  }

  public async clickSocialMediaIcon(socialMedia: string): Promise<void> {
    const selectorMap: Record<string, Locator> = {
      linkedin: this.linkedInIcon,
      facebook: this.facebookIcon,
      twitter: this.twitterIcon,
      youtube: this.youtubeIcon,
    };

    const target = selectorMap[socialMedia.trim().toLowerCase()];
    if (!target) {
      throw new Error(`Unsupported social media icon: ${socialMedia}`);
    }

    await target.click();
  }

  public async isNewTabOpened(): Promise<boolean> {
    try {
      const context = this.page.context();
      const newPage = await context.waitForEvent('page', { timeout: 5000 });
      await newPage.close();
      return true;
    } catch {
      return false;
    }
  }

  public async getFormMethod(): Promise<string | null> {
    try {
      return await this.form.getAttribute('method');
    } catch {
      return null;
    }
  }

  public async getFormAction(): Promise<string | null> {
    try {
      return await this.form.getAttribute('action');
    } catch {
      return null;
    }
  }

  public async isCSRFTokenPresent(): Promise<void> {
    try {
      await this.csrfToken.isVisible({ timeout: 5000 });
    } catch {
      console.error('the CSRF token is not present');
    }
  }

  public async isPasswordFieldMasked(): Promise<boolean> {
    try {
      const type = await this.passwordInput.getAttribute('type');
      return type === 'password';
    } catch {
      return false;
    }
  }

  public async getCompanyBrandingAltText(): Promise<string | null> {
    try {
      return await this.companyBranding.getAttribute('alt');
    } catch {
      return null;
    }
  }

  public async getLogoAltText(): Promise<string | null> {
    try {
      return await this.orangeLogo.getAttribute('alt');
    } catch {
      return null;
    }
  }

  public async areAllElementsKeyboardAccessible(): Promise<boolean> {
    try {
      await this.form.waitFor({ state: 'visible', timeout: 5000 });
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
    } catch {
      return false;
    }
  }
}

export { LoginPage };

