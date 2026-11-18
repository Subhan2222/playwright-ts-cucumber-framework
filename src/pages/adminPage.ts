import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

class adminPage {
    private page: Page;

    // ── Navigation ────────────────────────────────────────────────
    readonly adminMenuLink: Locator;

    // ── Page header ───────────────────────────────────────────────
    readonly pageTitle: Locator;

    // ── Top navigation tabs ───────────────────────────────────────
    readonly topNavTabs: Locator;

    // ── Search form ───────────────────────────────────────────────
    readonly usernameSearchInput: Locator;
    readonly userRoleDropdown: Locator;
    readonly employeeNameInput: Locator;
    readonly statusDropdown: Locator;
    readonly searchButton: Locator;
    readonly resetButton: Locator;

    // ── Records table ─────────────────────────────────────────────
    readonly recordsCount: Locator;
    readonly tableRows: Locator;

    // ── Add user ──────────────────────────────────────────────────
    readonly addButton: Locator;
    readonly addUserForm: Locator;
    readonly saveButton: Locator;

    // ── Edit / Delete actions ─────────────────────────────────────
    readonly editIcons: Locator;
    readonly deleteIcons: Locator;
    readonly editUserForm: Locator;
    readonly deleteConfirmationDialog: Locator;
    readonly cancelDeleteButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation
        this.adminMenuLink = page.getByRole('link', { name: 'Admin', exact: true });

        // Page header
        this.pageTitle = page.locator('h6.oxd-topbar-header-breadcrumb-module');

        // Top navigation tabs
        this.topNavTabs = page.locator('.oxd-topbar-body-nav-tab');

        // Search form
        this.usernameSearchInput = page.locator('input.oxd-input').first();
        this.userRoleDropdown = page.locator('.oxd-select-wrapper').nth(0);
        this.employeeNameInput = page.locator('input[placeholder="Type for hints..."]');
        this.statusDropdown = page.locator('.oxd-select-wrapper').nth(1);
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.resetButton = page.getByRole('button', { name: 'Reset' });

        // Records table
        this.recordsCount = page.locator('.orangehrm-horizontal-padding span');
        this.tableRows = page.locator('.oxd-table-body .oxd-table-row');

        // Add user
        this.addButton = page.getByRole('button', { name: '+ Add' });
        this.addUserForm = page.locator('.orangehrm-card-container');
        this.saveButton = page.getByRole('button', { name: 'Save' });

        // Edit / Delete
        this.editIcons = page.locator('button .bi-pencil-fill').locator('..');
        this.deleteIcons = page.locator('button .bi-trash').locator('..');
        this.editUserForm = page.locator('.orangehrm-card-container');
        this.deleteConfirmationDialog = page.locator('.oxd-dialog-container');
        this.cancelDeleteButton = page.getByRole('button', { name: 'No, Cancel' });
    }

    // ── Navigation ────────────────────────────────────────────────

    public async clickAdminMenu(): Promise<void> {
        try {
            await this.adminMenuLink.click();
        } catch (error) {
            console.error(`Error clicking Admin menu: ${error}`);
            throw error;
        }
    }

    // ── Page load verifications ───────────────────────────────────

    public async isAdminPageDisplayed(): Promise<void> {
        try {
            await expect(this.pageTitle).toBeVisible();
        } catch (error) {
            console.error(`Error verifying Admin page is displayed: ${error}`);
            throw error;
        }
    }

    public async getAdminPageTitle(): Promise<string> {
        try {
            return await this.pageTitle.innerText();
        } catch (error) {
            console.error(`Error getting Admin page title: ${error}`);
            throw error;
        }
    }

    public async isNavTabVisible(tabName: string): Promise<void> {
        try {
            const tab = this.page.locator('.oxd-topbar-body-nav-tab', { hasText: tabName });
            await expect(tab).toBeVisible();
        } catch (error) {
            console.error(`Error verifying nav tab "${tabName}" is visible: ${error}`);
            throw error;
        }
    }

    // ── Search ────────────────────────────────────────────────────

    public async enterUsername(username: string): Promise<void> {
        try {
            await this.usernameSearchInput.clear();
            await this.usernameSearchInput.fill(username);
        } catch (error) {
            console.error(`Error entering username in search: ${error}`);
            throw error;
        }
    }

    public async selectUserRole(role: string): Promise<void> {
        try {
            await this.userRoleDropdown.click();
            await this.page.getByRole('option', { name: role, exact: true }).click();
        } catch (error) {
            console.error(`Error selecting user role "${role}": ${error}`);
            throw error;
        }
    }

    public async enterEmployeeName(name: string): Promise<void> {
        try {
            await this.employeeNameInput.fill(name);
        } catch (error) {
            console.error(`Error entering employee name in search: ${error}`);
            throw error;
        }
    }

    public async selectStatus(status: string): Promise<void> {
        try {
            await this.statusDropdown.click();
            await this.page.getByRole('option', { name: status, exact: true }).click();
        } catch (error) {
            console.error(`Error selecting status "${status}": ${error}`);
            throw error;
        }
    }

    public async clickSearch(): Promise<void> {
        try {
            await this.searchButton.click();
        } catch (error) {
            console.error(`Error clicking Search button: ${error}`);
            throw error;
        }
    }

    public async clickReset(): Promise<void> {
        try {
            await this.resetButton.click();
        } catch (error) {
            console.error(`Error clicking Reset button: ${error}`);
            throw error;
        }
    }

    // ── Table ─────────────────────────────────────────────────────

    public async isSearchResultsDisplayed(): Promise<void> {
        try {
            await expect(this.recordsCount).toBeVisible();
        } catch (error) {
            console.error(`Error verifying search results are displayed: ${error}`);
            throw error;
        }
    }

    public async isTotalRecordsCountDisplayed(): Promise<void> {
        try {
            await expect(this.recordsCount).toBeVisible();
        } catch (error) {
            console.error(`Error verifying total records count is displayed: ${error}`);
            throw error;
        }
    }

    public async isColumnVisible(columnName: string): Promise<void> {
        try {
            const column = this.page.locator('.oxd-table-header .oxd-table-header-cell', { hasText: columnName });
            await expect(column).toBeVisible();
        } catch (error) {
            console.error(`Error verifying column "${columnName}" is visible: ${error}`);
            throw error;
        }
    }

    public async isNoRecordsFound(): Promise<void> {
        try {
            await expect(this.page.getByText('No Records Found')).toBeVisible();
        } catch (error) {
            console.error(`Error verifying no records found message: ${error}`);
            throw error;
        }
    }

    public async areSearchFiltersCleared(): Promise<void> {
        try {
            await expect(this.usernameSearchInput).toHaveValue('');
        } catch (error) {
            console.error(`Error verifying search filters are cleared: ${error}`);
            throw error;
        }
    }

    // ── Add User ──────────────────────────────────────────────────

    public async clickAddButton(): Promise<void> {
        try {
            await this.addButton.click();
        } catch (error) {
            console.error(`Error clicking Add button: ${error}`);
            throw error;
        }
    }

    public async isAddUserFormDisplayed(): Promise<void> {
        try {
            await expect(this.addUserForm).toBeVisible();
        } catch (error) {
            console.error(`Error verifying Add User form is displayed: ${error}`);
            throw error;
        }
    }

    public async clickSave(): Promise<void> {
        try {
            await this.saveButton.click();
        } catch (error) {
            console.error(`Error clicking Save button: ${error}`);
            throw error;
        }
    }

    // ── Edit User ─────────────────────────────────────────────────

    public async clickFirstEditIcon(): Promise<void> {
        try {
            await this.editIcons.first().click();
        } catch (error) {
            console.error(`Error clicking first edit icon: ${error}`);
            throw error;
        }
    }

    public async isEditUserFormDisplayed(): Promise<void> {
        try {
            await expect(this.editUserForm).toBeVisible();
        } catch (error) {
            console.error(`Error verifying Edit User form is displayed: ${error}`);
            throw error;
        }
    }

    // ── Delete User ───────────────────────────────────────────────

    public async clickFirstDeleteIcon(): Promise<void> {
        try {
            await this.deleteIcons.first().click();
        } catch (error) {
            console.error(`Error clicking first delete icon: ${error}`);
            throw error;
        }
    }

    public async isDeleteConfirmationDisplayed(): Promise<void> {
        try {
            await expect(this.deleteConfirmationDialog).toBeVisible();
        } catch (error) {
            console.error(`Error verifying delete confirmation dialog is displayed: ${error}`);
            throw error;
        }
    }

    public async clickCancelDelete(): Promise<void> {
        try {
            await this.cancelDeleteButton.click();
        } catch (error) {
            console.error(`Error clicking Cancel on delete confirmation: ${error}`);
            throw error;
        }
    }
}

export { adminPage };
