import { Page, Locator } from '@playwright/test';

class DashboardPage {
  readonly page: Page;
  readonly products: Locator;
  readonly productsText: Locator;
  readonly cart: Locator;
  readonly orders: Locator;

  constructor(page: Page) {
    this.page = page;
    this.products = page.locator(".card-body");
    this.productsText = page.locator(".card-body b");
    this.cart = page.locator("[routerlink*='cart']");
    //this.orders = page.locator("button[routerlink*='myorders']");
    this.orders = page.locator("//button[contains(@routerlink, 'myorders')]")
  }

  async searchProductAddCart(productName: string): Promise<void> {
    const titles = await this.productsText.allTextContents();
    console.log(titles);

    const count = await this.products.count();
    for (let i = 0; i < count; ++i) {
      if ((await this.products.nth(i).locator("b").textContent()) === productName) {
        // add to cart
        await this.products.nth(i).locator("text= Add To Cart").click();
        break;
      }
    }
  }

  async navigateToOrders(): Promise<void> {
    await this.orders.click();
  }

  async navigateToCart(): Promise<void> {
    await this.cart.click();
  }
}
export default DashboardPage;