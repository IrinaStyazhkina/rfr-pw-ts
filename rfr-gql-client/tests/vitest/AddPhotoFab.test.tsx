import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Box} from "@mui/material";
import {AddPhotoFab} from "../../src/components/AddPhotoFab";
import {Scaffold} from "./Scaffold";
import {between} from "./fixtures";

test("fab shows its label at the top of the page", async () => {
    await render(<Scaffold><AddPhotoFab onClick={() => undefined}/></Scaffold>);
    await expect.element(page.getByRole("button", {name: "Add photo"}), {message: "Fab does not show its label"}).toHaveTextContent("Add photo");
});

test("fab hides its label once the page is scrolled down", async () => {
    await render(<Scaffold><Box sx={{height: 5000}}/><AddPhotoFab onClick={() => undefined}/></Scaffold>);
    window.scrollTo(0, between(900, 2400));
    await expect.poll(() => page.getByRole("button", {name: "Add photo"}).element().textContent, {message: "Fab still shows its label after scrolling"}).toBe("");
});

test("fab reports every click to its owner", async () => {
    const onClick = vi.fn();
    await render(<Scaffold><AddPhotoFab onClick={onClick}/></Scaffold>);
    const clicks = between(2, 5);
    for (let i = 0; i < clicks; i++) {
        await page.getByRole("button", {name: "Add photo"}).click();
    }
    expect(onClick, "Fab did not report every click").toHaveBeenCalledTimes(clicks);
});
