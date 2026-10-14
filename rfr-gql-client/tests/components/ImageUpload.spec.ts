import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Static} from "../../src/components/ImageUpload/ImageUpload.story";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

test("upload button shows the given caption", async ({mount}) => {
    const caption = `Upload ${randomUUID().slice(0, 7)}`;
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: caption});
    await expect(component.getByRole("button"), "Upload button does not show its caption").toHaveText(caption);
});

test("empty upload shows a camera placeholder", async ({mount}) => {
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: "Pick"});
    await expect(component.getByTestId("PhotoCameraRoundedIcon"), "Empty upload does not show the camera placeholder").toBeVisible();
});

test("filled upload previews the chosen image", async ({mount}) => {
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: "Pick", file: PIXEL});
    await expect(component.getByRole("img"), "Filled upload does not preview the image").toHaveAttribute("src", PIXEL);
});

test("avatar upload previews the image inside an avatar", async ({mount}) => {
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: "Pick", file: PIXEL, isAvatar: true});
    await expect(component.locator(".MuiAvatar-img"), "Avatar upload does not preview the image in an avatar").toHaveAttribute("src", PIXEL);
});

test("failed upload shows its helper text", async ({mount}) => {
    const hint = `Broken ${randomUUID().slice(0, 5)}`;
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: "Pick", error: true, helperText: hint});
    await expect(component.getByText(hint), "Failed upload does not show its helper text").toBeVisible();
});

test("valid upload hides its helper text", async ({mount}) => {
    const hint = `Hidden ${randomUUID().slice(0, 5)}`;
    const component = await mount<typeof Static>("ImageUpload/Static", {buttonText: "Pick", error: false, helperText: hint});
    await expect(component.getByText(hint), "Valid upload shows its helper text").toHaveCount(0);
});

test("choosing a file hands its data url to the owner", async ({mount}) => {
    const component = await mount("ImageUpload/Uploadable");
    await component.locator("input[type=file]").setInputFiles({
        name: `${randomUUID().slice(0, 6)}.png`,
        mimeType: "image/png",
        buffer: Buffer.from(randomUUID()),
    });
    await expect(component.getByTestId("file"), "Chosen file does not reach the owner as a data url").toHaveValue(/^data:image\/png;base64,/);
});
