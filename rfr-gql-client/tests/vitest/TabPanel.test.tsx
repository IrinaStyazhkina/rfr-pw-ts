import {expect, test} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {TabPanel} from "../../src/components/TabPanel";
import {Scaffold} from "./Scaffold";
import {word} from "./fixtures";

test("tab panel shows its content", async () => {
    const content = `Friends ${word()}`;
    await render(<Scaffold><TabPanel value="friends">{content}</TabPanel></Scaffold>);
    await expect.element(page.getByRole("tabpanel"), {message: "Tab panel does not show its content"}).toHaveTextContent(content);
});

test("tab panel points to its tab", async () => {
    const value = word();
    await render(<Scaffold><TabPanel value={value}>x</TabPanel></Scaffold>);
    await expect.element(page.getByRole("tabpanel"), {message: "Tab panel does not reference its tab"}).toHaveAttribute("aria-labelledby", `simple-tab-${value}`);
});
