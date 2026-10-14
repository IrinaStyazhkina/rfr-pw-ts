import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/PeopleTable/PeopleTable.story";
import {person, word} from "./fixtures";

test("table shows a row for every user", async ({mount}) => {
    const users = Array.from({length: 1 + Math.floor(Math.random() * 5)}, () => person());
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users});
    await expect(component.getByRole("row"), "Table does not show a row for every user").toHaveCount(users.length + 1);
});

test("table shows the username of a user", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [user]});
    await expect(component.getByRole("cell", {name: user.username}), "Table does not show the username").toBeVisible();
});

test("table shows the location of a user", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [user]});
    await expect(component.getByRole("cell", {name: user.location.name}), "Table does not show the location").toBeVisible();
});

test("table marks a missing first name with dashes", async ({mount}) => {
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [{...person(), firstname: undefined}]});
    await expect(component.getByRole("cell", {name: "---"}), "Table does not mark a missing first name").toHaveCount(1);
});

test("empty table explains that there are no users", async ({mount}) => {
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: []});
    await expect(component.getByText("There are no users yet"), "Empty table does not explain itself").toBeVisible();
});

test("table offers the action that matches the friend status", async ({mount}) => {
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [person("INVITATION_RECEIVED")]});
    await expect(component.getByRole("button", {name: "Accept"}), "Table does not offer to accept an invitation").toBeVisible();
});

test("next button moves to the following page", async ({mount}) => {
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [person()], hasNextPage: true});
    await component.getByRole("button", {name: "Next"}).click();
    await expect(component.getByTestId("page"), "Next button does not move forward").toHaveValue("1");
});

test("search hands the query to the owner", async ({mount}) => {
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [person()]});
    const query = word();
    await component.getByRole("textbox", {name: "search people"}).fill(query);
    await component.getByRole("button", {name: "search"}).click();
    await expect(component.getByTestId("search"), "Search does not reach the owner").toHaveValue(query);
});

test("narrow screen lists users without a table", async ({mount, page}) => {
    await page.setViewportSize({width: 600 + Math.floor(Math.random() * 200), height: 900});
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [person()]});
    await expect(component.getByRole("table"), "Narrow screen still renders a table").toHaveCount(0);
});

test("narrow screen joins first name and surname", async ({mount, page}) => {
    await page.setViewportSize({width: 700, height: 900});
    const user = person();
    const component = await mount<typeof Stateful>("PeopleTable/Stateful", {users: [user]});
    await expect(component.getByText(`${user.firstname} ${user.surname}`), "Narrow screen does not join the full name").toBeVisible();
});
