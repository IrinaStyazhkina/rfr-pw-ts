import {FC, ReactNode} from "react";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {ApolloProvider} from "@apollo/client/react";
import {MemoryRouter} from "react-router";
import theme from "../theme";
import {apiClient} from "../api/apolloClient";
import {SnackBarProvider} from "../context/SnackBarContext";
import {SessionContext} from "../context/SessionContext";
import {CountriesContext} from "../context/useCountries";
import {User} from "../types/User";
import {Country} from "../types/Country";

/*
 * The providers the app installs above every component, so that a story
 * states only its scenario: the signed-in user, the known countries and the route.
 */
interface AppScaffoldInterface {
    children: ReactNode;
    route?: string;
    user?: User;
    countries?: Country[];
}

export const AppScaffold: FC<AppScaffoldInterface> = ({children, route = "/", user, countries = []}) => (
    <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline/>
        <ApolloProvider client={apiClient}>
            <SnackBarProvider>
                <MemoryRouter initialEntries={[route]}>
                    <SessionContext.Provider value={{user, updateUser: () => undefined}}>
                        <CountriesContext.Provider value={{countries}}>
                            {children}
                        </CountriesContext.Provider>
                    </SessionContext.Provider>
                </MemoryRouter>
            </SnackBarProvider>
        </ApolloProvider>
    </ThemeProvider>
);
