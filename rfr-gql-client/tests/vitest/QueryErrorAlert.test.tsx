import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {CombinedGraphQLErrors} from "@apollo/client";
import {QueryErrorAlert} from "../../src/components/QueryErrorAlert";
import {Scaffold} from "./Scaffold";
import {between, word} from "./fixtures";

const failure = (message: string, classification: string) =>
    new CombinedGraphQLErrors({errors: [{message, extensions: {classification}}]});

test("alert renders nothing without an error", async () => {
    await render(<Scaffold><QueryErrorAlert onRetry={() => undefined}/></Scaffold>);
    await expect.element(page.getByRole("alert"), {message: "Alert renders without an error"}).not.toBeInTheDocument();
});

test("alert shows the server message for a bad request", async () => {
    const message = `Photo ${word()} is too large`;
    await render(<Scaffold><QueryErrorAlert error={failure(message, "BAD_REQUEST")}/></Scaffold>);
    await expect.element(page.getByRole("alert"), {message: "Alert hides the user facing server message"}).toHaveTextContent(message);
});

test("alert shows the server message for a missing entity", async () => {
    const message = `User ${word()} not found`;
    await render(<Scaffold><QueryErrorAlert error={failure(message, "NOT_FOUND")}/></Scaffold>);
    await expect.element(page.getByRole("alert"), {message: "Alert hides the not found message"}).toHaveTextContent(message);
});

test("alert hides internal server details behind the fallback", async () => {
    const fallback = `Can not load ${word()}`;
    await render(<Scaffold><QueryErrorAlert error={failure("NullPointerException", "INTERNAL_ERROR")} fallback={fallback}/></Scaffold>);
    await expect.element(page.getByRole("alert"), {message: "Alert leaks internal server details"}).toHaveTextContent(fallback);
});

test("alert uses the default fallback when none is given", async () => {
    await render(<Scaffold><QueryErrorAlert error={failure("stack trace", "INTERNAL_ERROR")}/></Scaffold>);
    await expect.element(page.getByRole("alert"), {message: "Alert does not use the default fallback"}).toHaveTextContent("Can not load data");
});

test("alert offers no retry without a retry handler", async () => {
    await render(<Scaffold><QueryErrorAlert error={failure("x", "INTERNAL_ERROR")}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Retry"}), {message: "Alert offers a retry it cannot perform"}).not.toBeInTheDocument();
});

test("retry button reports every retry", async () => {
    const onRetry = vi.fn();
    await render(<Scaffold><QueryErrorAlert error={failure("x", "INTERNAL_ERROR")} onRetry={onRetry}/></Scaffold>);
    const retries = between(1, 4);
    for (let i = 0; i < retries; i++) {
        await page.getByRole("button", {name: "Retry"}).click();
    }
    expect(onRetry, "Retry button did not report every retry").toHaveBeenCalledTimes(retries);
});
