import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {ActionButtons} from "../../src/components/Table/ActionButtons";
import {FRIENDSHIP_ACTION} from "../../src/hooks/useUpdateFriendshipStatus";
import {Scaffold} from "./Scaffold";
import {answer, failure, recording} from "./apollo";
import {person, word} from "./fixtures";

const ACTIONS = [
    {status: undefined, button: "Add", action: "ADD", success: "Invitation sent", fallback: "Can not send invitation"},
    {status: "NOT_FRIEND", button: "Add", action: "ADD", success: "Invitation sent", fallback: "Can not send invitation"},
    {status: "FRIEND", button: "Remove", action: "DELETE", success: "Friend deleted", fallback: "Can not delete friend"},
    {status: "INVITATION_SENT", button: "Cancel", action: "DELETE", success: "Invitation cancelled", fallback: "Can not cancel invitation"},
    {status: "INVITATION_RECEIVED", button: "Accept", action: "ACCEPT", success: "Invitation accepted", fallback: "Can not accept invitation"},
    {status: "INVITATION_RECEIVED", button: "Decline", action: "REJECT", success: "Invitation declined", fallback: "Can not decline invitation"},
] as const;

for (const {status, button, action, success, fallback} of ACTIONS) {
    test(`${button} button for ${status ?? "a stranger"} sends the ${action} action`, async () => {
        const userId = crypto.randomUUID();
        const sent: Record<string, unknown>[] = [];
        await render(
            <Scaffold mocks={[recording(FRIENDSHIP_ACTION, {data: {friendship: person()}}, sent)]}>
                <ActionButtons userId={userId} friendStatus={status}/>
            </Scaffold>
        );
        await page.getByRole("button", {name: button}).click();
        await expect.poll(() => sent[0], {message: `${button} button does not send ${action}`}).toEqual({input: {user: userId, action}});
    });

    test(`${button} button for ${status ?? "a stranger"} confirms success`, async () => {
        await render(
            <Scaffold mocks={[answer(FRIENDSHIP_ACTION, {data: {friendship: person()}})]}>
                <ActionButtons userId={crypto.randomUUID()} friendStatus={status}/>
            </Scaffold>
        );
        await page.getByRole("button", {name: button}).click();
        await expect.element(page.getByRole("alert"), {message: `${button} button does not confirm success`}).toHaveTextContent(success);
    });

    test(`${button} button for ${status ?? "a stranger"} explains a failure`, async () => {
        await render(
            <Scaffold mocks={[answer(FRIENDSHIP_ACTION, failure("database is down"))]}>
                <ActionButtons userId={crypto.randomUUID()} friendStatus={status}/>
            </Scaffold>
        );
        await page.getByRole("button", {name: button}).click();
        await expect.element(page.getByRole("alert"), {message: `${button} button does not explain the failure`}).toHaveTextContent(fallback);
    });
}

test("pending invitation shows a waiting badge", async () => {
    await render(<Scaffold><ActionButtons userId={crypto.randomUUID()} friendStatus="INVITATION_SENT"/></Scaffold>);
    await expect.element(page.getByText("Waiting..."), {message: "Pending invitation does not show the waiting badge"}).toBeVisible();
});

test("friend cannot be invited again", async () => {
    await render(<Scaffold><ActionButtons userId={crypto.randomUUID()} friendStatus="FRIEND"/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Add"}), {message: "Friend can be invited again"}).not.toBeInTheDocument();
});

test("server rejection shows the server message", async () => {
    const message = `User ${word()} is already your friend`;
    await render(
        <Scaffold mocks={[answer(FRIENDSHIP_ACTION, failure(message, "BAD_REQUEST"))]}>
            <ActionButtons userId={crypto.randomUUID()}/>
        </Scaffold>
    );
    await page.getByRole("button", {name: "Add"}).click();
    await expect.element(page.getByRole("alert"), {message: "Server rejection message is hidden"}).toHaveTextContent(message);
});
