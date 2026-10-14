import {expect, test} from "@playwright/test";

test("card starts expanded when no choice is remembered", async ({mount}) => {
    const component = await mount("CollapsibleMapCard/Expanded");
    await expect(component.getByRole("button", {name: "Collapse map"}), "Card does not start expanded").toHaveAttribute("aria-expanded", "true");
});

test("card starts collapsed when the collapse is remembered", async ({mount}) => {
    const component = await mount("CollapsibleMapCard/RememberedCollapsed");
    await expect(component.getByRole("button", {name: "Expand map"}), "Card does not restore the remembered collapse").toHaveAttribute("aria-expanded", "false");
});

test("toggle collapses an expanded card", async ({mount}) => {
    const component = await mount("CollapsibleMapCard/Expanded");
    await component.getByRole("button", {name: "Collapse map"}).click();
    await expect(component.getByRole("button", {name: "Expand map"}), "Toggle does not collapse the card").toHaveAttribute("aria-expanded", "false");
});

test("toggle expands a collapsed card", async ({mount}) => {
    const component = await mount("CollapsibleMapCard/RememberedCollapsed");
    await component.getByRole("button", {name: "Expand map"}).click();
    await expect(component.getByRole("button", {name: "Collapse map"}), "Toggle does not expand the card").toHaveAttribute("aria-expanded", "true");
});

test("toggle remembers the collapse for the next visit", async ({mount, page}) => {
    const component = await mount("CollapsibleMapCard/Expanded");
    await component.getByRole("button", {name: "Collapse map"}).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("rangiffler-map-collapsed")), {message: "Toggle does not remember the collapse"}).toBe("true");
});

test("collapsed card clips the map to a short strip", async ({mount}) => {
    const component = await mount("CollapsibleMapCard/RememberedCollapsed");
    await expect(component.getByText("Map of visited countries").locator("../.."), "Collapsed card does not clip the map").toHaveCSS("height", "180px");
});
