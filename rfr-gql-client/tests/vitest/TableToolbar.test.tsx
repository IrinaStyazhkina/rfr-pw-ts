import {expect, test, vi} from "vitest";
import {page, userEvent} from "vitest/browser";
import {render} from "vitest-browser-react";
import {TableToolbar} from "../../src/components/Table/TableToolbar";
import {Scaffold} from "./Scaffold";
import {word} from "./fixtures";

test("search button hands the typed query to the owner", async () => {
    const setSearch = vi.fn();
    await render(<Scaffold><TableToolbar setSearch={setSearch} onSearchSubmit={vi.fn()}/></Scaffold>);
    const query = `ana ${word()}`;
    await page.getByRole("textbox", {name: "search people"}).fill(query);
    await page.getByRole("button", {name: "search"}).click();
    expect(setSearch, "Search button does not hand over the query").toHaveBeenCalledWith(query);
});

test("pressing enter submits the search", async () => {
    const onSearchSubmit = vi.fn();
    await render(<Scaffold><TableToolbar setSearch={vi.fn()} onSearchSubmit={onSearchSubmit}/></Scaffold>);
    await page.getByRole("textbox", {name: "search people"}).fill(word());
    await userEvent.keyboard("{Enter}");
    expect(onSearchSubmit, "Enter does not submit the search").toHaveBeenCalledTimes(1);
});

test("typing alone does not search", async () => {
    const setSearch = vi.fn();
    await render(<Scaffold><TableToolbar setSearch={setSearch} onSearchSubmit={vi.fn()}/></Scaffold>);
    await page.getByRole("textbox", {name: "search people"}).fill(word());
    expect(setSearch, "Typing searches before submit").not.toHaveBeenCalled();
});
