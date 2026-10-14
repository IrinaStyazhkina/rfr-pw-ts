import {useState} from "react";
import {Box} from "@mui/material";
import {AddPhotoFab} from ".";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

export const Clickable = () => {
    const [clicks, setClicks] = useState(0);
    return (
        <AppScaffold>
            <AddPhotoFab onClick={() => setClicks((count) => count + 1)}/>
            <Probe values={{clicks}}/>
        </AppScaffold>
    );
};

export const OnLongPage = () => (
    <AppScaffold>
        <Box sx={{height: 4000}}/>
        <AddPhotoFab onClick={() => undefined}/>
    </AppScaffold>
);
