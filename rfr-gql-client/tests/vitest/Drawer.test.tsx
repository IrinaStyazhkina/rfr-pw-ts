import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Drawer} from "../../src/components/Drawer";
import {Scaffold} from "./Scaffold";

test("opened drawer takes the full sidebar width", async () => {
    await render(<Scaffold><Drawer variant="permanent" open>Navigation</Drawer></Scaffold>);
    await expect.element(page.getByCss(".MuiDrawer-paper"), {message: "Opened drawer is not 240 pixels wide"}).toHaveStyle({width: "240px"});
});

test("closed drawer shrinks to an icon rail", async () => {
    await render(<Scaffold><Drawer variant="permanent" open={false}>Navigation</Drawer></Scaffold>);
    await expect.element(page.getByCss(".MuiDrawer-paper"), {message: "Closed drawer does not shrink to the icon rail"}).toHaveStyle({width: "65px"});
});
