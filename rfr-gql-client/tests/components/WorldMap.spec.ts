import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/WorldMap/WorldMap.story";

const LANDS = [["fr", "France"], ["br", "Brazil"], ["jp", "Japan"], ["ca", "Canada"], ["au", "Australia"]];
const any = () => LANDS[Math.floor(Math.random() * LANDS.length)];

test("map draws the countries of the world", async ({mount}) => {
    const component = await mount<typeof Stateful>("WorldMap/Stateful", {stat: []});
    await expect(component.locator("svg path").first(), "Map does not draw the countries").toBeVisible();
});

test("choosing a visited country reports its code", async ({mount}) => {
    const [code, name] = any();
    const component = await mount<typeof Stateful>("WorldMap/Stateful", {stat: [{count: 4, country: {code}}]});
    await component.getByRole("button", {name, exact: true}).press("Enter");
    await expect(component.getByTestId("clicked"), "Clicking a visited country does not report it").toHaveValue(code);
});

test("choosing an unvisited country reports nothing", async ({mount}) => {
    const component = await mount<typeof Stateful>("WorldMap/Stateful", {stat: [{count: 4, country: {code: "fr"}}]});
    await component.getByRole("button", {name: "Japan", exact: true}).press("Enter");
    await expect(component.getByTestId("clicked"), "Clicking an unvisited country reports it").toHaveValue("");
});

test("map highlights the selected country", async ({mount}) => {
    const [code, name] = any();
    const component = await mount<typeof Stateful>("WorldMap/Stateful", {stat: [{count: 2, country: {code}}], selected: code});
    await expect(component.getByRole("button", {name, exact: true}), "Map does not highlight the selected country").toHaveAttribute("style", /warning-main/);
});

test("map dims other visited countries while one is selected", async ({mount}) => {
    const component = await mount<typeof Stateful>("WorldMap/Stateful", {stat: [{count: 2, country: {code: "fr"}}, {count: 2, country: {code: "jp"}}], selected: "fr"});
    await expect(component.getByRole("button", {name: "Japan", exact: true}), "Map does not dim other visited countries").toHaveAttribute("style", /fill-opacity: 0\.35/);
});
