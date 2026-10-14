import {Route, Routes} from "react-router";
import {PrivateRoute} from ".";
import {AppScaffold} from "../../stories/AppScaffold";

export const Guarding = () => (
    <AppScaffold route="/private">
        <Routes>
            <Route element={<PrivateRoute/>}>
                <Route path="/private" element={<p>Private content</p>}/>
            </Route>
            <Route path="/" element={<p>Public landing</p>}/>
        </Routes>
    </AppScaffold>
);
