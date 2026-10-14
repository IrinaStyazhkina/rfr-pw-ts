import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Toggle} from "../../src/components/Toggle";
import {Scaffold} from "./Scaffold";

test("toggle marks own travels as chosen", async () => {
    await render(<Scaffold><Toggle withMyFriends={false} setWithMyFriends={vi.fn()}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Only my travels"}), {message: "Own travels are not chosen"}).toHaveAttribute("aria-pressed", "true");
});

test("toggle marks friends travels as chosen", async () => {
    await render(<Scaffold><Toggle withMyFriends setWithMyFriends={vi.fn()}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "With friends"}), {message: "Friends travels are not chosen"}).toHaveAttribute("aria-pressed", "true");
});

test("choosing friends travels reports it to the owner", async () => {
    const setWithMyFriends = vi.fn();
    await render(<Scaffold><Toggle withMyFriends={false} setWithMyFriends={setWithMyFriends}/></Scaffold>);
    await page.getByRole("button", {name: "With friends"}).click();
    expect(setWithMyFriends, "Toggle does not report the friends choice").toHaveBeenCalledWith(true);
});

test("choosing own travels reports it to the owner", async () => {
    const setWithMyFriends = vi.fn();
    await render(<Scaffold><Toggle withMyFriends setWithMyFriends={setWithMyFriends}/></Scaffold>);
    await page.getByRole("button", {name: "Only my travels"}).click();
    expect(setWithMyFriends, "Toggle does not report the own choice").toHaveBeenCalledWith(false);
});

test("clicking the chosen option keeps the choice", async () => {
    const setWithMyFriends = vi.fn();
    await render(<Scaffold><Toggle withMyFriends setWithMyFriends={setWithMyFriends}/></Scaffold>);
    await page.getByRole("button", {name: "With friends"}).click();
    expect(setWithMyFriends, "Toggle drops the choice when clicked again").not.toHaveBeenCalled();
});
