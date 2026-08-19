import { test, expect, request } from '@playwright/test'

//payload for login api call.
const loginPayload = { userEmail: "syedarubeena18@gmail.com", userPassword: "Playwright@123" };


test.beforeAll(async () => {

    const apiContext = await request.newContext();
    const loginResponse = await apiContext.post("https://rahulshettyacademy.com/api/ecom/auth/login",
        {
            data: loginPayload
        })
        expect(loginResponse.ok()).toBeTruthy();
        const loginResponseJson = await loginResponse.json();
        const token = loginResponseJson.token;
        console.log(token)

})