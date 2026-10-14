import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {PhotoContainer} from "../../src/components/PhotoContainer";
import {DialogProvider} from "../../src/context/DialogContext";
import {Photo} from "../../src/types/Photo";
import {Country} from "../../src/types/Country";
import {Scaffold} from "./Scaffold";
import {between, photo, word} from "./fixtures";

interface ContainerInterface {
    photos: Photo[];
    countries?: Country[];
    hasNextPage?: boolean;
    loading?: boolean;
    loadingMore?: boolean;
    refreshing?: boolean;
    filterCountryName?: string;
    loadMore?: () => void;
    onAddClick?: () => void;
    onResetFilter?: () => void;
}

const container = ({
                       photos,
                       countries = [],
                       hasNextPage = false,
                       loading = false,
                       loadingMore = false,
                       refreshing = false,
                       filterCountryName,
                       loadMore = vi.fn(),
                       onAddClick = vi.fn(),
                       onResetFilter = vi.fn(),
                   }: ContainerInterface) => (
    <Scaffold countries={countries}>
        <DialogProvider>
            <PhotoContainer
                data={photos}
                hasNextPage={hasNextPage}
                loadMore={loadMore}
                loading={loading}
                loadingMore={loadingMore}
                refreshing={refreshing}
                withFriends={false}
                onAddClick={onAddClick}
                filterCountryName={filterCountryName}
                onResetFilter={onResetFilter}
            />
        </DialogProvider>
    </Scaffold>
);

test("container shows skeletons while loading", async () => {
    await render(container({photos: [photo(true)], loading: true}));
    await expect.poll(() => page.getByCss(".MuiSkeleton-rectangular").elements().length, {message: "Container does not show skeletons while loading"}).toBe(8);
});

test("container shows a card for every photo", async () => {
    const photos = Array.from({length: between(1, 6)}, () => photo(Math.random() < 0.5));
    await render(container({photos}));
    await expect.poll(() => page.getByCss(".photo-card").elements().length, {message: "Container does not show a card for every photo"}).toBe(photos.length);
});

test("empty container invites to add the first photo", async () => {
    await render(container({photos: []}));
    await expect.element(page.getByText("No travels yet"), {message: "Empty container does not invite to add a photo"}).toBeVisible();
});

test("first photo button reports the click", async () => {
    const onAddClick = vi.fn();
    await render(container({photos: [], onAddClick}));
    await page.getByRole("button", {name: "Add your first photo"}).click();
    expect(onAddClick, "First photo button does not report the click").toHaveBeenCalledTimes(1);
});

test("filtered empty container names the filtered country", async () => {
    const name = `Land ${word()}`;
    await render(container({photos: [], filterCountryName: name}));
    await expect.element(page.getByText(`No photos from ${name}`), {message: "Filtered container does not name the country"}).toBeVisible();
});

test("show all countries button resets the filter", async () => {
    const onResetFilter = vi.fn();
    await render(container({photos: [], filterCountryName: word(), onResetFilter}));
    await page.getByRole("button", {name: "Show all countries"}).click();
    expect(onResetFilter, "Show all button does not reset the filter").toHaveBeenCalledTimes(1);
});

test("container shows a spinner while loading more photos", async () => {
    await render(container({photos: [photo(true)], loadingMore: true}));
    await expect.element(page.getByRole("progressbar"), {message: "Container does not show a spinner for more photos"}).toBeVisible();
});

test("container marks itself busy while refreshing", async () => {
    await render(container({photos: [photo(true)], refreshing: true}));
    await expect.element(page.getByCss("[aria-busy=true]"), {message: "Container is not busy while refreshing"}).toBeInTheDocument();
});

test("container asks for more photos when the end comes into view", async () => {
    const loadMore = vi.fn();
    await render(container({photos: [photo(true)], hasNextPage: true, loadMore}));
    await expect.poll(() => loadMore.mock.calls.length, {message: "Container does not ask for more photos"}).toBeGreaterThan(0);
});

test("container does not ask for more photos on the last page", async () => {
    const loadMore = vi.fn();
    await render(container({photos: [photo(true)], hasNextPage: false, loadMore}));
    await page.getByCss(".photo-card").element();
    expect(loadMore, "Container asks for photos past the last page").not.toHaveBeenCalled();
});

test("editing a photo opens the dialog with its description", async () => {
    const shot = photo(true);
    await render(container({photos: [shot], countries: [shot.country]}));
    await page.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Edit"}).click();
    await expect.element(page.getByRole("dialog").getByRole("textbox", {name: "Description"}), {message: "Edit dialog does not show the description"}).toHaveValue(shot.description);
});
