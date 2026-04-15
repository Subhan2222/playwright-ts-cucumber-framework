import type { Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/env';

export class SearchPage {
  private readonly searchInput = 'input[name="q"]';
  private readonly searchButton = 'button[type="submit"]';
  private readonly resultsSelector = '.search-results';

  constructor(private readonly page: Page) {}

  async goto() {
    const env = getEnvConfig();
    await this.page.goto(`${env.baseUrl}${env.searchPath}`);
  }

  async search(term: string) {
    await this.page.fill(this.searchInput, term);
    await this.page.click(this.searchButton);
  }

  async hasResults() {
    return this.page.isVisible(this.resultsSelector);
  }
}
