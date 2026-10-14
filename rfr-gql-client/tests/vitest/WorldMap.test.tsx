import {expect, test, vi} from "vitest";
import {page, userEvent} from "vitest/browser";
import {render} from "vitest-browser-react";
import {WorldMap} from "../../src/components/WorldMap";
import {Stat} from "../../src/types/Stat";
import {Scaffold} from "./Scaffold";
import {between} from "./fixtures";

const LANDS = [["fr", "France"], ["br", "Brazil"], ["jp", "Japan"], ["ca", "Canada"], ["au", "Australia"]];
const any = () => LANDS[between(0, LANDS.length - 1)];

const map = (stat: Stat[], onCountryClick = vi.fn(), selected?: string) => (
    <Scaffold>
        <WorldMap data={stat} selectedCountry={selected} onCountryClick={onCountryClick}/>
    </Scaffold>
);

// Country outlines often have their centre in the sea, so countries are chosen with the keyboard the map supports.
const choose = async (name: string) => {
    page.getByRole("button", {name, exact: true}).element().focus();
    await userEvent.keyboard("{Enter}");
};

test("map draws the countries of the world", async () => {
    await render(map([]));
    await expect.element(page.getByRole("img", {name: "World map"}), {message: "Map does not draw the countries"}).toBeVisible();
});

test("choosing a visited country reports its code", async () => {
    const [code, name] = any();
    const onCountryClick = vi.fn();
    await render(map([{count: 4, country: {code}}], onCountryClick));
    await choose(name);
    expect(onCountryClick, "Choosing a visited country does not report it").toHaveBeenCalledWith(code);
});

test("choosing an unvisited country reports nothing", async () => {
    const onCountryClick = vi.fn();
    await render(map([{count: 4, country: {code: "fr"}}], onCountryClick));
    await choose("Japan");
    expect(onCountryClick, "Choosing an unvisited country reports it").not.toHaveBeenCalled();
});

test("map highlights the selected country", async () => {
    const [code, name] = any();
    await render(map([{count: 2, country: {code}}], vi.fn(), code));
    await expect.element(page.getByRole("button", {name, exact: true}), {message: "Map does not highlight the selected country"}).toHaveAttribute("style", expect.stringContaining("warning-main"));
});

test("map dims other visited countries while one is selected", async () => {
    await render(map([{count: 2, country: {code: "fr"}}, {count: 2, country: {code: "jp"}}], vi.fn(), "fr"));
    await expect.element(page.getByRole("button", {name: "Japan", exact: true}), {message: "Map does not dim other visited countries"}).toHaveAttribute("style", expect.stringContaining("fill-opacity: 0.35"));
});
