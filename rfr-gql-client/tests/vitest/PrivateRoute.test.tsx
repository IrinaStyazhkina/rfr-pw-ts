import {expect, test, vi} from "vitest";
import {page} from "vitest/browser";
import {render} from "vitest-browser-react";
import {MockLink} from "@apollo/client/testing";
import {Route, Routes} from "react-router";
import {PrivateRoute} from "../../src/components/PrivateRoute";
import {GET_USER} from "../../src/hooks/useGetUser";
import {GET_COUNTRIES} from "../../src/hooks/useGetCountries";
import {Scaffold} from "./Scaffold";
import {answer, failure} from "./apollo";
import {country, person} from "./fixtures";

const guarded = (mocks: MockLink.MockedResponse[]) => (
    <Scaffold route="/private" mocks={[answer(GET_COUNTRIES, {data: {countries: [country()]}}), ...mocks]}>
        <Routes>
            <Route element={<PrivateRoute/>}>
                <Route path="/private" element={<p>Private content</p>}/>
            </Route>
            <Route path="/" element={<p>Public landing</p>}/>
        </Routes>
    </Scaffold>
);

test("route shows a loader until the user arrives", async () => {
    await render(guarded([answer(GET_USER, {data: {user: person()}}, 60_000)]));
    await expect.element(page.getByRole("progressbar"), {message: "Route does not show a loader"}).toBeVisible();
});

test("route shows private content to a signed in user", async () => {
    await render(guarded([answer(GET_USER, {data: {user: person()}})]));
    await expect.element(page.getByText("Private content"), {message: "Route hides private content from a signed in user"}).toBeVisible();
});

test("route wraps private content with the app bar", async () => {
    await render(guarded([answer(GET_USER, {data: {user: person()}})]));
    await expect.element(page.getByRole("button", {name: "Logout"}), {message: "Route does not show the app bar"}).toBeVisible();
});

test("route hands the signed in user to the app bar", async () => {
    const user = person();
    await render(guarded([answer(GET_USER, {data: {user}})]));
    await expect.element(page.getByRole("banner").getByRole("link", {name: "Profile"}), {message: "Route does not hand the user to the app bar"}).toHaveTextContent(user.username[0].toUpperCase());
});

test("route sends an unauthorized visitor to the landing page", async () => {
    await render(guarded([answer(GET_USER, failure("Unauthorized", "UNAUTHORIZED"))]));
    await expect.element(page.getByText("Public landing"), {message: "Route does not send an unauthorized visitor away"}).toBeVisible();
});

test("route explains a failure to load the profile", async () => {
    await render(guarded([answer(GET_USER, failure("database is down"))]));
    await expect.element(page.getByRole("alert").getByText("Can not load your profile"), {message: "Route does not explain the profile failure"}).toBeVisible();
});

test("route keeps private content hidden when the profile fails", async () => {
    await render(guarded([answer(GET_USER, failure("database is down"))]));
    await vi.waitFor(() => page.getByRole("alert").element());
    await expect.element(page.getByText("Private content"), {message: "Route shows private content without a profile"}).not.toBeInTheDocument();
});
