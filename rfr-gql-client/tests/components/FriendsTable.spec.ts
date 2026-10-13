import {expect, test} from "@playwright/test";
import {graphql, operation} from "./graphql";
import {connection, failure, person, word} from "./fixtures";

const respond = (users: object) => ({data: {user: {__typename: "User", id: "me", friends: users}}});

test("table shows the users returned by the server", async ({mount, page}) => {
    const users = Array.from({length: 1 + Math.floor(Math.random() * 4)}, () => person());
    await graphql(page, {GetFriends: respond(connection(users))});
    const component = await mount("FriendsTable/Default");
    await expect(component.getByRole("row").filter({has: page.getByRole("cell")}), "Table does not show the server users").toHaveCount(users.length);
});

test("table asks the server for the first page of ten users", async ({mount, page}) => {
    await graphql(page, {GetFriends: respond(connection([]))});
    const request = page.waitForRequest((r) => operation(r) === "GetFriends");
    await mount("FriendsTable/Default");
    expect((await request).postDataJSON().variables, "Table does not ask for the first page").toEqual({page: 0, size: 10, searchQuery: ""});
});

test("table asks the server for the next page", async ({mount, page}) => {
    await graphql(page, {GetFriends: respond(connection([person()], true))});
    const component = await mount("FriendsTable/Default");
    const request = page.waitForRequest((r) => operation(r) === "GetFriends" && r.postDataJSON().variables.page === 1);
    await component.getByRole("button", {name: "Next"}).click();
    expect((await request).postDataJSON().variables.page, "Table does not ask for the next page").toBe(1);
});

test("table sends the search query to the server", async ({mount, page}) => {
    await graphql(page, {GetFriends: respond(connection([person()]))});
    const component = await mount("FriendsTable/Default");
    const query = word();
    const request = page.waitForRequest((r) => operation(r) === "GetFriends" && r.postDataJSON().variables.searchQuery === query);
    await component.getByRole("textbox", {name: "search people"}).fill(query);
    await component.getByRole("button", {name: "search"}).click();
    expect((await request).postDataJSON().variables.searchQuery, "Table does not send the search query").toBe(query);
});

test("table explains a server failure", async ({mount, page}) => {
    await graphql(page, {GetFriends: failure("database is down")});
    const component = await mount("FriendsTable/Default");
    await expect(component.getByRole("alert"), "Table does not explain the failure").toContainText("Can not load data");
});

test("retry after a failure shows the users", async ({mount, page}) => {
    const user = person();
    let calls = 0;
    await page.route("**/graphql", (route) => route.fulfill({
        headers: {"access-control-allow-origin": "*"},
        json: calls++ === 0 ? failure("flaky") : respond(connection([user])),
    }));
    const component = await mount("FriendsTable/Default");
    await component.getByRole("button", {name: "Retry"}).click();
    await expect(component.getByRole("cell", {name: user.username}), "Retry does not show the users").toBeVisible();
});
