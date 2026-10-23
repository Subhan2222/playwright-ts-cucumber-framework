import type { Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/envConfig';
import { expect } from '@playwright/test';

class dashboardPage {
    private page: Page;

    SearchField: Locator;
    HideButton: Locator;
    MenuOptions: Locator;

    constructor(page: Page) {
        this.page = page;

        this.SearchField = page.getByPlaceholder('Search');
        this.HideButton = page.locator('//button[@class="oxd-icon-button oxd-main-menu-button"]');
        this.MenuOptions = page.getByRole('link', { name: 'menuOption', exact: true });
    }

    public async searchForItem(searchItem: string): Promise<void> {
        try {
            await this.SearchField.fill(searchItem);
            await this.SearchField.press('Enter');
        } catch (error) {
            console.error(`Error searching for item: ${error}`);
            throw error;
        }
    }

    public async verifyDashboardMenu(menuOption: string): Promise<void> {
        try {
            const menuOptionLocator = this.page.getByRole('link', { name: menuOption, exact: true });
            await expect(menuOptionLocator).toBeVisible();
        } catch (error) {
            console.error(`Error verifying dashboard menu option "${menuOption}": ${error}`);
            throw error;
        }
    }

    public async verifySearchResults(searchItem: string): Promise<void> {
        try {
            const searchResultLocator = this.page.getByRole('link', { name: searchItem, exact: true });
            await expect(searchResultLocator).toBeVisible();
        } catch (error) {
            console.error(`Error verifying search results for "${searchItem}": ${error}`);
            throw error;
        }
    }

    public async clickHideButton(): Promise<void> {
        try {
            await this.HideButton.click();
        } catch (error) {
            console.error(`Error clicking the Hide button: ${error}`);
            throw error;
        }
    }

    public async verifyMenuHidden(): Promise<void> {
        try {
            await expect(this.MenuOptions).toHaveCount(0);
        } catch (error) {
            console.error(`Error verifying that the dashboard menu is hidden: ${error}`);
            throw error;
        }
    }

}

export { dashboardPage };