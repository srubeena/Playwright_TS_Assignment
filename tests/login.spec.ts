import { test, expect } from '../fixtures/fixture';
import { readJson } from '../utils/dataReader';
import { logStep, logError, logger } from '../utils/logger';

type User = { email: string; password: string };
type UsersData = {
  validUser: User;
  invalidUser: User;
  invalidLoginErrorMessage: string;
};

const users = readJson<UsersData>('test-data/users.json');

test.describe('Login Page', () => {
  test.beforeEach(async ({ loginPage }) => {
    try {
      logStep('Navigating to login page');
      await loginPage.goTo();
    } catch (error) {
      logError('Navigating to login page', error);
      throw error;
    }
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    try {
      logStep(`Logging in with valid user: ${users.validUser.email}`);
      await loginPage.validLogin(users.validUser.email, users.validUser.password);

      logStep('Verifying dashboard is visible after login');
      await expect(page.locator('.card-body').first()).toBeVisible();
      await expect(page).not.toHaveURL(/login/);

      logger.info('Login successful, dashboard confirmed visible');
    } catch (error) {
      logError('Valid login test', error);
      throw error;
    }
  });

  test('should show an error with invalid credentials', async ({ loginPage, page }) => {
    try {
      logStep(`Attempting login with invalid user: ${users.invalidUser.email}`);
      await loginPage.validLogin(users.invalidUser.email, users.invalidUser.password);

      logStep('Verifying error toast is displayed');
      const errorToast = page.locator('.toast-message');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toHaveText(users.invalidLoginErrorMessage);
    } catch (error) {
      logError('Invalid login test', error);
      throw error;
    }
  });

  test('should stay on login page when fields are empty', async ({ loginPage, page }) => {
    try {
      logStep('Attempting login with empty fields');
      await loginPage.validLogin('', '');

      logStep('Verifying user remains on login page');
      await expect(page).toHaveURL(/client/);
    } catch (error) {
      logError('Empty fields login test', error);
      throw error;
    }
  });
});