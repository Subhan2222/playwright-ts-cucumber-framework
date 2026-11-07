import type { Locator, Page } from '@playwright/test';
import { getEnvConfig } from '../../utils/envConfig';
import { expect } from '@playwright/test';

class adminPage {
    private page: Page;

    
  

    constructor(page: Page) {
        this.page = page;

        
    }

   

}

export { adminPage };