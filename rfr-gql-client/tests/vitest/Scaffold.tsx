import {FC, ReactNode} from "react";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {MockedProvider} from "@apollo/client/testing/react";
import {MockLink} from "@apollo/client/testing";
import {MemoryRouter, useLocation} from "react-router";
import theme from "../../src/theme";
import {SnackBarProvider} from "../../src/context/SnackBarContext";
import {SessionContext} from "../../src/context/SessionContext";
import {CountriesContext} from "../../src/context/useCountries";
import {User} from "../../src/types/User";
import {Country} from "../../src/types/Country";

/*
 * The providers the app installs above every component, with Apollo answering
 * from in-memory mocks, so that a test renders a component exactly as the app does.
 */
interface ScaffoldInterface {
    children: ReactNode;
    mocks?: MockLink.MockedResponse[];
    route?: string;
    user?: User;
    countries?: Country[];
}

export const Scaffold: FC<ScaffoldInterface> = ({children, mocks = [], route = "/", user, countries = []}) => (
    <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline/>
        <MockedProvider mocks={mocks}>
            <SnackBarProvider>
                <MemoryRouter initialEntries={[route]}>
                    <SessionContext.Provider value={{user, updateUser: () => undefined}}>
                        <CountriesContext.Provider value={{countries}}>
                            {children}
                        </CountriesContext.Provider>
                    </SessionContext.Provider>
                </MemoryRouter>
            </SnackBarProvider>
        </MockedProvider>
    </ThemeProvider>
);

export const Pathname = () => <output data-testid="pathname">{useLocation().pathname}</output>;
