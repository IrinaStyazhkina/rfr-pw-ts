import {defineConfig, devices} from "@playwright/test";

// A port of its own, so a developer's running dev server (often from another checkout) is never reused by mistake.
const PORT = 3101;
const GALLERY_URL = `http://localhost:${PORT}/playwright/gallery/index.html`;

export default defineConfig({
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: "list",
    projects: [
        {
            name: "components",
            testDir: "./tests/components",
            use: {...devices["Desktop Chrome"], baseURL: GALLERY_URL, serviceWorkers: "block", reuseContext: true},
        },
    ],
    webServer: {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: GALLERY_URL,
        reuseExistingServer: !process.env.CI,
    },
});
