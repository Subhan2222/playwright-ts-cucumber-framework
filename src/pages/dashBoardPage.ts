import type { Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/envConfig';
import { expect } from '@playwright/test';

const DASHBOARD_MENU_OPTIONS = [
    'Admin',
    'PIM',
    'Leave',
    'Time',
    'Recruitment',
    'My Info',
    'Performance',
    'Dashboard',
    'Directory',
    'Maintenance',
    'Claim',
    'Buzz',
] as const;

const DASHBOARD_MENU_OPTIONS_PATTERN =
    /^(Admin|PIM|Leave|Time|Recruitment|My Info|Performance|Dashboard|Directory|Maintenance|Claim|Buzz)$/;

class dashboardPage {
    private page: Page;

    SearchField: Locator;
    HideButton: Locator;
    MenuOptions: Locator;

    constructor(page: Page) {
        this.page = page;

        this.SearchField = page.getByPlaceholder('Search');
        this.HideButton = page.locator('//button[@class="oxd-icon-button oxd-main-menu-button"]');
        this.MenuOptions = page.getByRole('link', { name: DASHBOARD_MENU_OPTIONS_PATTERN });
    }

    /** Read-only observation helpers for the optional, policy-checked POM facade. */
    public async isDashboardMenuVisible(menuOption: string): Promise<boolean> {
        return this.page.getByRole('link', { name: menuOption, exact: true }).isVisible();
    }

    public async isSearchResultVisible(searchItem: string): Promise<boolean> {
        return this.page.getByRole('link', { name: searchItem, exact: true }).isVisible();
    }

    public async isMenuHidden(): Promise<boolean> {
        const observedVisibility = await Promise.all(
            DASHBOARD_MENU_OPTIONS.map(async (menuOption) => {
                const menuOptionLocator = this.page.getByRole('link', {
                    name: menuOption,
                    exact: true,
                    includeHidden: true,
                });
                if ((await menuOptionLocator.count()) === 0) {
                    return undefined;
                }
                return menuOptionLocator.isVisible();
            })
        );
        const renderedMenuVisibility = observedVisibility.filter(
            (isVisible): isVisible is boolean => isVisible !== undefined
        );

        // A missing or partial match set is not evidence that the dashboard
        // menu is hidden: it can also mean the page is not ready or a locator
        // no longer matches the known menu.
        return renderedMenuVisibility.length === DASHBOARD_MENU_OPTIONS.length
            && renderedMenuVisibility.every((isVisible) => !isVisible);
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
            await expect.poll(() => this.isMenuHidden()).toBe(true);
        } catch (error) {
            console.error(`Error verifying that the dashboard menu is hidden: ${error}`);
            throw error;
        }
    }

}

export { dashboardPage };