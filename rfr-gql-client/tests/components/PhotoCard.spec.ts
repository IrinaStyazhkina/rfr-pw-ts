import {expect, test} from "@playwright/test";
import type {Stateful} from "../../src/components/PhotoCard/PhotoCard.story";
import {graphql, operation} from "./graphql";
import {failure, person, photo} from "./fixtures";

test("card shows the photo description", async ({mount}) => {
    const shot = photo(false);
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: shot, user: person()});
    await expect(component.getByText(shot.description), "Card does not show the description").toBeVisible();
});

test("card labels the photo with its country", async ({mount}) => {
    const shot = photo(false);
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: shot, user: person()});
    await expect(component.locator(".MuiChip-label"), "Card does not label the country").toHaveText(shot.country.name);
});

test("card counts a single like in singular", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false, ["someone"]), user: person()});
    await expect(component.getByText("1 like", {exact: true}), "Card does not count a single like in singular").toBeVisible();
});

test("card counts several likes in plural", async ({mount}) => {
    const likers = Array.from({length: 2 + Math.floor(Math.random() * 8)}, (_, i) => `fan-${i}`);
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false, likers), user: person()});
    await expect(component.getByText(`${likers.length} likes`), "Card does not count likes in plural").toBeVisible();
});

test("card fills the heart when the viewer liked the photo", async ({mount}) => {
    const viewer = person();
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false, ["other", viewer.id]), user: viewer});
    await expect(component.getByTestId("FavoriteRoundedIcon"), "Card does not fill the heart for the viewer like").toBeVisible();
});

test("card leaves the heart empty when the viewer did not like the photo", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false, ["other"]), user: person()});
    await expect(component.getByTestId("FavoriteBorderRoundedIcon"), "Card fills the heart without the viewer like").toBeVisible();
});

test("card hides owner actions from other users", async ({mount}) => {
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false), user: person()});
    await expect(component.getByRole("button", {name: "Photo actions"}), "Card shows owner actions to a stranger").toHaveCount(0);
});

test("like button sends the viewer like for the photo", async ({mount, page}) => {
    const shot = photo(false);
    const viewer = person();
    await graphql(page, {LikePhoto: {data: {photo: photo(false, [viewer.id])}}});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: shot, user: viewer});
    const request = page.waitForRequest((r) => operation(r) === "LikePhoto");
    await component.getByRole("button", {name: "like"}).click();
    expect((await request).postDataJSON().variables.input, "Like button does not send the viewer like").toEqual({id: shot.id, like: {user: viewer.id}});
});

test("like button confirms a successful like", async ({mount, page}) => {
    await graphql(page, {LikePhoto: {data: {photo: photo(false, ["x"])}}});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false), user: person()});
    await component.getByRole("button", {name: "like"}).click();
    await expect(component.getByRole("alert"), "Like button does not confirm the like").toHaveText("Post was succesfully liked");
});

test("like button explains a failed like", async ({mount, page}) => {
    await graphql(page, {LikePhoto: failure("database is down")});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(false), user: person()});
    await component.getByRole("button", {name: "like"}).click();
    await expect(component.getByRole("alert"), "Like button does not explain the failure").toHaveText("Post was not liked");
});

test("edit action hands the photo to the owner", async ({mount, page}) => {
    const shot = photo(true);
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: shot, user: person()});
    await component.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Edit"}).click();
    await expect(component.getByTestId("edited"), "Edit action does not hand over the photo").toHaveValue(shot.id);
});

test("delete action removes the photo on the server", async ({mount, page}) => {
    const shot = photo(true);
    await graphql(page, {DeletePhoto: {data: {deletePhoto: true}}});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: shot, user: person()});
    const request = page.waitForRequest((r) => operation(r) === "DeletePhoto");
    await component.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    expect((await request).postDataJSON().variables.id, "Delete action does not remove the photo").toBe(shot.id);
});

test("delete action confirms the removal", async ({mount, page}) => {
    await graphql(page, {DeletePhoto: {data: {deletePhoto: true}}});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(true), user: person()});
    await component.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    await expect(component.getByRole("alert"), "Delete action does not confirm the removal").toHaveText("Post deleted");
});

test("delete action explains a failed removal", async ({mount, page}) => {
    await graphql(page, {DeletePhoto: failure("database is down")});
    const component = await mount<typeof Stateful>("PhotoCard/Stateful", {photo: photo(true), user: person()});
    await component.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    await expect(component.getByRole("alert"), "Delete action does not explain the failure").toHaveText("Can not delete post");
});
