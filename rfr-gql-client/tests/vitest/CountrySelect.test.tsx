import {expect, test} from "vitest";
import {page, userEvent} from "vitest/browser";
import {render} from "vitest-browser-react";
import {CountrySelect} from "../../src/components/CountrySelect";
import {Scaffold} from "./Scaffold";

const NAMES = ["Russia", "Kazahkstan", "Belarus", "Thailand", "USA", "France", "Germany"];
const any = () => NAMES[Math.floor(Math.random() * NAMES.length)];

test("clear button is disabled while no country is chosen", async () => {
    await render(<Scaffold><CountrySelect/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Clear country filters"}), {message: "Clear button is enabled without a chosen country"}).toBeDisabled();
});

test("choosing a country shows it as a chip", async () => {
    await render(<Scaffold><CountrySelect/></Scaffold>);
    const name = any();
    await page.getByRole("combobox").click();
    await page.getByRole("option", {name, exact: true}).click();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByCss(".MuiChip-label"), {message: "Chosen country is not shown as a chip"}).toHaveTextContent(name);
});

test("choosing a country enables the clear button", async () => {
    await render(<Scaffold><CountrySelect/></Scaffold>);
    await page.getByRole("combobox").click();
    await page.getByRole("option", {name: any(), exact: true}).click();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("button", {name: "Clear country filters"}), {message: "Clear button stays disabled after a choice"}).toBeEnabled();
});

test("clear button removes every chosen country", async () => {
    await render(<Scaffold><CountrySelect/></Scaffold>);
    await page.getByRole("combobox").click();
    await page.getByRole("option", {name: "France"}).click();
    await page.getByRole("option", {name: "Thailand"}).click();
    await userEvent.keyboard("{Escape}");
    await page.getByRole("button", {name: "Clear country filters"}).click();
    await expect.element(page.getByCss(".MuiChip-root").first(), {message: "Clear button leaves chosen countries behind"}).not.toBeInTheDocument();
});
