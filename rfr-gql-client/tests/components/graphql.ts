import {Page, Request} from "@playwright/test";

type Responses = Record<string, unknown>;

const CORS = {"access-control-allow-origin": "*", "access-control-allow-headers": "*"};

export const operation = (request: Request): string | undefined =>
    request.method() === "POST" ? request.postDataJSON()?.operationName : undefined;

export const graphql = async (page: Page, responses: Responses) => {
    await page.route("**/graphql", (route) => {
        const name = operation(route.request());
        if (route.request().method() === "OPTIONS") {
            return route.fulfill({status: 204, headers: CORS});
        }
        if (!name || !(name in responses)) {
            return route.fulfill({status: 500, headers: CORS, json: {errors: [{message: `No mock for ${name}`}]}});
        }
        return route.fulfill({headers: CORS, json: responses[name]});
    });
};
