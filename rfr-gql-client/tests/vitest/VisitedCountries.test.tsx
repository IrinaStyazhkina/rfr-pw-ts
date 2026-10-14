import {expect, test, vi} from "vitest";
import {page, userEvent} from "vitest/browser";
import {render} from "vitest-browser-react";
import {VisitedCountries} from "../../src/components/VisitedCountries";
import {Stat} from "../../src/types/Stat";
import {Country} from "../../src/types/Country";
import {Scaffold} from "./Scaffold";
import {between, country} from "./fixtures";

const visits = (count: number) => {
    const countries = Array.from({length: count}, () => country());
    const stat = countries.map((land) => ({count: between(1, 50), country: {code: land.code}}));
    return {countries, stat};
};

// An open tooltip renames its trigger after the tooltip content, so the trigger is found by its popup role.
const label = () => page.getByCss("button[aria-haspopup=true]");

const list = (stat: Stat[], countries: Country[], onSelect = vi.fn(), selected?: string) => (
    <Scaffold countries={countries}>
        <VisitedCountries stat={stat} selectedCountry={selected} onSelect={onSelect}/>
    </Scaffold>
);

test("label counts several visited countries in plural", async () => {
    const {countries, stat} = visits(between(2, 6));
    await render(list(stat, countries));
    await expect.element(label(), {message: "Label does not count countries in plural"}).toHaveTextContent(`${stat.length} countries visited`);
});

test("label counts a single visited country in singular", async () => {
    const {countries, stat} = visits(1);
    await render(list(stat, countries));
    await expect.element(label(), {message: "Label does not count a country in singular"}).toHaveTextContent("1 country visited");
});

test("traveller without visits sees a plain label", async () => {
    await render(list([], []));
    await expect.element(page.getByText("0 countries visited"), {message: "Empty label is missing"}).toBeVisible();
});

test("traveller without visits cannot open the list", async () => {
    await render(list([], []));
    await expect.element(label(), {message: "Empty label can be opened"}).not.toBeInTheDocument();
});

test("list orders countries by the number of photos", async () => {
    const {countries, stat} = visits(between(3, 5));
    await render(list(stat, countries));
    await label().click();
    const names = [...stat].sort((a, b) => b.count - a.count).map((row) => countries.find((land) => land.code === row.country.code)!.name);
    await expect.poll(() => page.getByRole("tooltip").getByCss(".MuiListItemText-primary").elements().map((item) => item.textContent), {message: "List does not order countries by photos"}).toEqual(names);
});

test("list names an unknown country by its code", async () => {
    await render(list([{count: 3, country: {code: "zz"}}], []));
    await label().click();
    await expect.element(page.getByRole("tooltip").getByCss(".MuiListItemText-primary"), {message: "List does not fall back to the code"}).toHaveTextContent("ZZ");
});

test("choosing a country reports its code", async () => {
    const {countries, stat} = visits(3);
    const target = countries[between(0, 2)];
    const onSelect = vi.fn();
    await render(list(stat, countries, onSelect));
    await label().click();
    await page.getByRole("tooltip").getByRole("button", {name: target.name}).click();
    expect(onSelect, "Choosing a country does not report its code").toHaveBeenCalledWith(target.code);
});

test("choosing a country closes the list", async () => {
    const {countries, stat} = visits(2);
    await render(list(stat, countries));
    await label().click();
    await page.getByRole("tooltip").getByRole("button", {name: countries[0].name}).click();
    await expect.element(page.getByRole("tooltip"), {message: "Choosing a country leaves the list open"}).not.toBeInTheDocument();
});

test("list marks the selected country with a check", async () => {
    const {countries, stat} = visits(3);
    await render(list(stat, countries, vi.fn(), countries[1].code));
    await label().click();
    await expect.element(page.getByRole("tooltip").getByTestId("CheckRoundedIcon"), {message: "List does not mark the selected country"}).toBeVisible();
});

test("arrow down opens the list on the first country", async () => {
    const {countries, stat} = visits(2);
    await render(list(stat, countries));
    label().element().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("tooltip").getByRole("button").first(), {message: "Arrow down does not focus the first country"}).toHaveFocus();
});
