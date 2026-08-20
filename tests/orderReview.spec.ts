import { json } from 'node:stream/consumers';
import { test, expect } from '../fixtures/fixture';
import readCsv, { readJson, writeJson } from '../utils/dataReader';
import { TIMEOUT } from 'node:dns';
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

test.describe('Orders Review Page - Data Driven (CSV)', () => {
  for (const row of orderRows) {
    test(`should place order for "${row.productName}" shipping to ${row.countryName}`, async ({
      loginPage,
      dashboardPage,
      ordersReviewPage,
    }) => {
      try {
        logStep(`Logging in as ${users.validUser.email}`);
        await loginPage.goTo();
        await loginPage.validLogin(users.validUser.email, users.validUser.password);
        logStep(`Adding product to cart: ${row.productName}`);

        await dashboardPage.searchProductAddCart(row.productName);
        await dashboardPage.navigateToCart();
        await dashboardPage.page.locator("text=Checkout").click();
        //await dashboardPage.page.locator("text=Place Order").click();

        logStep(`Verifying email: ${row.email}`);
        await ordersReviewPage.VerifyEmailId(row.email);

        logStep('Selecting country: ${row.countryName}');
        await ordersReviewPage.searchCountryAndSelect(row.countryCode, row.countryName);

        logStep('Submitting order');
        const orderId = await ordersReviewPage.SubmitAndGetOrderId();
        expect(orderId).not.toBeNull();
        logger.info(`Order placed successfully`, { orderId, product: row.productName, country: row.countryName });


        let expectedOrderId;
        if (orderId != null) {
          expectedOrderId = orderId.replace(/[|\s]/g, '').trim();
        }

        writeJson('test-data/orderIds.json', expectedOrderId as string);
        console.log(`Order placed for ${row.productName} → ${row.countryName}, ID: ${orderId}`);
      }
      catch (error) {
        logError('order placed for "${row.productName}" → ${row.countryName}', error);
        throw error;
      }

    });
  }
});