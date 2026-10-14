import {ActionButtons} from ".";
import {AppScaffold} from "../../../stories/AppScaffold";

interface ActionButtonsStoryInterface {
    userId?: string;
    friendStatus?: "NOT_FRIEND" | "FRIEND" | "INVITATION_SENT" | "INVITATION_RECEIVED";
}

export const Default = ({userId = "user", friendStatus}: ActionButtonsStoryInterface) => (
    <AppScaffold>
        <ActionButtons userId={userId} friendStatus={friendStatus}/>
    </AppScaffold>
);
