import {expect, test} from "@playwright/test";

test("fab shows its label at the top of the page", async ({mount}) => {
    const component = await mount("AddPhotoFab/Clickable");
    await expect(component.getByRole("button", {name: "Add photo"}), "Fab does not show its label").toHaveText("Add photo");
});

test("fab hides its label once the page is scrolled down", async ({mount, page}) => {
    const component = await mount("AddPhotoFab/OnLongPage");
    await page.mouse.wheel(0, 900 + Math.floor(Math.random() * 1500));
    await expect(component.getByRole("button", {name: "Add photo"}), "Fab still shows its label after scrolling").toHaveText("");
});

test("fab reports every click to its owner", async ({mount}) => {
    const component = await mount("AddPhotoFab/Clickable");
    const clicks = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < clicks; i++) {
        await component.getByRole("button", {name: "Add photo"}).click();
    }
    await expect(component.getByTestId("clicks"), "Fab did not report every click").toHaveValue(String(clicks));
});
