import {useState} from "react";
import {useLocation} from "react-router";
import {MenuAppBar} from ".";
import {User} from "../../types/User";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface MenuAppBarStoryInterface {
    user?: User;
    accessToken?: string;
    idToken?: string;
}

const Location = () => <Probe values={{pathname: useLocation().pathname}}/>;

const remember = (key: string, value?: string) => value ? localStorage.setItem(key, value) : localStorage.removeItem(key);

export const Stateful = ({user, accessToken, idToken}: MenuAppBarStoryInterface) => {
    // The browser context is reused between tests, so the color mode and tokens are reset to what the scenario states.
    localStorage.removeItem("mui-mode");
    remember("access_token", accessToken);
    remember("id_token", idToken);
    const [opened, setOpened] = useState(false);
    return (
        <AppScaffold user={user} route="/people">
            <MenuAppBar sidebarState={opened} handleChangeState={setOpened}/>
            <Probe values={{opened}}/>
            <Location/>
        </AppScaffold>
    );
};
