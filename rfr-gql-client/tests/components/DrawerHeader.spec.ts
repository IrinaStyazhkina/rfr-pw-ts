import {expect, test} from "@playwright/test";

test("drawer header reserves the height of the app bar", async ({mount}) => {
    const component = await mount("DrawerHeader/Default");
    await expect(component.getByTestId("drawer-header"), "Drawer header does not match the app bar height").toHaveCSS("min-height", "64px");
});

test("drawer header pushes its content to the end", async ({mount}) => {
    const component = await mount("DrawerHeader/Default");
    await expect(component.getByTestId("drawer-header"), "Drawer header does not align content to the end").toHaveCSS("justify-content", "flex-end");
});
