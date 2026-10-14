import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Box} from "@mui/material";
import {CollapsibleMapCard} from "../../src/components/CollapsibleMapCard";
import {Scaffold} from "./Scaffold";

const card = () => (
    <Scaffold>
        <CollapsibleMapCard>
            <Box sx={{height: 640}}>Map of visited countries</Box>
        </CollapsibleMapCard>
    </Scaffold>
);

test("card starts expanded when no choice is remembered", async () => {
    localStorage.removeItem("rangiffler-map-collapsed");
    await render(card());
    await expect.element(page.getByRole("button", {name: "Collapse map"}), {message: "Card does not start expanded"}).toHaveAttribute("aria-expanded", "true");
});

test("card starts collapsed when the collapse is remembered", async () => {
    localStorage.setItem("rangiffler-map-collapsed", "true");
    await render(card());
    await expect.element(page.getByRole("button", {name: "Expand map"}), {message: "Card does not restore the remembered collapse"}).toHaveAttribute("aria-expanded", "false");
});

test("toggle collapses an expanded card", async () => {
    localStorage.removeItem("rangiffler-map-collapsed");
    await render(card());
    await page.getByRole("button", {name: "Collapse map"}).click();
    await expect.element(page.getByRole("button", {name: "Expand map"}), {message: "Toggle does not collapse the card"}).toHaveAttribute("aria-expanded", "false");
});

test("toggle expands a collapsed card", async () => {
    localStorage.setItem("rangiffler-map-collapsed", "true");
    await render(card());
    await page.getByRole("button", {name: "Expand map"}).click();
    await expect.element(page.getByRole("button", {name: "Collapse map"}), {message: "Toggle does not expand the card"}).toHaveAttribute("aria-expanded", "true");
});

test("toggle remembers the collapse for the next visit", async () => {
    localStorage.removeItem("rangiffler-map-collapsed");
    await render(card());
    await page.getByRole("button", {name: "Collapse map"}).click();
    await expect.poll(() => localStorage.getItem("rangiffler-map-collapsed"), {message: "Toggle does not remember the collapse"}).toBe("true");
});

test("collapsed card clips the map to a short strip", async () => {
    localStorage.setItem("rangiffler-map-collapsed", "true");
    await render(card());
    await expect.poll(() => page.getByText("Map of visited countries").element().parentElement!.parentElement!.getBoundingClientRect().height, {message: "Collapsed card does not clip the map"}).toBe(180);
});
