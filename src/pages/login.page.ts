import type { Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/env';

export class LoginPage {
  private readonly usernameInput = 'input[name="username"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly submitButton = 'button[type="submit"]';
  private readonly successBanner = 'text=Welcome';

  constructor(private readonly page: Page) {}

  async goto() {
    const env = getEnvConfig();
    await this.page.goto(`${env.baseUrl}${env.loginPath}`);
  }

  async login(username: string, password: string) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }

  async isLoggedIn() {
    return this.page.isVisible(this.successBanner);
  }
}
