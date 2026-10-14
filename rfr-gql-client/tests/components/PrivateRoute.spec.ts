import {expect, test} from "@playwright/test";
import {graphql} from "./graphql";
import {country, failure, person} from "./fixtures";

test("route shows a loader until the user arrives", async ({mount, page}) => {
    await page.route("**/graphql", () => undefined);
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByRole("progressbar"), "Route does not show a loader").toBeVisible();
});

test("route shows private content to a signed in user", async ({mount, page}) => {
    await graphql(page, {GetUser: {data: {user: person()}}, GetCountries: {data: {countries: [country()]}}});
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByText("Private content"), "Route hides private content from a signed in user").toBeVisible();
});

test("route wraps private content with the app bar", async ({mount, page}) => {
    await graphql(page, {GetUser: {data: {user: person()}}, GetCountries: {data: {countries: []}}});
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByRole("button", {name: "Logout"}), "Route does not show the app bar").toBeVisible();
});

test("route hands the signed in user to the app bar", async ({mount, page}) => {
    const user = person();
    await graphql(page, {GetUser: {data: {user}}, GetCountries: {data: {countries: []}}});
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByRole("banner").getByRole("link", {name: "Profile"}), "Route does not hand the user to the app bar").toHaveText(user.username[0].toUpperCase());
});

test("route sends an unauthorized visitor to the landing page", async ({mount, page}) => {
    await graphql(page, {GetUser: failure("Unauthorized", "UNAUTHORIZED"), GetCountries: {data: {countries: []}}});
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByText("Public landing"), "Route does not send an unauthorized visitor away").toBeVisible();
});

test("route explains a failure to load the profile", async ({mount, page}) => {
    await graphql(page, {GetUser: failure("database is down"), GetCountries: {data: {countries: []}}});
    const component = await mount("PrivateRoute/Guarding");
    await expect(component.getByRole("alert"), "Route does not explain the profile failure").toContainText("Can not load your profile");
});

test("route keeps private content hidden when the profile fails", async ({mount, page}) => {
    await graphql(page, {GetUser: failure("database is down"), GetCountries: {data: {countries: []}}});
    const component = await mount("PrivateRoute/Guarding");
    await component.getByRole("alert").waitFor();
    await expect(component.getByText("Private content"), "Route shows private content without a profile").toHaveCount(0);
});
