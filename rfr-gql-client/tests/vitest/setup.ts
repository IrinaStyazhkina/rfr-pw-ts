import {Locator, locators} from "vitest/browser";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../../src/index.css";

declare module "vitest/browser" {
    interface LocatorSelectors {
        getByCss(selector: string): Locator;
    }
}

locators.extend({
    getByCss: (selector: string) => `css=${selector}`,
});
