import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Table} from "@mui/material";
import {TableHead} from "../../src/components/Table/TableHead";
import {HeadCell} from "../../src/components/Table/HeadCell";
import {Scaffold} from "./Scaffold";
import {between, word} from "./fixtures";

const head = (headCells: HeadCell[]) => <Scaffold><Table><TableHead headCells={headCells}/></Table></Scaffold>;

test("table head shows a column for every cell", async () => {
    const labels = Array.from({length: between(2, 5)}, () => word());
    await render(head(labels.map((label) => ({id: label, label, numeric: false}))));
    await expect.poll(() => page.getByRole("columnheader").elements().map((cell) => cell.textContent), {message: "Table head does not show every column"}).toEqual(labels);
});

test("table head aligns numeric columns to the right", async () => {
    await render(head([{id: "likes", label: "Likes", numeric: true}]));
    await expect.element(page.getByRole("columnheader", {name: "Likes"}), {message: "Numeric column is not right aligned"}).toHaveStyle({textAlign: "right"});
});

test("table head aligns text columns to the left", async () => {
    await render(head([{id: "name", label: "Name", numeric: false}]));
    await expect.element(page.getByRole("columnheader", {name: "Name"}), {message: "Text column is not left aligned"}).toHaveStyle({textAlign: "left"});
});
