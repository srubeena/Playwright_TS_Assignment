import { test, expect } from '../fixtures/fixture';
import { readJson } from '../utils/dataReader';
import { logStep, logError } from '../utils/logger';

type UsersData = { validUser: { email: string; password: string } };

const users = readJson<UsersData>('test-data/users.json');
const existingOrderIds = readJson<string[]>('test-data/orderIds.json');


test.describe('Orders History Page - Mock Data (JSON)', () => {

    test.beforeEach(async ({ loginPage, dashboardPage }) => {
        try {
            logStep('Logging in and navigating to orders page');
            await loginPage.goTo();
            await loginPage.validLogin(users.validUser.email, users.validUser.password);
            await dashboardPage.navigateToOrders();
        } catch (error) {
            logError('Orders history test setup', error);
            throw error;
        }
    });

    for (const orderId of existingOrderIds) {
        test(`should find and select order ${orderId}`, async ({ ordersHistoryPage }) => {
            try {
                logStep(`Searching for order: ${orderId}`);
                await ordersHistoryPage.searchOrderAndSelect(orderId);

                logStep('Fetching displayed order ID');
                const displayedOrderId = await ordersHistoryPage.getOrderId();
                console.log("displayedOrderId: " + displayedOrderId);

                expect(displayedOrderId).toContain(orderId);
            } catch (error) {
                logError(`Order history lookup for "${orderId}"`, error);
                throw error;
            }
        });
    }
});