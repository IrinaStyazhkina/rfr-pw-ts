import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Stateful} from "../../src/components/PhotoModal/PhotoModal.story";
import {graphql, operation} from "./graphql";
import {country, failure, photo, word} from "./fixtures";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

test("new photo modal asks to add a photo", async ({mount, page}) => {
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false});
    await expect(page.getByRole("heading"), "New photo modal has a wrong title").toHaveText("Add new photo");
});

test("edit modal asks to edit the photo", async ({mount, page}) => {
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: true, photoId: randomUUID(), src: PIXEL});
    await expect(page.getByRole("heading"), "Edit modal has a wrong title").toHaveText("Edit photo");
});

test("saving without an image asks to upload one", async ({mount, page}) => {
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false});
    await page.getByRole("button", {name: "Save"}).click();
    await expect(page.getByText("Please upload an image"), "Modal accepts a photo without an image").toBeVisible();
});

test("saving a too long description explains the limit", async ({mount, page}) => {
    const land = country();
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, src: PIXEL, country: land.code, countries: [land]});
    await page.getByRole("textbox", {name: "Description"}).fill("ж".repeat(256 + Math.floor(Math.random() * 100)));
    await page.getByRole("button", {name: "Save"}).click();
    await expect(page.getByText("Description length has to be not longer that 255 symbols"), "Modal accepts a too long description").toBeVisible();
});

test("saving a new photo sends it to the server", async ({mount, page}) => {
    const land = country();
    const description = `Fjord ${word()}`;
    await graphql(page, {CreatePhoto: {data: {photo: photo(true)}}});
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, src: PIXEL, country: land.code, countries: [land]});
    const request = page.waitForRequest((r) => operation(r) === "CreatePhoto");
    await page.getByRole("textbox", {name: "Description"}).fill(description);
    await page.getByRole("button", {name: "Save"}).click();
    expect((await request).postDataJSON().variables.input, "Modal does not send the new photo").toEqual({src: PIXEL, description, country: {code: land.code}});
});

test("saving a new photo confirms its creation", async ({mount, page}) => {
    const land = country();
    await graphql(page, {CreatePhoto: {data: {photo: photo(true)}}});
    const component = await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, src: PIXEL, country: land.code, countries: [land]});
    await page.getByRole("button", {name: "Save"}).click();
    await expect(component.getByRole("alert"), "Modal does not confirm the creation").toHaveText("New post created");
});

test("failed creation is explained", async ({mount, page}) => {
    const land = country();
    await graphql(page, {CreatePhoto: failure("database is down")});
    const component = await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, src: PIXEL, country: land.code, countries: [land]});
    await page.getByRole("button", {name: "Save"}).click();
    await expect(component.getByRole("alert"), "Modal does not explain the failed creation").toHaveText("Can not create new post");
});

test("saving an edited photo updates it on the server", async ({mount, page}) => {
    const land = country();
    const photoId = randomUUID();
    const description = `Glacier ${word()}`;
    await graphql(page, {UpdatePhoto: {data: {photo: photo(true)}}});
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: true, photoId, src: PIXEL, description: "old", country: land.code, countries: [land]});
    const request = page.waitForRequest((r) => operation(r) === "UpdatePhoto");
    await page.getByRole("textbox", {name: "Description"}).fill(description);
    await page.getByRole("button", {name: "Save"}).click();
    expect((await request).postDataJSON().variables.input, "Modal does not update the photo").toEqual({id: photoId, description, country: {code: land.code}});
});

test("saving a valid photo closes the modal", async ({mount, page}) => {
    const land = country();
    await graphql(page, {CreatePhoto: {data: {photo: photo(true)}}});
    const component = await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, src: PIXEL, country: land.code, countries: [land]});
    await page.getByRole("button", {name: "Save"}).click();
    await expect(component.getByTestId("closes"), "Modal stays open after saving").toHaveValue("1");
});

test("close button closes the modal", async ({mount, page}) => {
    const component = await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false});
    await page.getByRole("button", {name: "Close"}).click();
    await expect(component.getByTestId("closes"), "Close button does not close the modal").toHaveValue("1");
});

test("country list offers every known country", async ({mount, page}) => {
    const lands = Array.from({length: 2 + Math.floor(Math.random() * 4)}, () => country());
    await mount<typeof Stateful>("PhotoModal/Stateful", {isEdit: false, country: lands[0].code, countries: lands});
    await page.getByRole("combobox").click();
    await expect(page.getByRole("option"), "Country list does not offer every country").toHaveText(lands.map((land) => land.name));
});
