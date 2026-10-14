import {expect, test} from "@playwright/test";
import {randomUUID} from "node:crypto";
import type {Default} from "../../src/components/TabPanel/TabPanel.story";

test("tab panel shows its content", async ({mount}) => {
    const content = `Friends ${randomUUID()}`;
    const component = await mount<typeof Default>("TabPanel/Default", {value: "friends", content});
    await expect(component.getByRole("tabpanel"), "Tab panel does not show its content").toHaveText(content);
});

test("tab panel points to its tab", async ({mount}) => {
    const value = randomUUID().slice(0, 6);
    const component = await mount<typeof Default>("TabPanel/Default", {value, content: "x"});
    await expect(component.getByRole("tabpanel"), "Tab panel does not reference its tab").toHaveAttribute("aria-labelledby", `simple-tab-${value}`);
});
