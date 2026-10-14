import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {DrawerHeader} from "../../src/components/Drawer/DrawerHeader";
import {Scaffold} from "./Scaffold";

test("drawer header reserves the height of the app bar", async () => {
    await render(<Scaffold><DrawerHeader data-testid="drawer-header"/></Scaffold>);
    await expect.element(page.getByTestId("drawer-header"), {message: "Drawer header does not match the app bar height"}).toHaveStyle({minHeight: "64px"});
});

test("drawer header pushes its content to the end", async () => {
    await render(<Scaffold><DrawerHeader data-testid="drawer-header"/></Scaffold>);
    await expect.element(page.getByTestId("drawer-header"), {message: "Drawer header does not align content to the end"}).toHaveStyle({justifyContent: "flex-end"});
});
