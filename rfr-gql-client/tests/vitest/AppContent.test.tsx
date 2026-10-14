import {test} from "vitest";

// @todo #1:30min AppContent creates its own BrowserRouter, so a test cannot choose the route and every
//  scenario lands on the Vitest runner URL where no route matches. Extract the <Routes> tree into its own
//  component (rendered inside BrowserRouter by AppContent) and test that tree inside a MemoryRouter.
test.todo("app content routes visitors to the page that matches the address");
