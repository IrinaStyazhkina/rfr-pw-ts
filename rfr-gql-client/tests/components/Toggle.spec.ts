import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/Toggle/Toggle.story";

test("toggle marks own travels as chosen by default", async ({mount}) => {
    const component = await mount<typeof Stateful>("Toggle/Stateful", {withFriends: false});
    await expect(component.getByRole("button", {name: "Only my travels"}), "Own travels are not chosen").toHaveAttribute("aria-pressed", "true");
});

test("toggle marks friends travels as chosen when asked", async ({mount}) => {
    const component = await mount<typeof Stateful>("Toggle/Stateful", {withFriends: true});
    await expect(component.getByRole("button", {name: "With friends"}), "Friends travels are not chosen").toHaveAttribute("aria-pressed", "true");
});

test("choosing friends travels reports it to the owner", async ({mount}) => {
    const component = await mount<typeof Stateful>("Toggle/Stateful", {withFriends: false});
    await component.getByRole("button", {name: "With friends"}).click();
    await expect(component.getByTestId("withMyFriends"), "Toggle does not report the friends choice").toHaveValue("true");
});

test("choosing own travels reports it to the owner", async ({mount}) => {
    const component = await mount<typeof Stateful>("Toggle/Stateful", {withFriends: true});
    await component.getByRole("button", {name: "Only my travels"}).click();
    await expect(component.getByTestId("withMyFriends"), "Toggle does not report the own choice").toHaveValue("false");
});

test("clicking the chosen option keeps the choice", async ({mount}) => {
    const component = await mount<typeof Stateful>("Toggle/Stateful", {withFriends: true});
    await component.getByRole("button", {name: "With friends"}).click();
    await expect(component.getByTestId("withMyFriends"), "Toggle drops the choice when clicked again").toHaveValue("true");
});
