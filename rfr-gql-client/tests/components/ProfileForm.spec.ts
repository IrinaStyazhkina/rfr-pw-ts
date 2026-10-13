import {expect, test} from "@playwright/test";
import type {Default} from "../../src/components/ProfileForm/ProfileForm.story";
import {graphql, operation} from "./graphql";
import {country, failure, person, word} from "./fixtures";

test("form starts with the first name of the user", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await expect(component.getByRole("textbox", {name: "First Name"}), "Form does not start with the first name").toHaveValue(user.firstname);
});

test("form starts with the surname of the user", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await expect(component.getByRole("textbox", {name: "Surname"}), "Form does not start with the surname").toHaveValue(user.surname);
});

test("form does not allow changing the username", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await expect(component.getByRole("textbox", {name: "Username"}), "Form allows changing the username").toBeDisabled();
});

test("form rejects a first name longer than fifty symbols", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await component.getByRole("textbox", {name: "First Name"}).fill("q".repeat(51 + Math.floor(Math.random() * 30)));
    await component.getByRole("button", {name: "Save"}).click();
    await expect(component.getByText("First name length has to be not longer that 50 symbols"), "Form accepts a too long first name").toBeVisible();
});

test("form rejects a surname longer than a hundred symbols", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await component.getByRole("textbox", {name: "Surname"}).fill("w".repeat(101 + Math.floor(Math.random() * 30)));
    await component.getByRole("button", {name: "Save"}).click();
    await expect(component.getByText("Surname length has to be not longer that 100 symbols"), "Form accepts a too long surname").toBeVisible();
});

test("saving sends the edited profile to the server", async ({mount, page}) => {
    const user = person();
    const firstname = `Ivo${word()}`;
    await graphql(page, {UpdateUser: {data: {user}}});
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    const request = page.waitForRequest((r) => operation(r) === "UpdateUser");
    await component.getByRole("textbox", {name: "First Name"}).fill(firstname);
    await component.getByRole("button", {name: "Save"}).click();
    expect((await request).postDataJSON().variables.input, "Form does not send the edited profile").toEqual({
        firstname,
        surname: user.surname,
        avatar: user.avatar,
        location: {code: user.location.code},
    });
});

test("saving sends the newly chosen location", async ({mount, page}) => {
    const user = person();
    const target = country();
    await graphql(page, {UpdateUser: {data: {user}}});
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location, target]});
    const request = page.waitForRequest((r) => operation(r) === "UpdateUser");
    await component.getByRole("combobox").click();
    await page.getByRole("option", {name: target.name}).click();
    await component.getByRole("button", {name: "Save"}).click();
    expect((await request).postDataJSON().variables.input.location, "Form does not send the chosen location").toEqual({code: target.code});
});

test("saving confirms the update", async ({mount, page}) => {
    const user = person();
    await graphql(page, {UpdateUser: {data: {user}}});
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await component.getByRole("button", {name: "Save"}).click();
    await expect(component.getByRole("alert"), "Form does not confirm the update").toHaveText("Your profile is successfully updated");
});

test("failed saving is explained", async ({mount, page}) => {
    const user = person();
    await graphql(page, {UpdateUser: failure("database is down")});
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await component.getByRole("button", {name: "Save"}).click();
    await expect(component.getByRole("alert"), "Form does not explain the failure").toHaveText("Can not update user");
});

test("reset brings back the saved first name", async ({mount}) => {
    const user = person();
    const component = await mount<typeof Default>("ProfileForm/Default", {user, countries: [user.location]});
    await component.getByRole("textbox", {name: "First Name"}).fill(word());
    await component.getByRole("button", {name: "Reset"}).click();
    await expect(component.getByRole("textbox", {name: "First Name"}), "Reset does not restore the first name").toHaveValue(user.firstname);
});
