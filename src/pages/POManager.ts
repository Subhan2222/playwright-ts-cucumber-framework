import { Page } from '@playwright/test';
import {LoginPage} from './loginPage';
import {dashboardPage } from './dashBoardPage';

class POManager {
  private readonly page: Page

  private readonly pages: {
    loginPage?: LoginPage; 
    dashboardPage?: dashboardPage;
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

    getDashboardPage(): dashboardPage {
      if (!this.pages.dashboardPage) {
        this.pages.dashboardPage = new dashboardPage(this.page);
      }
      return this.pages.dashboardPage;
    }
}

export default POManager;
