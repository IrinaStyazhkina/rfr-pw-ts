import {expect, test, vi} from "vitest";
import {ReactNode, useState} from "react";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {MockLink} from "@apollo/client/testing";
import {PhotoModal} from "../../src/components/PhotoModal";
import {formInitialState} from "../../src/components/PhotoModal/formValidate";
import {Country} from "../../src/types/Country";
import {CREATE_PHOTO} from "../../src/hooks/useCreatePhoto";
import {UPDATE_PHOTO} from "../../src/hooks/useUpdatePhoto";
import {GET_FEED} from "../../src/hooks/useGetFeed";
import {Scaffold} from "./Scaffold";
import {answer, failure, recording} from "./apollo";
import {between, country, photo, word} from "./fixtures";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

// Creating a photo refetches the feed, so every scenario that saves needs a feed to answer with.
const FEED = answer(GET_FEED, {
    data: {
        feed: {
            __typename: "Feed",
            photos: {__typename: "PhotoConnection", edges: [], pageInfo: {__typename: "PageInfo", hasNextPage: false, hasPreviousPage: false}},
            stat: [],
        },
    },
});

interface ModalInterface {
    isEdit?: boolean;
    photoId?: string;
    src?: string;
    description?: string;
    land?: Country;
    countries?: Country[];
    mocks?: MockLink.MockedResponse[];
    onClose?: () => void;
}

// The app hides the modal once it closes, and an open MUI modal hides its siblings, the snackbar among them.
const Closing = ({children}: {children: (visible: boolean, close: () => void) => ReactNode}) => {
    const [visible, setVisible] = useState(true);
    return children(visible, () => setVisible(false));
};

const modal = ({isEdit = false, photoId, src, description = "", land, countries = [], mocks = [], onClose = vi.fn()}: ModalInterface) => (
    <Scaffold countries={land ? [land, ...countries] : countries} mocks={[FEED, ...mocks]}>
        <Closing>
            {(visible, close) => (
            <PhotoModal
                modalState={{
                    isVisible: visible,
                    photoId: photoId ?? null,
                    formData: {
                        ...formInitialState,
                        id: photoId,
                        src: {...formInitialState.src, value: src},
                        description: {...formInitialState.description, value: description},
                        country: {...formInitialState.country, value: land?.code ?? "ru"},
                    },
                }}
                onClose={() => {
                    close();
                    onClose();
                }}
                isEdit={isEdit}
            />
            )}
        </Closing>
    </Scaffold>
);

test("new photo modal asks to add a photo", async () => {
    await render(modal({}));
    await expect.element(page.getByRole("heading"), {message: "New photo modal has a wrong title"}).toHaveTextContent("Add new photo");
});

test("edit modal asks to edit the photo", async () => {
    await render(modal({isEdit: true, photoId: crypto.randomUUID(), src: PIXEL}));
    await expect.element(page.getByRole("heading"), {message: "Edit modal has a wrong title"}).toHaveTextContent("Edit photo");
});

test("saving without an image asks to upload one", async () => {
    await render(modal({}));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByText("Please upload an image"), {message: "Modal accepts a photo without an image"}).toBeVisible();
});

test("saving a too long description explains the limit", async () => {
    await render(modal({src: PIXEL, land: country()}));
    await page.getByRole("textbox", {name: "Description"}).fill("ж".repeat(between(256, 355)));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByText("Description length has to be not longer that 255 symbols"), {message: "Modal accepts a too long description"}).toBeVisible();
});

test("saving a new photo sends it to the server", async () => {
    const land = country();
    const description = `Fjord ${word()}`;
    const sent: Record<string, unknown>[] = [];
    await render(modal({src: PIXEL, land, mocks: [recording(CREATE_PHOTO, {data: {photo: photo(true)}}, sent)]}));
    await page.getByRole("textbox", {name: "Description"}).fill(description);
    await page.getByRole("button", {name: "Save"}).click();
    await expect.poll(() => sent[0], {message: "Modal does not send the new photo"}).toEqual({input: {src: PIXEL, description, country: {code: land.code}}});
});

test("saving a new photo confirms its creation", async () => {
    await render(modal({src: PIXEL, land: country(), mocks: [answer(CREATE_PHOTO, {data: {photo: photo(true)}})]}));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByRole("alert"), {message: "Modal does not confirm the creation"}).toHaveTextContent("New post created");
});

test("failed creation is explained", async () => {
    await render(modal({src: PIXEL, land: country(), mocks: [answer(CREATE_PHOTO, failure("database is down"))]}));
    await page.getByRole("button", {name: "Save"}).click();
    await expect.element(page.getByRole("alert"), {message: "Modal does not explain the failed creation"}).toHaveTextContent("Can not create new post");
});

test("saving an edited photo updates it on the server", async () => {
    const land = country();
    const photoId = crypto.randomUUID();
    const description = `Glacier ${word()}`;
    const sent: Record<string, unknown>[] = [];
    await render(modal({isEdit: true, photoId, src: PIXEL, description: "old", land, mocks: [recording(UPDATE_PHOTO, {data: {photo: photo(true)}}, sent)]}));
    await page.getByRole("textbox", {name: "Description"}).fill(description);
    await page.getByRole("button", {name: "Save"}).click();
    await expect.poll(() => sent[0], {message: "Modal does not update the photo"}).toEqual({input: {id: photoId, description, country: {code: land.code}}});
});

test("saving a valid photo closes the modal", async () => {
    const onClose = vi.fn();
    await render(modal({src: PIXEL, land: country(), mocks: [answer(CREATE_PHOTO, {data: {photo: photo(true)}})], onClose}));
    await page.getByRole("button", {name: "Save"}).click();
    expect(onClose, "Modal stays open after saving").toHaveBeenCalledTimes(1);
});

test("close button closes the modal", async () => {
    const onClose = vi.fn();
    await render(modal({onClose}));
    await page.getByRole("button", {name: "Close"}).click();
    expect(onClose, "Close button does not close the modal").toHaveBeenCalledTimes(1);
});

test("country list offers every known country", async () => {
    const lands = Array.from({length: between(2, 5)}, () => country());
    await render(modal({land: lands[0], countries: lands.slice(1)}));
    await page.getByRole("combobox").click();
    await expect.poll(() => page.getByRole("option").elements().map((option) => option.textContent?.trim()), {message: "Country list does not offer every country"}).toEqual(lands.map((land) => land.name));
});
