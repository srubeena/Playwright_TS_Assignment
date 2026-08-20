import { test as base, Page } from '@playwright/test';
import LoginPage from '../pages/loginPage';
import  DashboardPage from '../pages/dashboardPage';
import OrdersHistoryPage from '../pages/orderHistoryPage'
import OrdersReviewPage from '../pages/orderReviewPage';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  ordersHistoryPage: OrdersHistoryPage;
  ordersReviewPage: OrdersReviewPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  ordersHistoryPage: async ({ page }, use) => {
    await use(new OrdersHistoryPage(page));
  },
  ordersReviewPage: async ({ page }, use) => {
    await use(new OrdersReviewPage(page));
  },
});

export { expect } from '@playwright/test';