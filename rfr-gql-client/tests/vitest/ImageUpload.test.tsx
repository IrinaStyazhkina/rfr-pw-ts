import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {ImageUpload} from "../../src/components/ImageUpload";
import {Scaffold} from "./Scaffold";
import {word} from "./fixtures";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

test("upload button shows the given caption", async () => {
    const caption = `Upload ${word()}`;
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText={caption} error={false}/></Scaffold>);
    await expect.element(page.getByRole("button"), {message: "Upload button does not show its caption"}).toHaveTextContent(caption);
});

test("empty upload shows a camera placeholder", async () => {
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText="Pick" error={false}/></Scaffold>);
    await expect.element(page.getByTestId("PhotoCameraRoundedIcon"), {message: "Empty upload does not show the camera placeholder"}).toBeVisible();
});

test("filled upload previews the chosen image", async () => {
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText="Pick" error={false} file={PIXEL}/></Scaffold>);
    await expect.element(page.getByRole("img"), {message: "Filled upload does not preview the image"}).toHaveAttribute("src", PIXEL);
});

test("avatar upload previews the image inside an avatar", async () => {
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText="Pick" error={false} file={PIXEL} isAvatar/></Scaffold>);
    await expect.element(page.getByCss(".MuiAvatar-img"), {message: "Avatar upload does not preview the image in an avatar"}).toHaveAttribute("src", PIXEL);
});

test("failed upload shows its helper text", async () => {
    const hint = `Broken ${word()}`;
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText="Pick" error helperText={hint}/></Scaffold>);
    await expect.element(page.getByText(hint), {message: "Failed upload does not show its helper text"}).toBeVisible();
});

test("valid upload hides its helper text", async () => {
    const hint = `Hidden ${word()}`;
    await render(<Scaffold><ImageUpload onFileUpload={() => undefined} buttonText="Pick" error={false} helperText={hint}/></Scaffold>);
    await expect.element(page.getByText(hint), {message: "Valid upload shows its helper text"}).not.toBeInTheDocument();
});

test("choosing a file hands its data url to the owner", async () => {
    const onFileUpload = vi.fn();
    await render(<Scaffold><ImageUpload onFileUpload={onFileUpload} buttonText="Pick" error={false}/></Scaffold>);
    await page.getByCss("input[type=file]").upload(new File([crypto.randomUUID()], `${word()}.png`, {type: "image/png"}));
    await expect.poll(() => onFileUpload.mock.calls[0]?.[0], {message: "Chosen file does not reach the owner as a data url"}).toMatch(/^data:image\/png;base64,/);
});
