import { test, expect } from '../fixtures/fixture'
import readCsv, { readJson, writeJson } from '../utils/dataReader';
import { logStep, logError, logger } from '../utils/logger';

type OrderRow = {
  countryCode: string;
  countryName: string;
  productName: string;
  email: string;
};
type UsersData = { validUser: { email: string; password: string } };

const orderRows = readCsv<OrderRow>('test-data/orders.csv');
const users = readJson<UsersData>('test-data/users.json');

test.describe('End-to-End Order Flow - Data Driven (CSV)', () => {
  for (const row of orderRows) {
    test(`full flow: order "${row.productName}" → ${row.countryName}`, async ({
      loginPage,
      dashboardPage,
      ordersReviewPage,
      ordersHistoryPage,
    }) => {
      try {
        // 1. Login
        logStep("Logging in");
        await loginPage.goTo();
        await loginPage.validLogin(users.validUser.email, users.validUser.password);
      } catch (error) {
        logError('E2E-Login step', error);
        throw error;
      }

      try {
        logStep(`Adding product to cart: ${row.productName}`);
        // 2. Add product to cart
        await dashboardPage.searchProductAddCart(row.productName);
        await dashboardPage.navigateToCart();

        // 3. Proceed to checkout and place order
        await dashboardPage.page.waitForTimeout(5000);

        await dashboardPage.page.locator("text=Checkout").click();

        //await dashboardPage.page.locator("text=Place Order").click();
      } catch (error) {
        logError('E2E - Add to cart / checkout step', error);
        throw error;
      }
      let expectedOrderId;

      try {
        logStep(`Completing order review for ${row.countryName}`);
        // 4. Complete order review
        await ordersReviewPage.VerifyEmailId(row.email);
        await ordersReviewPage.searchCountryAndSelect(row.countryCode, row.countryName);
        let orderId = await ordersReviewPage.SubmitAndGetOrderId();
        expect(orderId).not.toBeNull();

        if (orderId != null) {
          expectedOrderId = orderId.replace(/[|\s]/g, '').trim();
        }
        logger.info('Order submitted', { expectedOrderId, product: row.productName, country: row.countryName });
        //writeJson('test-data/orderIds.json', expectedOrderId as string);
      } catch (error) {
        logError('E2E - Order review/submission step', error);
        throw error;
      }

      // 5. Verify order appears in order history
      try {
        logStep(`Verifying order ${expectedOrderId} appears in order history`);
        await dashboardPage.navigateToOrders();
        await ordersHistoryPage.searchOrderAndSelect(expectedOrderId as string);
        const confirmedOrderId = await ordersHistoryPage.getOrderId();
        expect(confirmedOrderId).toContain(expectedOrderId);
        logger.info('Order confirmed in history', { expectedOrderId });
      } catch (error) {
        logError(`E2E - Order history verification for order ${expectedOrderId}`, error);
        throw error;
      }


    });
  }
});