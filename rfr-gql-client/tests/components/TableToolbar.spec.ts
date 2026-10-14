import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";

test("search button hands the typed query to the owner", async ({mount}) => {
    const component = await mount("TableToolbar/Searchable");
    const query = `ana ${randomUUID().slice(0, 5)}`;
    await component.getByRole("textbox", {name: "search people"}).fill(query);
    await component.getByRole("button", {name: "search"}).click();
    await expect(component.getByTestId("search"), "Search button does not hand over the query").toHaveValue(query);
});

test("pressing enter submits the search", async ({mount}) => {
    const component = await mount("TableToolbar/Searchable");
    await component.getByRole("textbox", {name: "search people"}).fill(randomUUID().slice(0, 4));
    await component.getByRole("textbox", {name: "search people"}).press("Enter");
    await expect(component.getByTestId("submits"), "Enter does not submit the search").toHaveValue("1");
});

test("typing alone does not search", async ({mount}) => {
    const component = await mount("TableToolbar/Searchable");
    await component.getByRole("textbox", {name: "search people"}).fill(randomUUID().slice(0, 4));
    await expect(component.getByTestId("search"), "Typing searches before submit").toHaveValue("");
});
