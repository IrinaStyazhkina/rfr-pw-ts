import {Box} from "@mui/material";
import {CollapsibleMapCard} from ".";
import {AppScaffold} from "../../stories/AppScaffold";

const STORAGE_KEY = "rangiffler-map-collapsed";

export const Expanded = () => {
    localStorage.removeItem(STORAGE_KEY);
    return (
        <AppScaffold>
            <CollapsibleMapCard>
                <Box sx={{height: 640}}>Map of visited countries</Box>
            </CollapsibleMapCard>
        </AppScaffold>
    );
};

export const RememberedCollapsed = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    return (
        <AppScaffold>
            <CollapsibleMapCard>
                <Box sx={{height: 640}}>Map of visited countries</Box>
            </CollapsibleMapCard>
        </AppScaffold>
    );
};
