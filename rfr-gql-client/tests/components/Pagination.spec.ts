import {expect, test} from "@playwright/test";
import type {Default} from "../../src/components/Table/Pagination/Pagination.story";

test("pagination renders nothing when there is a single page", async ({mount}) => {
    const component = await mount<typeof Default>("Pagination/Default", {hasNext: false, hasPrevious: false});
    await expect(component.getByRole("button"), "Pagination renders for a single page").toHaveCount(0);
});

test("previous button is disabled on the first page", async ({mount}) => {
    const component = await mount<typeof Default>("Pagination/Default", {hasNext: true, hasPrevious: false});
    await expect(component.getByRole("button", {name: "Previous"}), "Previous button is enabled on the first page").toBeDisabled();
});

test("next button is disabled on the last page", async ({mount}) => {
    const component = await mount<typeof Default>("Pagination/Default", {hasNext: false, hasPrevious: true});
    await expect(component.getByRole("button", {name: "Next"}), "Next button is enabled on the last page").toBeDisabled();
});

test("pagination reports moves in the order they were made", async ({mount}) => {
    const component = await mount<typeof Default>("Pagination/Default", {hasNext: true, hasPrevious: true});
    const moves = Array.from({length: 2 + Math.floor(Math.random() * 4)}, () => Math.random() < 0.5 ? "next" : "previous");
    for (const move of moves) {
        await component.getByRole("button", {name: move === "next" ? "Next" : "Previous"}).click();
    }
    await expect(component.getByTestId("moves"), "Pagination did not report the moves in order").toHaveValue(JSON.stringify(moves));
});
