import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Default} from "../../src/components/Sidebar/SidebarItem/SidebarItem.story";

test("item is selected when its link matches the route", async ({mount}) => {
    const link = `/${randomUUID().slice(0, 6)}`;
    const component = await mount<typeof Default>("SidebarItem/Default", {name: "Trips", link, route: link});
    await expect(component.getByRole("link", {name: "Trips"}), "Item is not selected on its own route").toHaveClass(/Mui-selected/);
});

test("item is not selected on another route", async ({mount}) => {
    const component = await mount<typeof Default>("SidebarItem/Default", {name: "Trips", link: "/trips", route: `/${randomUUID().slice(0, 6)}`});
    await expect(component.getByRole("link", {name: "Trips"}), "Item is selected on a foreign route").not.toHaveClass(/Mui-selected/);
});

test("item navigates to its link", async ({mount}) => {
    const link = `/${randomUUID().slice(0, 6)}`;
    const component = await mount<typeof Default>("SidebarItem/Default", {name: "Trips", link, route: "/"});
    await component.getByRole("link", {name: "Trips"}).click();
    await expect(component.getByTestId("pathname"), "Item does not navigate to its link").toHaveValue(link);
});

test("collapsed item reveals its name in a tooltip", async ({mount, page}) => {
    const name = `Section ${randomUUID().slice(0, 5)}`;
    const component = await mount<typeof Default>("SidebarItem/Default", {name, open: false});
    await component.getByRole("link").hover();
    await expect(page.getByRole("tooltip"), "Collapsed item does not reveal its name").toHaveText(name);
});
