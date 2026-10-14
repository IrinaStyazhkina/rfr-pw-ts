import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {List} from "@mui/material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import {SidebarItem} from "../../src/components/Sidebar/SidebarItem";
import {Pathname, Scaffold} from "./Scaffold";
import {word} from "./fixtures";

const item = (name: string, link: string, route: string, open = true) => (
    <Scaffold route={route}>
        <List>
            <SidebarItem name={name} link={link} icon={<PublicRoundedIcon/>} sidebarState={open}/>
        </List>
        <Pathname/>
    </Scaffold>
);

test("item is selected when its link matches the route", async () => {
    const link = `/${word()}`;
    await render(item("Trips", link, link));
    await expect.element(page.getByRole("link", {name: "Trips"}), {message: "Item is not selected on its own route"}).toHaveClass("Mui-selected");
});

test("item is not selected on another route", async () => {
    await render(item("Trips", "/trips", `/${word()}`));
    await expect.element(page.getByRole("link", {name: "Trips"}), {message: "Item is selected on a foreign route"}).not.toHaveClass("Mui-selected");
});

test("item navigates to its link", async () => {
    const link = `/${word()}`;
    await render(item("Trips", link, "/"));
    await page.getByRole("link", {name: "Trips"}).click();
    await expect.element(page.getByTestId("pathname"), {message: "Item does not navigate to its link"}).toHaveTextContent(link);
});

test("collapsed item reveals its name in a tooltip", async () => {
    const name = `Section ${word()}`;
    await render(item(name, "/trips", "/", false));
    await page.getByRole("link").hover();
    await expect.element(page.getByRole("tooltip"), {message: "Collapsed item does not reveal its name"}).toHaveTextContent(name);
});
