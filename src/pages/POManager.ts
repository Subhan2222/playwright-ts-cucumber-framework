import { Page } from '@playwright/test';
import {LoginPage} from './loginPage';

class POManager {
  private readonly page: Page

  private readonly pages: {
    loginPage?: LoginPage; 
  }

    constructor(page: Page) {
      this.page = page;
      this.pages = {};
    }

    getLoginPage(): LoginPage {
      if (!this.pages.loginPage) {
        this.pages.loginPage = new LoginPage(this.page);
      }
      return this.pages.loginPage;
    }
}

export default POManager;
