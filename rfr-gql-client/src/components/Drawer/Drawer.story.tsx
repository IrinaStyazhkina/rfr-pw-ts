import {Drawer} from ".";
import {AppScaffold} from "../../stories/AppScaffold";

export const Opened = () => (
    <AppScaffold>
        <Drawer variant="permanent" open>Navigation</Drawer>
    </AppScaffold>
);

export const Closed = () => (
    <AppScaffold>
        <Drawer variant="permanent" open={false}>Navigation</Drawer>
    </AppScaffold>
);
