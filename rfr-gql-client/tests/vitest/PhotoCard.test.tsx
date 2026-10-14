import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {MockLink} from "@apollo/client/testing";
import {PhotoCard} from "../../src/components/PhotoCard";
import {Photo} from "../../src/types/Photo";
import {User} from "../../src/types/User";
import {DELETE_PHOTO} from "../../src/hooks/useDeletePhoto";
import {LIKE_PHOTO} from "../../src/hooks/useLikePhoto";
import {Scaffold} from "./Scaffold";
import {answer, failure, recording} from "./apollo";
import {between, person, photo} from "./fixtures";

const card = (shot: Photo, viewer: User, mocks: MockLink.MockedResponse[] = [], onEditClick = vi.fn()) => (
    <Scaffold user={viewer} mocks={mocks}>
        <PhotoCard photo={shot} onEditClick={onEditClick}/>
    </Scaffold>
);

test("card shows the photo description", async () => {
    const shot = photo(false);
    await render(card(shot, person()));
    await expect.element(page.getByText(shot.description), {message: "Card does not show the description"}).toBeVisible();
});

test("card labels the photo with its country", async () => {
    const shot = photo(false);
    await render(card(shot, person()));
    await expect.element(page.getByCss(".MuiChip-label"), {message: "Card does not label the country"}).toHaveTextContent(shot.country.name);
});

test("card counts a single like in singular", async () => {
    await render(card(photo(false, ["someone"]), person()));
    await expect.element(page.getByText("1 like", {exact: true}), {message: "Card does not count a single like in singular"}).toBeVisible();
});

test("card counts several likes in plural", async () => {
    const likers = Array.from({length: between(2, 9)}, (_, i) => `fan-${i}`);
    await render(card(photo(false, likers), person()));
    await expect.element(page.getByText(`${likers.length} likes`), {message: "Card does not count likes in plural"}).toBeVisible();
});

test("card fills the heart when the viewer liked the photo", async () => {
    const viewer = person();
    await render(card(photo(false, ["other", viewer.id]), viewer));
    await expect.element(page.getByTestId("FavoriteRoundedIcon"), {message: "Card does not fill the heart for the viewer like"}).toBeVisible();
});

test("card leaves the heart empty when the viewer did not like the photo", async () => {
    await render(card(photo(false, ["other"]), person()));
    await expect.element(page.getByTestId("FavoriteBorderRoundedIcon"), {message: "Card fills the heart without the viewer like"}).toBeVisible();
});

test("card hides owner actions from other users", async () => {
    await render(card(photo(false), person()));
    await expect.element(page.getByRole("button", {name: "Photo actions"}), {message: "Card shows owner actions to a stranger"}).not.toBeInTheDocument();
});

test("like button sends the viewer like for the photo", async () => {
    const shot = photo(false);
    const viewer = person();
    const sent: Record<string, unknown>[] = [];
    await render(card(shot, viewer, [recording(LIKE_PHOTO, {data: {photo: photo(false, [viewer.id])}}, sent)]));
    await page.getByRole("button", {name: "like"}).click();
    await expect.poll(() => sent[0], {message: "Like button does not send the viewer like"}).toEqual({input: {id: shot.id, like: {user: viewer.id}}});
});

test("like button confirms a successful like", async () => {
    await render(card(photo(false), person(), [answer(LIKE_PHOTO, {data: {photo: photo(false, ["x"])}})]));
    await page.getByRole("button", {name: "like"}).click();
    await expect.element(page.getByRole("alert"), {message: "Like button does not confirm the like"}).toHaveTextContent("Post was succesfully liked");
});

test("like button explains a failed like", async () => {
    await render(card(photo(false), person(), [answer(LIKE_PHOTO, failure("database is down"))]));
    await page.getByRole("button", {name: "like"}).click();
    await expect.element(page.getByRole("alert"), {message: "Like button does not explain the failure"}).toHaveTextContent("Post was not liked");
});

test("edit action hands the photo to the owner", async () => {
    const shot = photo(true);
    const onEditClick = vi.fn();
    await render(card(shot, person(), [], onEditClick));
    await page.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Edit"}).click();
    expect(onEditClick, "Edit action does not hand over the photo").toHaveBeenCalledWith(shot);
});

test("delete action removes the photo on the server", async () => {
    const shot = photo(true);
    const sent: Record<string, unknown>[] = [];
    await render(card(shot, person(), [recording(DELETE_PHOTO, {data: {deletePhoto: true}}, sent)]));
    await page.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    await expect.poll(() => sent[0], {message: "Delete action does not remove the photo"}).toEqual({id: shot.id});
});

test("delete action confirms the removal", async () => {
    await render(card(photo(true), person(), [answer(DELETE_PHOTO, {data: {deletePhoto: true}})]));
    await page.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    await expect.element(page.getByRole("alert"), {message: "Delete action does not confirm the removal"}).toHaveTextContent("Post deleted");
});

test("delete action explains a failed removal", async () => {
    await render(card(photo(true), person(), [answer(DELETE_PHOTO, failure("database is down"))]));
    await page.getByRole("button", {name: "Photo actions"}).click();
    await page.getByRole("menuitem", {name: "Delete"}).click();
    await expect.element(page.getByRole("alert"), {message: "Delete action does not explain the failure"}).toHaveTextContent("Can not delete post");
});
