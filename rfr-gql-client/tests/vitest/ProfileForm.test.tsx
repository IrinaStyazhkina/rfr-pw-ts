import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {MockLink} from "@apollo/client/testing";
import {ProfileForm} from "../../src/components/ProfileForm";
import {User} from "../../src/types/User";
import {Country} from "../../src/types/Country";
import {UPDATE_USER} from "../../src/hooks/useUpdateUser";
import {Scaffold} from "./Scaffold";
import {answer, failure, recording} from "./apollo";
import {between, country, person, word} from "./fixtures";

const form = (user: User, mocks: MockLink.MockedResponse[] = [], countries: Country[] = [user.location]) => (
    <Scaffold user={user} countries={countries} mocks={mocks}>
        <ProfileForm/>
    </Scaffold>
);

test("form starts with the first name of the user", async () => {
    const user = person();
    await render(form(user));
    await expect.element(page.getByRole("textbox", {name: "First Name"}), {message: "Form does not start with the first name"}).toHaveValue(user.firstname);
});

test("form starts with the surname of the user", async () => {
    const user = person();
    await render(form(user));
    await expect.element(page.getByRole("textbox", {name: "Surname"}), {message: "Form does not start with the surname"}).toHaveValue(user.surname);
});

test("form does not allow changing the username", async () => {
    await render(form(person()));
    await expect.element(page.getByRole("textbox", {name: "Username"}), {message: "Form allows changing the username"}).toBeDisabled();
});

test("form rejects a first name longer than fifty symbols", async () => {
    await render(form(person()));
    await page.getByRole("textbox", {name: "First Name"}).fill("q".repeat(between(51, 80)));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByText("First name length has to be not longer that 50 symbols"), {message: "Form accepts a too long first name"}).toBeVisible();
});

test("form rejects a surname longer than a hundred symbols", async () => {
    await render(form(person()));
    await page.getByRole("textbox", {name: "Surname"}).fill("w".repeat(between(101, 130)));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByText("Surname length has to be not longer that 100 symbols"), {message: "Form accepts a too long surname"}).toBeVisible();
});

test("saving sends the edited profile to the server", async () => {
    const user = person();
    const firstname = `Ivo${word()}`;
    const sent: Record<string, unknown>[] = [];
    await render(form(user, [recording(UPDATE_USER, {data: {user}}, sent)]));
    await page.getByRole("textbox", {name: "First Name"}).fill(firstname);
    await page.getByRole("button", {name: "Save"}).click();
    await expect.poll(() => sent[0], {message: "Form does not send the edited profile"}).toEqual({
        input: {firstname, surname: user.surname, avatar: user.avatar, location: {code: user.location.code}},
    });
});

test("saving sends the newly chosen location", async () => {
    const user = person();
    const target = country();
    const sent: Record<string, unknown>[] = [];
    await render(form(user, [recording(UPDATE_USER, {data: {user}}, sent)], [user.location, target]));
    await page.getByRole("combobox").click();
    await page.getByRole("option", {name: target.name, exact: false}).click();
    await page.getByRole("button", {name: "Save"}).click();
    await expect.poll(() => (sent[0]?.input as {location?: unknown})?.location, {message: "Form does not send the chosen location"}).toEqual({code: target.code});
});

test("saving confirms the update", async () => {
    const user = person();
    await render(form(user, [answer(UPDATE_USER, {data: {user}})]));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByRole("alert"), {message: "Form does not confirm the update"}).toHaveTextContent("Your profile is successfully updated");
});

test("failed saving is explained", async () => {
    await render(form(person(), [answer(UPDATE_USER, failure("database is down"))]));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByRole("alert"), {message: "Form does not explain the failure"}).toHaveTextContent("Can not update user");
});

test("reset brings back the saved first name", async () => {
    const user = person();
    await render(form(user));
    await page.getByRole("textbox", {name: "First Name"}).fill(word());
    await page.getByRole("button", {name: "Reset"}).click();
    await expect.element(page.getByRole("textbox", {name: "First Name"}), {message: "Reset does not restore the first name"}).toHaveValue(user.firstname);
});
