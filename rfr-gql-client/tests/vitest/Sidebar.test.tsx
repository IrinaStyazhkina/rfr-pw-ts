import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Sidebar} from "../../src/components/Sidebar";
import {Pathname, Scaffold} from "./Scaffold";

const LINKS = [["My map", "/my-travels"], ["People", "/people"], ["Profile", "/profile"]];
const any = () => LINKS[Math.floor(Math.random() * LINKS.length)];

test("sidebar lists every section of the app", async () => {
    await render(<Scaffold><Sidebar sidebarState/></Scaffold>);
    await expect.poll(() => page.getByRole("link").elements().map((link) => link.textContent), {message: "Sidebar does not list every section"}).toEqual(["My map", "People", "Profile"]);
});

test("sidebar highlights the section of the current route", async () => {
    const [name, route] = any();
    await render(<Scaffold route={route}><Sidebar sidebarState/></Scaffold>);
    await expect.element(page.getByRole("link", {name}), {message: "Sidebar does not highlight the current section"}).toHaveClass("Mui-selected");
});

test("sidebar navigates to the clicked section", async () => {
    const [name, route] = any();
    await render(<Scaffold route="/elsewhere"><Sidebar sidebarState/><Pathname/></Scaffold>);
    await page.getByRole("link", {name}).click();
    await expect.element(page.getByTestId("pathname"), {message: "Sidebar does not navigate to the clicked section"}).toHaveTextContent(route);
});

test("closed sidebar hides section names", async () => {
    await render(<Scaffold><Sidebar sidebarState={false}/></Scaffold>);
    await expect.element(page.getByCss(".MuiListItemText-root").filter({hasText: "People"}), {message: "Closed sidebar shows section names"}).toHaveStyle({opacity: "0"});
});
