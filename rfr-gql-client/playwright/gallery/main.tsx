import {ComponentType} from "react";
import {flushSync} from "react-dom";
import {createRoot, Root} from "react-dom/client";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../../src/index.css";

type Story = ComponentType<Record<string, unknown>>;

declare global {
    interface Window {
        mount: (params: { story: string, props?: Record<string, unknown> }) => Promise<void>;
        unmount: () => Promise<void>;
    }
}

const stories = import.meta.glob<Record<string, Story>>("../../src/**/*.story.tsx");
const id = (file: string) => file.replace(/^(\.\.\/)+src\//, "").replace(/\.story\.tsx$/, "");

const resolve = async (story: string): Promise<Story> => {
    const sep = story.lastIndexOf("/");
    const path = story.slice(0, sep);
    const files = Object.keys(stories).filter((f) => id(f) === path || id(f).endsWith(`/${path}`));
    if (files.length !== 1) {
        throw new Error(`Story "${story}" matches ${files.length} story files instead of one`);
    }
    const resolved = (await stories[files[0]]())[story.slice(sep + 1)];
    if (!resolved) {
        throw new Error(`Story "${story}" is not exported from ${files[0]}`);
    }
    return resolved;
};

const container = document.getElementById("root")!;
let root: Root | undefined;

window.mount = async ({story, props}) => {
    const Resolved = await resolve(story);
    // Reusing the root lets update() reconcile in place, so component state survives a props change.
    root ??= createRoot(container);
    // flushSync turns a render error into a rejected promise instead of a swallowed one.
    flushSync(() => root!.render(<Resolved {...props}/>));
};

window.unmount = async () => {
    root?.unmount();
    root = undefined;
};
