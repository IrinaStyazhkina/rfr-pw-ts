import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {MenuAppBar} from "../../src/components/MenuAppBar";
import {User} from "../../src/types/User";
import {Pathname, Scaffold} from "./Scaffold";
import {person} from "./fixtures";

const bar = (user: User, handleChangeState = vi.fn(), sidebarState = false) => {
    // The color mode survives between tests in the same browser, so each scenario starts from the light default.
    localStorage.removeItem("mui-mode");
    return (
        <Scaffold user={user} route="/people">
            <MenuAppBar sidebarState={sidebarState} handleChangeState={handleChangeState}/>
            <Pathname/>
        </Scaffold>
    );
};

test("app bar shows the first letter of the username in the avatar", async () => {
    const user = person();
    await render(bar(user));
    await expect.element(page.getByRole("banner").getByRole("link", {name: "Profile"}), {message: "Avatar does not show the username initial"}).toHaveTextContent(user.username[0].toUpperCase());
});

test("menu button opens a closed sidebar", async () => {
    const handleChangeState = vi.fn();
    await render(bar(person(), handleChangeState, false));
    await page.getByRole("button", {name: "open drawer"}).click();
    expect(handleChangeState, "Menu button does not open the sidebar").toHaveBeenCalledWith(true);
});

test("menu button closes an opened sidebar", async () => {
    const handleChangeState = vi.fn();
    await render(bar(person(), handleChangeState, true));
    await page.getByRole("button", {name: "open drawer"}).click();
    expect(handleChangeState, "Menu button does not close the sidebar").toHaveBeenCalledWith(false);
});

test("logo leads to the travels map", async () => {
    await render(bar(person()));
    await page.getByRole("heading", {name: "Rangiffler"}).click();
    await expect.element(page.getByTestId("pathname"), {message: "Logo does not lead to the travels map"}).toHaveTextContent("/my-travels");
});

test("avatar leads to the profile", async () => {
    await render(bar(person()));
    await page.getByRole("banner").getByRole("link", {name: "Profile"}).click();
    await expect.element(page.getByTestId("pathname"), {message: "Avatar does not lead to the profile"}).toHaveTextContent("/profile");
});

test("dark mode button switches the page to dark colors", async () => {
    await render(bar(person()));
    await page.getByRole("button", {name: "Toggle dark mode"}).click();
    await expect.poll(() => document.documentElement.className, {message: "Dark mode button does not switch to dark colors"}).toContain("dark");
});

// @todo #1:30min MenuAppBar logs out through window.location.replace, which navigates away the iframe
//  Vitest runs the test in, so the logout scenarios (token revocation, return to the landing page,
//  logout on the auth server) cannot run here. Let the component receive the navigation as a dependency
//  and cover these scenarios; the Playwright suite in tests/components covers them meanwhile.
test.todo("logout revokes the access token and ends the session");
