import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Default} from "../../src/components/Table/TableHead/TableHead.story";

test("table head shows a column for every cell", async ({mount}) => {
    const labels = Array.from({length: 2 + Math.floor(Math.random() * 4)}, () => randomUUID().slice(0, 6));
    const component = await mount<typeof Default>("TableHead/Default", {headCells: labels.map((label) => ({id: label, label, numeric: false}))});
    await expect(component.getByRole("columnheader"), "Table head does not show every column").toHaveText(labels);
});

test("table head aligns numeric columns to the right", async ({mount}) => {
    const component = await mount<typeof Default>("TableHead/Default", {headCells: [{id: "likes", label: "Likes", numeric: true}]});
    await expect(component.getByRole("columnheader", {name: "Likes"}), "Numeric column is not right aligned").toHaveCSS("text-align", "right");
});

test("table head aligns text columns to the left", async ({mount}) => {
    const component = await mount<typeof Default>("TableHead/Default", {headCells: [{id: "name", label: "Name", numeric: false}]});
    await expect(component.getByRole("columnheader", {name: "Name"}), "Text column is not left aligned").toHaveCSS("text-align", "left");
});
