import {expect, test} from "@playwright/test";
import type {Default} from "../../src/components/Sidebar/Sidebar.story";

const LINKS = [["My map", "/my-travels"], ["People", "/people"], ["Profile", "/profile"]];
const any = () => LINKS[Math.floor(Math.random() * LINKS.length)];

test("sidebar lists every section of the app", async ({mount}) => {
    const component = await mount<typeof Default>("Sidebar/Default", {open: true});
    await expect(component.getByRole("link"), "Sidebar does not list every section").toHaveText(["My map", "People", "Profile"]);
});

test("sidebar highlights the section of the current route", async ({mount}) => {
    const [name, route] = any();
    const component = await mount<typeof Default>("Sidebar/Default", {open: true, route});
    await expect(component.getByRole("link", {name}), "Sidebar does not highlight the current section").toHaveClass(/Mui-selected/);
});

test("sidebar navigates to the clicked section", async ({mount}) => {
    const [name, route] = any();
    const component = await mount<typeof Default>("Sidebar/Default", {open: true, route: "/elsewhere"});
    await component.getByRole("link", {name}).click();
    await expect(component.getByTestId("pathname"), "Sidebar does not navigate to the clicked section").toHaveValue(route);
});

test("closed sidebar hides section names", async ({mount}) => {
    const component = await mount<typeof Default>("Sidebar/Default", {open: false});
    await expect(component.locator(".MuiListItemText-root", {hasText: "People"}), "Closed sidebar shows section names").toHaveCSS("opacity", "0");
});
