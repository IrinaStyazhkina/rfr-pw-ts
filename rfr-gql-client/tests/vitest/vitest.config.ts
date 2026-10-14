import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import {playwright} from "@vitest/browser-playwright";

export default defineConfig({
    root: fileURLToPath(new URL("../..", import.meta.url)),
    plugins: [react()],
    test: {
        include: ["tests/vitest/**/*.test.tsx"],
        setupFiles: ["tests/vitest/setup.ts"],
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            // Desktop size, because the layout switches to compact variants below the md breakpoint.
            viewport: {width: 1280, height: 720},
            instances: [{browser: "chromium"}],
        },
    },
});
