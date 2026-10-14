import {useState} from "react";
import {PhotoCard} from ".";
import {Photo} from "../../types/Photo";
import {User} from "../../types/User";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface PhotoCardStoryInterface {
    photo: Photo;
    user?: User;
}

export const Stateful = ({photo, user}: PhotoCardStoryInterface) => {
    const [edited, setEdited] = useState("");
    return (
        <AppScaffold user={user}>
            <PhotoCard photo={photo} onEditClick={(picked) => setEdited(picked.id)}/>
            <Probe values={{edited}}/>
        </AppScaffold>
    );
};
