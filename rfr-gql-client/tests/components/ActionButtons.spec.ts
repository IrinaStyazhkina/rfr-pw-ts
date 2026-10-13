import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Default} from "../../src/components/Table/ActionButtons/ActionButtons.story";
import {graphql, operation} from "./graphql";
import {failure, person} from "./fixtures";

const ACTIONS = [
    {status: undefined, button: "Add", action: "ADD", success: "Invitation sent", fallback: "Can not send invitation"},
    {status: "NOT_FRIEND", button: "Add", action: "ADD", success: "Invitation sent", fallback: "Can not send invitation"},
    {status: "FRIEND", button: "Remove", action: "DELETE", success: "Friend deleted", fallback: "Can not delete friend"},
    {status: "INVITATION_SENT", button: "Cancel", action: "DELETE", success: "Invitation cancelled", fallback: "Can not cancel invitation"},
    {status: "INVITATION_RECEIVED", button: "Accept", action: "ACCEPT", success: "Invitation accepted", fallback: "Can not accept invitation"},
    {status: "INVITATION_RECEIVED", button: "Decline", action: "REJECT", success: "Invitation declined", fallback: "Can not decline invitation"},
] as const;

for (const {status, button, action, success, fallback} of ACTIONS) {
    test(`${button} button for ${status ?? "a stranger"} sends the ${action} action`, async ({mount, page}) => {
        const userId = randomUUID();
        await graphql(page, {FriendshipAction: {data: {friendship: person()}}});
        const component = await mount<typeof Default>("ActionButtons/Default", {userId, friendStatus: status});
        const request = page.waitForRequest((r) => operation(r) === "FriendshipAction");
        await component.getByRole("button", {name: button}).click();
        expect((await request).postDataJSON().variables.input, `${button} button does not send ${action}`).toEqual({user: userId, action});
    });

    test(`${button} button for ${status ?? "a stranger"} confirms success`, async ({mount, page}) => {
        await graphql(page, {FriendshipAction: {data: {friendship: person()}}});
        const component = await mount<typeof Default>("ActionButtons/Default", {userId: randomUUID(), friendStatus: status});
        await component.getByRole("button", {name: button}).click();
        await expect(component.getByRole("alert"), `${button} button does not confirm success`).toHaveText(success);
    });

    test(`${button} button for ${status ?? "a stranger"} explains a failure`, async ({mount, page}) => {
        await graphql(page, {FriendshipAction: failure("database is down")});
        const component = await mount<typeof Default>("ActionButtons/Default", {userId: randomUUID(), friendStatus: status});
        await component.getByRole("button", {name: button}).click();
        await expect(component.getByRole("alert"), `${button} button does not explain the failure`).toHaveText(fallback);
    });
}

test("pending invitation shows a waiting badge", async ({mount}) => {
    const component = await mount<typeof Default>("ActionButtons/Default", {userId: randomUUID(), friendStatus: "INVITATION_SENT"});
    await expect(component.getByText("Waiting..."), "Pending invitation does not show the waiting badge").toBeVisible();
});

test("friend cannot be invited again", async ({mount}) => {
    const component = await mount<typeof Default>("ActionButtons/Default", {userId: randomUUID(), friendStatus: "FRIEND"});
    await expect(component.getByRole("button", {name: "Add"}), "Friend can be invited again").toHaveCount(0);
});

test("server rejection shows the server message", async ({mount, page}) => {
    const message = `User ${randomUUID()} is already your friend`;
    await graphql(page, {FriendshipAction: failure(message, "BAD_REQUEST")});
    const component = await mount<typeof Default>("ActionButtons/Default", {userId: randomUUID()});
    await component.getByRole("button", {name: "Add"}).click();
    await expect(component.getByRole("alert"), "Server rejection message is hidden").toHaveText(message);
});
