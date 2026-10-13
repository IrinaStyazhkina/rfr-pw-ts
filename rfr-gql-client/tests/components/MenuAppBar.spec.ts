import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Stateful} from "../../src/components/MenuAppBar/MenuAppBar.story";
import {person} from "./fixtures";

test("app bar shows the first letter of the username in the avatar", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user});
    await expect(component.getByRole("banner").getByRole("link", {name: "Profile"}), "Avatar does not show the username initial").toHaveText(user.username[0].toUpperCase());
});

test("menu button opens the sidebar", async ({mount}) => {
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("button", {name: "open drawer"}).click();
    await expect(component.getByTestId("opened"), "Menu button does not open the sidebar").toHaveValue("true");
});

test("menu button closes an opened sidebar", async ({mount}) => {
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("button", {name: "open drawer"}).click();
    await component.getByRole("button", {name: "open drawer"}).click();
    await expect(component.getByTestId("opened"), "Menu button does not close the sidebar").toHaveValue("false");
});

test("logo leads to the travels map", async ({mount}) => {
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("heading", {name: "Rangiffler"}).click();
    await expect(component.getByTestId("pathname"), "Logo does not lead to the travels map").toHaveValue("/my-travels");
});

test("avatar leads to the profile", async ({mount}) => {
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("banner").getByRole("link", {name: "Profile"}).click();
    await expect(component.getByTestId("pathname"), "Avatar does not lead to the profile").toHaveValue("/profile");
});

test("dark mode button switches the page to dark colors", async ({mount, page}) => {
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("button", {name: "Toggle dark mode"}).click();
    await expect(page.locator("html"), "Dark mode button does not switch to dark colors").toHaveClass(/dark/);
});

test("logout without tokens returns to the landing page", async ({mount, page}) => {
    await page.route((url) => url.pathname === "/", (route) => route.fulfill({contentType: "text/html", body: "<p>Landing</p>"}));
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person()});
    await component.getByRole("button", {name: "Logout"}).click();
    await expect(page, "Logout does not return to the landing page").toHaveURL("/");
});

test("logout revokes the access token", async ({mount, page}) => {
    const accessToken = randomUUID();
    await page.route("http://localhost:9001/**", (route) => route.fulfill({headers: {"access-control-allow-origin": "*"}, body: ""}));
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person(), accessToken, idToken: randomUUID()});
    const request = page.waitForRequest(/oauth2\/revoke/);
    await component.getByRole("button", {name: "Logout"}).click();
    await page.waitForURL(/connect\/logout/);
    expect(new URLSearchParams((await request).postData() ?? "").get("token"), "Logout does not revoke the access token").toBe(accessToken);
});

test("logout with an id token ends the session on the auth server", async ({mount, page}) => {
    const idToken = randomUUID();
    await page.route("http://localhost:9001/**", (route) => route.fulfill({headers: {"access-control-allow-origin": "*"}, body: ""}));
    const component = await mount<typeof Stateful>("MenuAppBar/Stateful", {user: person(), idToken});
    await component.getByRole("button", {name: "Logout"}).click();
    await expect(page, "Logout does not end the session on the auth server").toHaveURL(new RegExp(`/connect/logout\\?id_token_hint=${idToken}`));
});
