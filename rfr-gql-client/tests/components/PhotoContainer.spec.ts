import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/PhotoContainer/PhotoContainer.story";
import {photo, word} from "./fixtures";

test("container shows skeletons while loading", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {loading: true, photos: [photo(true)]});
    await expect(component.locator(".MuiSkeleton-rectangular"), "Container does not show skeletons while loading").toHaveCount(8);
});

test("container shows a card for every photo", async ({mount}) => {
    const photos = Array.from({length: 1 + Math.floor(Math.random() * 6)}, () => photo(Math.random() < 0.5));
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos});
    await expect(component.locator(".photo-card"), "Container does not show a card for every photo").toHaveCount(photos.length);
});

test("empty container invites to add the first photo", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: []});
    await expect(component.getByText("No travels yet"), "Empty container does not invite to add a photo").toBeVisible();
});

test("first photo button reports the click", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: []});
    await component.getByRole("button", {name: "Add your first photo"}).click();
    await expect(component.getByTestId("adds"), "First photo button does not report the click").toHaveValue("1");
});

test("filtered empty container names the filtered country", async ({mount}) => {
    const name = `Land ${word()}`;
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [], filterCountryName: name});
    await expect(component.getByText(`No photos from ${name}`), "Filtered container does not name the country").toBeVisible();
});

test("show all countries button resets the filter", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [], filterCountryName: word()});
    await component.getByRole("button", {name: "Show all countries"}).click();
    await expect(component.getByTestId("resets"), "Show all button does not reset the filter").toHaveValue("1");
});

test("container shows a spinner while loading more photos", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [photo(true)], loadingMore: true});
    await expect(component.getByRole("progressbar"), "Container does not show a spinner for more photos").toBeVisible();
});

test("container marks itself busy while refreshing", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [photo(true)], refreshing: true});
    await expect(component.locator("[aria-busy=true]"), "Container is not busy while refreshing").toHaveCount(1);
});

test("container asks for more photos when the end comes into view", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [photo(true)], hasNextPage: true});
    await expect(component.getByTestId("loads"), "Container does not ask for more photos").not.toHaveValue("0");
});

test("container does not ask for more photos on the last page", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [photo(true)], hasNextPage: false});
    await component.locator(".photo-card").waitFor();
    await expect(component.getByTestId("loads"), "Container asks for photos past the last page").toHaveValue("0");
});

test("editing a photo opens the dialog with its description", async ({mount, page}) => {
    const shot = photo(true);
    const component = await mount<typeof Stateful>("PhotoContainer/Stateful", {photos: [shot], countries: [shot.country]});
    await component.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Edit"}).click();
    await expect(page.getByRole("dialog").getByRole("textbox", {name: "Description"}), "Edit dialog does not show the description").toHaveValue(shot.description);
});
