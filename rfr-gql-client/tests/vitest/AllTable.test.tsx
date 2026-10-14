import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {AllTable} from "../../src/components/PeopleTable/AllTable";
import {GET_PEOPLE} from "../../src/hooks/useQueryPeople";
import {Scaffold} from "./Scaffold";
import {answer, failure, recording} from "./apollo";
import {between, connection, person, word} from "./fixtures";

const respond = (users: object) => ({data: {users}});

test("table shows the users returned by the server", async () => {
    const users = Array.from({length: between(1, 4)}, () => person());
    await render(<Scaffold mocks={[answer(GET_PEOPLE, respond(connection(users)))]}><AllTable/></Scaffold>);
    await expect.poll(() => page.getByRole("cell", {name: /^user-/}).elements().length, {message: "Table does not show the server users"}).toBe(users.length);
});

test("table asks the server for the first page of ten users", async () => {
    const sent: Record<string, unknown>[] = [];
    await render(<Scaffold mocks={[recording(GET_PEOPLE, respond(connection([])), sent)]}><AllTable/></Scaffold>);
    await expect.poll(() => sent[0], {message: "Table does not ask for the first page"}).toEqual({page: 0, size: 10, searchQuery: ""});
});

test("table asks the server for the next page", async () => {
    const sent: Record<string, unknown>[] = [];
    await render(<Scaffold mocks={[recording(GET_PEOPLE, respond(connection([person()], true)), sent)]}><AllTable/></Scaffold>);
    await page.getByRole("button", {name: "Next"}).click();
    await expect.poll(() => sent.map((variables) => variables.page), {message: "Table does not ask for the next page"}).toContain(1);
});

test("table sends the search query to the server", async () => {
    const sent: Record<string, unknown>[] = [];
    await render(<Scaffold mocks={[recording(GET_PEOPLE, respond(connection([person()])), sent)]}><AllTable/></Scaffold>);
    const query = word();
    await page.getByRole("textbox", {name: "search people"}).fill(query);
    await page.getByRole("button", {name: "search"}).click();
    await expect.poll(() => sent.map((variables) => variables.searchQuery), {message: "Table does not send the search query"}).toContain(query);
});

test("table explains a server failure", async () => {
    await render(<Scaffold mocks={[answer(GET_PEOPLE, failure("database is down"))]}><AllTable/></Scaffold>);
    await expect.element(page.getByRole("alert").getByText("Can not load data"), {message: "Table does not explain the failure"}).toBeVisible();
});

test("retry after a failure shows the users", async () => {
    const user = person();
    let calls = 0;
    await render(<Scaffold mocks={[answer(GET_PEOPLE, () => calls++ === 0 ? failure("flaky") : respond(connection([user])))]}><AllTable/></Scaffold>);
    await page.getByRole("button", {name: "Retry"}).click();
    await expect.element(page.getByRole("cell", {name: user.username}), {message: "Retry does not show the users"}).toBeVisible();
});
