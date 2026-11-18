import { When, Then } from '@cucumber/cucumber';
import { adminPage } from '../pages/adminPage';

function getAdminPage(world: any): adminPage {
    return world.pageManager.getAdminPage();
}

// ==================== ADMIN-01 / Navigation ====================
When('the user clicks on the Admin menu', async function () {
    const admin = getAdminPage(this);
    await admin.clickAdminMenu();
});

Then('the Admin page should be displayed', async function () {
    const admin = getAdminPage(this);
    await admin.isAdminPageDisplayed();
});

// ==================== ADMIN-02 / Page title ====================
Then('the Admin page title should be {string}', async function (expectedTitle: string) {
    const admin = getAdminPage(this);
    const actualTitle = await admin.getAdminPageTitle();
    if (!actualTitle.includes(expectedTitle)) {
        throw new Error(`Expected Admin page title to contain "${expectedTitle}" but got "${actualTitle}"`);
    }
});

// ==================== ADMIN-03 / Navigation tabs ====================
Then('the following admin navigation tabs should be visible {string}', async function (tab: string) {
    const admin = getAdminPage(this);
    await admin.isNavTabVisible(tab);
});

// ==================== ADMIN-04 / Search by Username ====================
When('the user enters {string} in the Username search field', async function (username: string) {
    const admin = getAdminPage(this);
    await admin.enterUsername(username);
});

When('the user clicks the Search button on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.clickSearch();
});

Then('the search results should be displayed on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.isSearchResultsDisplayed();
});

// ==================== ADMIN-05 / Search by User Role ====================
When('the user selects {string} from the User Role dropdown', async function (role: string) {
    const admin = getAdminPage(this);
    await admin.selectUserRole(role);
});

// ==================== ADMIN-06 / Search by Employee Name ====================
When('the user enters {string} in the Employee Name search field', async function (name: string) {
    const admin = getAdminPage(this);
    await admin.enterEmployeeName(name);
});

// ==================== ADMIN-07 / Search by Status ====================
When('the user selects {string} from the Status dropdown', async function (status: string) {
    const admin = getAdminPage(this);
    await admin.selectStatus(status);
});

// ==================== ADMIN-09 / Reset filters ====================
When('the user clicks the Reset button on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.clickReset();
});

Then('the Admin search filters should be cleared', async function () {
    const admin = getAdminPage(this);
    await admin.areSearchFiltersCleared();
});

// ==================== ADMIN-10 / No records found ====================
Then('no records should be found on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.isNoRecordsFound();
});

// ==================== ADMIN-11 / Table columns ====================
Then('the Admin records table should display the following columns {string}', async function (column: string) {
    const admin = getAdminPage(this);
    await admin.isColumnVisible(column);
});

// ==================== ADMIN-12 / Record count ====================
Then('the Admin page should display the total records count', async function () {
    const admin = getAdminPage(this);
    await admin.isTotalRecordsCountDisplayed();
});

// ==================== ADMIN-13 / Add button ====================
When('the user clicks the Add button on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.clickAddButton();
});

Then('the Add User form should be displayed', async function () {
    const admin = getAdminPage(this);
    await admin.isAddUserFormDisplayed();
});

// ==================== ADMIN-14 / Save without data ====================
When('the user clicks the Save button on Add User form', async function () {
    const admin = getAdminPage(this);
    await admin.clickSave();
});

// ==================== ADMIN-15 / Edit user ====================
When('the user clicks the edit icon for the first record on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.clickFirstEditIcon();
});

Then('the Edit User form should be displayed', async function () {
    const admin = getAdminPage(this);
    await admin.isEditUserFormDisplayed();
});

// ==================== ADMIN-16 / Delete confirmation ====================
When('the user clicks the delete icon for the first record on Admin page', async function () {
    const admin = getAdminPage(this);
    await admin.clickFirstDeleteIcon();
});

Then('the delete confirmation dialog should be displayed', async function () {
    const admin = getAdminPage(this);
    await admin.isDeleteConfirmationDisplayed();
});

// ==================== ADMIN-17 / Cancel delete ====================
When('the user clicks Cancel on the delete confirmation dialog', async function () {
    const admin = getAdminPage(this);
    await admin.clickCancelDelete();
});
