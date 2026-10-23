import {When, Then} from '@cucumber/cucumber';
import {dashboardPage} from '../pages/dashBoardPage';

function getDashboardPage(world: any): dashboardPage {
  return world.pageManager.getDashboardPage();
}

Then('the user should see the following dashboard menu {string}', async function (menuOption: string) {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.verifyDashboardMenu(menuOption);
});

When('the user searches for {string} in the dashboard menu', async function (searchItem: string) {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.searchForItem(searchItem);
});

Then('the user should see the search results containing {string}', async function (searchItem: string) {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.verifySearchResults(searchItem);
});

When('the user clicks on the Hide button in the dashboard menu', async function () {
  const dashboardPage = getDashboardPage(this);
  await dashboardPage.clickHideButton();
});

Then('the dashboard menu should be hidden from view', async function () {
    const dashboardPage = getDashboardPage(this);
    await dashboardPage.verifyMenuHidden();
});
    