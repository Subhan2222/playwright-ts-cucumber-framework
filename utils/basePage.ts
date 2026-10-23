import { expect, Page } from '@playwright/test';
import { getEnvConfig } from './envConfig';


class basePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        try {
            const env = getEnvConfig();
            const fullUrl = `${env.baseUrl}${url}`;
            await this.page.goto(fullUrl);
            console.log(`Navigated to URL: ${fullUrl}`);
        } catch (error) {
            console.error(`Error navigating to URL "${url}": ${error}`);
            throw error;

        }
    }

    async getPageTitle(): Promise<string> {
        try {
            return await this.page.title();
        } catch (error) {
            console.error(`Error getting page title: ${error}`);
            throw error;
        }
    }
}

export { basePage };