import { request } from '@playwright/test';
import { test, expect } from '../fixtures/fixture';
import { readJson, toBoolean } from '../utils/dataReader';
import APiUtils from '../utils/apiUtil';
import { logStep, logError } from '../utils/logger';

type User = { email: string; password: string };
type UsersData = { validUser: User; invalidUser: User };
type Product = { productName: string; expectedInCart: boolean };

const users = readJson<UsersData>('test-data/users.json');
const products = readJson<Product[]>('test-data/products.json');
const loginPayload = { userEmail: "syedarubeena18@gmail.com", userPassword: "Playwright@123" };
let token: any;

test.describe('Dashboard Page - Data Driven (JSON)', () => {
    test.beforeAll(async () => {

        const apiContext = await request.newContext();
        const apiUtils = new APiUtils(apiContext, loginPayload);
        token = await apiUtils.getToken()


    })

    /*
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goTo();
        await loginPage.validLogin(users.validUser.email, users.validUser.password);
    });
    */

    for (const product of products.filter(p => p.expectedInCart)) {
        test(`should add "${product.productName}" to cart`, async ({ dashboardPage, page }) => {
            page.addInitScript(value => {

                window.localStorage.setItem('token', value);
            }, token);

            await page.goto("/client/");

            await dashboardPage.searchProductAddCart(product.productName);
            await dashboardPage.navigateToCart();
            await expect(page).toHaveURL(/cart/);
        });
    }

    test('should navigate to orders page', async ({ dashboardPage, page }) => {
        page.addInitScript(value => {

                window.localStorage.setItem('token', value);
            }, token);

            await page.goto("/client/");
        await dashboardPage.navigateToOrders();
        await expect(page).toHaveURL(/myorders/);
    });
});