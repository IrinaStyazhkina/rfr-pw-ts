import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {PeopleTable} from "../../src/components/PeopleTable";
import {User} from "../../src/types/User";
import {Scaffold} from "./Scaffold";
import {between, person, word} from "./fixtures";

interface TableInterface {
    users: User[];
    hasNextPage?: boolean;
    setPage?: (page: number) => void;
    setSearch?: (value: string) => void;
}

const table = ({users, hasNextPage = false, setPage = vi.fn(), setSearch = vi.fn()}: TableInterface) => (
    <Scaffold>
        <PeopleTable
            data={users}
            page={between(0, 3)}
            hasNextPage={hasNextPage}
            hasPreviousPage={false}
            setPage={setPage}
            setSearch={setSearch}
            onSearchSubmit={vi.fn()}
        />
    </Scaffold>
);

test("table shows a row for every user", async () => {
    const users = Array.from({length: between(1, 5)}, () => person());
    await render(table({users}));
    await expect.poll(() => page.getByRole("row").elements().length, {message: "Table does not show a row for every user"}).toBe(users.length + 1);
});

test("table shows the username of a user", async () => {
    const user = person();
    await render(table({users: [user]}));
    await expect.element(page.getByRole("cell", {name: user.username}), {message: "Table does not show the username"}).toBeVisible();
});

test("table shows the location of a user", async () => {
    const user = person();
    await render(table({users: [user]}));
    await expect.element(page.getByRole("cell", {name: user.location.name}), {message: "Table does not show the location"}).toBeVisible();
});

test("table marks a missing first name with dashes", async () => {
    await render(table({users: [{...person(), firstname: undefined}]}));
    await expect.element(page.getByRole("cell", {name: "---"}), {message: "Table does not mark a missing first name"}).toBeVisible();
});

test("empty table explains that there are no users", async () => {
    await render(table({users: []}));
    await expect.element(page.getByText("There are no users yet"), {message: "Empty table does not explain itself"}).toBeVisible();
});

test("table offers the action that matches the friend status", async () => {
    await render(table({users: [person("INVITATION_RECEIVED")]}));
    await expect.element(page.getByRole("button", {name: "Accept"}), {message: "Table does not offer to accept an invitation"}).toBeVisible();
});

test("next button moves to the following page", async () => {
    const setPage = vi.fn();
    const current = between(0, 3);
    await render(
        <Scaffold>
            <PeopleTable data={[person()]} page={current} hasNextPage hasPreviousPage={false} setPage={setPage} setSearch={vi.fn()} onSearchSubmit={vi.fn()}/>
        </Scaffold>
    );
    await page.getByRole("button", {name: "Next"}).click();
    expect(setPage, "Next button does not move forward").toHaveBeenCalledWith(current + 1);
});

test("search hands the query to the owner", async () => {
    const setSearch = vi.fn();
    await render(table({users: [person()], setSearch}));
    const query = word();
    await page.getByRole("textbox", {name: "search people"}).fill(query);
    await page.getByRole("button", {name: "search"}).click();
    expect(setSearch, "Search does not reach the owner").toHaveBeenCalledWith(query);
});

test("narrow screen lists users without a table", async () => {
    await page.viewport(between(600, 800), 900);
    await render(table({users: [person()]}));
    await expect.element(page.getByRole("table"), {message: "Narrow screen still renders a table"}).not.toBeInTheDocument();
});

test("narrow screen joins first name and surname", async () => {
    await page.viewport(700, 900);
    const user = person();
    await render(table({users: [user]}));
    await expect.element(page.getByText(`${user.firstname} ${user.surname}`), {message: "Narrow screen does not join the full name"}).toBeVisible();
});
