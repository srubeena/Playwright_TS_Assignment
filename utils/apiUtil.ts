import { expect } from "@playwright/test";

class APiUtils {
    apiContext: any;
    loginPayLoad: any;

    constructor(apiContext: any, loginPayLoad: any) {
        this.apiContext = apiContext;
        this.loginPayLoad = loginPayLoad;

    }

    async getToken() {
        const loginResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login",
            {
                data: this.loginPayLoad
            })//200,201,
        //expect(loginResponse.ok()).toBeTruthy();
        const loginResponseJson = await loginResponse.json();
        const token = loginResponseJson.token;
        console.log(token);
        return token;

    }

    async createOrder(orderPayLoad: any) {
        const token = await this.getToken();
        const orderResponse = await this.apiContext.post("https://rahulshettyacademy.com/api/ecom/order/create-order",
            {
                data: orderPayLoad,
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },

            })
        const orderResponseJson = await orderResponse.json();
        console.log(orderResponseJson);
        const orderId = orderResponseJson.orders[0];

        const response = {
            token,
            orderId,
        };

        return response;
    }

}
export default APiUtils;