import {test} from "@playwright/test";

// @todo #1:30min AppContent creates its own BrowserRouter, so the route cannot be chosen from a story
//  and every scenario lands on the gallery URL where no route matches. Extract the <Routes> tree into
//  its own component (rendered inside BrowserRouter by AppContent) and test that tree with a MemoryRouter
//  story: the landing page on "/", the private pages behind PrivateRoute, and the authorized callback.
test.fixme("app content routes visitors to the page that matches the address", () => undefined);
