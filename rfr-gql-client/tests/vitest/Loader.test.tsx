import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {Loader} from "../../src/components/Loader";
import {Scaffold} from "./Scaffold";

test("loader shows a progress indicator", async () => {
    await render(<Scaffold><Loader/></Scaffold>);
    await expect.element(page.getByRole("progressbar"), {message: "Loader does not show a progress indicator"}).toBeVisible();
});
