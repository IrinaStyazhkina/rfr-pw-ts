import {useState} from "react";
import {Toggle} from ".";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface ToggleStoryInterface {
    withFriends?: boolean;
}

export const Stateful = ({withFriends = false}: ToggleStoryInterface) => {
    const [withMyFriends, setWithMyFriends] = useState(withFriends);
    return (
        <AppScaffold>
            <Toggle withMyFriends={withMyFriends} setWithMyFriends={setWithMyFriends}/>
            <Probe values={{withMyFriends}}/>
        </AppScaffold>
    );
};
