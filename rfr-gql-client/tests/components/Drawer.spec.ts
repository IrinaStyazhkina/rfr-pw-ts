import {expect, test} from "@playwright/test";

test("opened drawer takes the full sidebar width", async ({mount}) => {
    const component = await mount("Drawer/Opened");
    await expect(component.locator(".MuiDrawer-paper"), "Opened drawer is not 240 pixels wide").toHaveCSS("width", "240px");
});

test("closed drawer shrinks to an icon rail", async ({mount}) => {
    const component = await mount("Drawer/Closed");
    await expect(component.locator(".MuiDrawer-paper"), "Closed drawer does not shrink to the icon rail").toHaveCSS("width", "65px");
});
