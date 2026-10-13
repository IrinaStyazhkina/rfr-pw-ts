import {expect, test} from "@playwright/test";

const NAMES = ["Russia", "Kazahkstan", "Belarus", "Thailand", "USA", "France", "Germany"];
const any = () => NAMES[Math.floor(Math.random() * NAMES.length)];

test("clear button is disabled while no country is chosen", async ({mount}) => {
    const component = await mount("CountrySelect/Default");
    await expect(component.getByRole("button", {name: "Clear country filters"}), "Clear button is enabled without a chosen country").toBeDisabled();
});

test("choosing a country shows it as a chip", async ({mount, page}) => {
    const component = await mount("CountrySelect/Default");
    const name = any();
    await component.getByRole("combobox").click();
    await page.getByRole("option", {name, exact: true}).click();
    await page.keyboard.press("Escape");
    await expect(component.locator(".MuiChip-root"), "Chosen country is not shown as a chip").toHaveText([name]);
});

test("choosing a country enables the clear button", async ({mount, page}) => {
    const component = await mount("CountrySelect/Default");
    await component.getByRole("combobox").click();
    await page.getByRole("option", {name: any(), exact: true}).click();
    await page.keyboard.press("Escape");
    await expect(component.getByRole("button", {name: "Clear country filters"}), "Clear button stays disabled after a choice").toBeEnabled();
});

test("clear button removes every chosen country", async ({mount, page}) => {
    const component = await mount("CountrySelect/Default");
    await component.getByRole("combobox").click();
    await page.getByRole("option", {name: "France"}).click();
    await page.getByRole("option", {name: "Thailand"}).click();
    await page.keyboard.press("Escape");
    await component.getByRole("button", {name: "Clear country filters"}).click();
    await expect(component.locator(".MuiChip-root"), "Clear button leaves chosen countries behind").toHaveCount(0);
});
