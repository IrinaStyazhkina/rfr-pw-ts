import {useLocation} from "react-router";
import {List} from "@mui/material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import {SidebarItem} from ".";
import {AppScaffold} from "../../../stories/AppScaffold";
import {Probe} from "../../../stories/Probe";

interface SidebarItemStoryInterface {
    name?: string;
    link?: string;
    route?: string;
    open?: boolean;
}

const Location = () => <Probe values={{pathname: useLocation().pathname}}/>;

export const Default = ({name = "My map", link = "/my-travels", route = "/", open = true}: SidebarItemStoryInterface) => (
    <AppScaffold route={route}>
        <List>
            <SidebarItem name={name} link={link} icon={<PublicRoundedIcon/>} sidebarState={open}/>
        </List>
        <Location/>
    </AppScaffold>
);
