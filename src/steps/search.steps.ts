import { Given, When, Then } from '@cucumber/cucumber';
import { SearchPage } from '../pages/search.page';

Given('I open the search page', async function () {
  const searchPage = new SearchPage((this as any).page);
  await searchPage.goto();
});

When('I search for {string}', async function (query: string) {
  const searchPage = new SearchPage((this as any).page);
  await searchPage.search(query);
});

Then('I should see relevant search results', async function () {
  const searchPage = new SearchPage((this as any).page);
  const resultsVisible = await searchPage.hasResults();
  if (!resultsVisible) {
    throw new Error('Expected search results to be visible');
  }
});
