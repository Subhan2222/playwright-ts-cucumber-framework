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

  // ==================== Navigation ====================
  public async goto(): Promise<void> {
    const env = getEnvConfig();
    await this.page.goto(`${env.baseUrl}${env.loginPath}`);
  }

  // ==================== Element Visibility ====================
  public async isLoginPageDisplayed(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.loginForm);
  }

  public async isLoginTitleVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.loginTitle);
  }

  public async isCompanyBrandingVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.companyBranding);
  }

  public async isOrangeHRMLogoVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.orangeLogo);
  }

  public async isUsernameFieldVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.usernameInput);
  }

  public async isPasswordFieldVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.passwordInput);
  }

  public async isLoginButtonVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.submitButton);
  }

  public async isForgotPasswordLinkVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.forgotPasswordLink);
  }

  public async isDemoCredentialsSectionVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.demoCredentialsSection);
  }

  public async isApplicationVersionVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.applicationVersion);
  }

  public async isCopyrightInfoVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.copyrightInfo);
  }

  // ==================== Field Properties ====================
  public async getUsernamePlaceholder(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.usernameInput, 'placeholder');
  }

  public async getPasswordPlaceholder(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.passwordInput, 'placeholder');
  }

  public async isUsernameFieldFocused(): Promise<boolean> {
    return await this.page.evaluate(() =>
      (document.activeElement as HTMLInputElement)?.name === 'username'
    );
  }

  public async getPasswordFieldType(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.passwordInput, 'type');
  }

  public async getUsernameLabel(): Promise<string | null> {
    return await this.page.textContent(this.SELECTORS.usernameLabel);
  }

  public async getPasswordLabel(): Promise<string | null> {
    return await this.page.textContent(this.SELECTORS.passwordLabel);
  }

  // ==================== Login Actions ====================
  public async enterUsername(username: string): Promise<void> {
    await this.page.fill(this.SELECTORS.usernameInput, username);
  }

  public async enterPassword(password: string): Promise<void> {
    await this.page.fill(this.SELECTORS.passwordInput, password);
  }

  public async clickLoginButton(): Promise<void> {
    await this.page.click(this.SELECTORS.submitButton);
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
    return await this.page.isVisible(this.SELECTORS.errorMessage);
  }

  public async isRequiredValidationDisplayed(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.requiredValidation);
  }

  // ==================== Navigation Actions ====================
  public async clickForgotPasswordLink(): Promise<void> {
    await this.page.click(this.SELECTORS.forgotPasswordLink);
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
    await this.page.press('body', 'Tab');
  }

  public async isPasswordFieldFocused(): Promise<boolean> {
    return await this.page.evaluate(() =>
      (document.activeElement as HTMLInputElement)?.name === 'password'
    );
  }

  public async isLoginButtonFocused(): Promise<boolean> {
    return await this.page.evaluate(() =>
      (document.activeElement as HTMLButtonElement)?.type === 'submit'
    );
  }

  public async pressEnterOnPasswordField(): Promise<void> {
    await this.page.press(this.SELECTORS.passwordInput, 'Enter');
  }

  // ==================== Social Media ====================
  public async isLinkedInIconVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.linkedInIcon);
  }

  public async isFacebookIconVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.facebookIcon);
  }

  public async isTwitterIconVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.twitterIcon);
  }

  public async isYouTubeIconVisible(): Promise<boolean> {
    return await this.page.isVisible(this.SELECTORS.youtubeIcon);
  }

  public async clickSocialMediaIcon(socialMedia: string): Promise<void> {
    const selector = `a[href*="${socialMedia.toLowerCase()}"], [class*="${socialMedia.toLowerCase()}"]`;
    await this.page.click(selector);
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

  // ==================== Form Security ====================
  public async getFormMethod(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.form, 'method');
  }

  public async getFormAction(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.form, 'action');
  }

  public async isCSRFTokenPresent(): Promise<boolean> {
    const token = await this.page.getAttribute(this.SELECTORS.csrfToken, 'value');
    return !!token;
  }

  public async isPasswordFieldMasked(): Promise<boolean> {
    const fieldType = await this.page.getAttribute(this.SELECTORS.passwordInput, 'type');
    return fieldType === 'password';
  }

  // ==================== Accessibility ====================
  public async getCompanyBrandingAltText(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.companyBranding, 'alt');
  }

  public async getLogoAltText(): Promise<string | null> {
    return await this.page.getAttribute(this.SELECTORS.orangeLogo, 'alt');
  }

  public async areAllElementsKeyboardAccessible(): Promise<boolean> {
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
  }
}

export { LoginPage };

