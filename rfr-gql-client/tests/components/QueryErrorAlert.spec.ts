import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Failed} from "../../src/components/QueryErrorAlert/QueryErrorAlert.story";

test("alert renders nothing without an error", async ({mount}) => {
    const component = await mount("QueryErrorAlert/WithoutError");
    await expect(component.getByRole("alert"), "Alert renders without an error").toHaveCount(0);
});

test("alert shows the server message for a bad request", async ({mount}) => {
    const message = `Photo ${randomUUID()} is too large`;
    const component = await mount<typeof Failed>("QueryErrorAlert/Failed", {message, classification: "BAD_REQUEST"});
    await expect(component.getByRole("alert"), "Alert hides the user facing server message").toHaveText(message);
});

test("alert shows the server message for a missing entity", async ({mount}) => {
    const message = `User ${randomUUID()} not found`;
    const component = await mount<typeof Failed>("QueryErrorAlert/Failed", {message, classification: "NOT_FOUND"});
    await expect(component.getByRole("alert"), "Alert hides the not found message").toHaveText(message);
});

test("alert hides internal server details behind the fallback", async ({mount}) => {
    const fallback = `Can not load ${randomUUID().slice(0, 8)}`;
    const component = await mount<typeof Failed>("QueryErrorAlert/Failed", {message: "NullPointerException", classification: "INTERNAL_ERROR", fallback});
    await expect(component.getByRole("alert"), "Alert leaks internal server details").toHaveText(fallback);
});

test("alert uses the default fallback when none is given", async ({mount}) => {
    const component = await mount<typeof Failed>("QueryErrorAlert/Failed", {message: "stack trace", classification: "INTERNAL_ERROR"});
    await expect(component.getByRole("alert"), "Alert does not use the default fallback").toHaveText("Can not load data");
});

test("alert offers no retry without a retry handler", async ({mount}) => {
    const component = await mount<typeof Failed>("QueryErrorAlert/Failed", {message: "x", classification: "INTERNAL_ERROR"});
    await expect(component.getByRole("button", {name: "Retry"}), "Alert offers a retry it cannot perform").toHaveCount(0);
});

test("retry button reports every retry", async ({mount}) => {
    const component = await mount("QueryErrorAlert/Retryable");
    const retries = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < retries; i++) {
        await component.getByRole("button", {name: "Retry"}).click();
    }
    await expect(component.getByTestId("retries"), "Retry button did not report every retry").toHaveValue(String(retries));
});
