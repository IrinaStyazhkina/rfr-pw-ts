import {useLocation} from "react-router";
import {Sidebar} from ".";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface SidebarStoryInterface {
    open?: boolean;
    route?: string;
}

const Location = () => <Probe values={{pathname: useLocation().pathname}}/>;

export const Default = ({open = true, route = "/my-travels"}: SidebarStoryInterface) => (
    <AppScaffold route={route}>
        <Sidebar sidebarState={open}/>
        <Location/>
    </AppScaffold>
);
