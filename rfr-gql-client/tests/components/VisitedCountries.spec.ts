import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/VisitedCountries/VisitedCountries.story";
import {country} from "./fixtures";

const visits = (count: number) => {
    const countries = Array.from({length: count}, () => country());
    const stat = countries.map((land) => ({count: 1 + Math.floor(Math.random() * 50), country: {code: land.code}}));
    return {countries, stat};
};

test("label counts several visited countries in plural", async ({mount}) => {
    const {countries, stat} = visits(2 + Math.floor(Math.random() * 5));
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await expect(component.getByRole("button"), "Label does not count countries in plural").toHaveText(`${stat.length} countries visited`);
});

test("label counts a single visited country in singular", async ({mount}) => {
    const {countries, stat} = visits(1);
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await expect(component.getByRole("button"), "Label does not count a country in singular").toHaveText("1 country visited");
});

test("traveller without visits sees a plain label", async ({mount}) => {
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {stat: []});
    await expect(component.getByText("0 countries visited"), "Empty label is missing").toBeVisible();
});

test("traveller without visits cannot open the list", async ({mount}) => {
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {stat: []});
    await expect(component.getByRole("button"), "Empty label can be opened").toHaveCount(0);
});

test("list orders countries by the number of photos", async ({mount, page}) => {
    const {countries, stat} = visits(3 + Math.floor(Math.random() * 3));
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await component.getByRole("button").click();
    const names = [...stat].sort((a, b) => b.count - a.count).map((row) => countries.find((land) => land.code === row.country.code)!.name);
    await expect(page.getByRole("tooltip").locator(".MuiListItemText-primary"), "List does not order countries by photos").toHaveText(names);
});

test("list names an unknown country by its code", async ({mount, page}) => {
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries: [], stat: [{count: 3, country: {code: "zz"}}]});
    await component.getByRole("button").click();
    await expect(page.getByRole("tooltip").locator(".MuiListItemText-primary"), "List does not fall back to the code").toHaveText("ZZ");
});

test("choosing a country reports its code", async ({mount, page}) => {
    const {countries, stat} = visits(3);
    const target = countries[Math.floor(Math.random() * countries.length)];
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await component.getByRole("button").click();
    await page.getByRole("tooltip").getByRole("button", {name: target.name}).click();
    await expect(component.getByTestId("chosen"), "Choosing a country does not report its code").toHaveValue(target.code);
});

test("choosing a country closes the list", async ({mount, page}) => {
    const {countries, stat} = visits(2);
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await component.getByRole("button").click();
    await page.getByRole("tooltip").getByRole("button", {name: countries[0].name}).click();
    await expect(page.getByRole("tooltip"), "Choosing a country leaves the list open").toHaveCount(0);
});

test("list marks the selected country with a check", async ({mount, page}) => {
    const {countries, stat} = visits(3);
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat, selected: countries[1].code});
    await component.getByRole("button").click();
    await expect(page.getByRole("tooltip").getByTestId("CheckRoundedIcon"), "List does not mark the selected country").toHaveCount(1);
});

test("arrow down opens the list on the first country", async ({mount, page}) => {
    const {countries, stat} = visits(2);
    const component = await mount<typeof Stateful>("VisitedCountries/Stateful", {countries, stat});
    await component.getByRole("button").press("ArrowDown");
    await expect(page.getByRole("tooltip").getByRole("button").first(), "Arrow down does not focus the first country").toBeFocused();
});
