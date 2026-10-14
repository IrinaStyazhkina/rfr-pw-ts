import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {TablePagination} from "../../src/components/Table/Pagination";
import {Scaffold} from "./Scaffold";
import {between} from "./fixtures";

test("pagination renders nothing when there is a single page", async () => {
    await render(<Scaffold><TablePagination hasNextValues={false} hasPreviousValues={false} onPreviousClick={vi.fn()} onNextClick={vi.fn()}/></Scaffold>);
    await expect.element(page.getByRole("button").first(), {message: "Pagination renders for a single page"}).not.toBeInTheDocument();
});

test("previous button is disabled on the first page", async () => {
    await render(<Scaffold><TablePagination hasNextValues hasPreviousValues={false} onPreviousClick={vi.fn()} onNextClick={vi.fn()}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Previous"}), {message: "Previous button is enabled on the first page"}).toBeDisabled();
});

test("next button is disabled on the last page", async () => {
    await render(<Scaffold><TablePagination hasNextValues={false} hasPreviousValues onPreviousClick={vi.fn()} onNextClick={vi.fn()}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Next"}), {message: "Next button is enabled on the last page"}).toBeDisabled();
});

test("pagination reports moves in the order they were made", async () => {
    const moves: string[] = [];
    await render(
        <Scaffold>
            <TablePagination hasNextValues hasPreviousValues onPreviousClick={() => moves.push("previous")} onNextClick={() => moves.push("next")}/>
        </Scaffold>
    );
    const expected = Array.from({length: between(2, 5)}, () => Math.random() < 0.5 ? "next" : "previous");
    for (const move of expected) {
        await page.getByRole("button", {name: move === "next" ? "Next" : "Previous"}).click();
    }
    expect(moves, "Pagination did not report the moves in order").toEqual(expected);
});
