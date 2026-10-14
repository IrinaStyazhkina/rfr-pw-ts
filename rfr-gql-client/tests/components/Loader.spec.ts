import {expect, test} from "@playwright/test";

test("loader shows a progress indicator", async ({mount}) => {
    const component = await mount("Loader/Default");
    await expect(component.getByRole("progressbar"), "Loader does not show a progress indicator").toBeVisible();
});
