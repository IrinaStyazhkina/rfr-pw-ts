import {TabPanel} from ".";
import {AppScaffold} from "../../stories/AppScaffold";

interface TabPanelStoryInterface {
    value?: string;
    content?: string;
}

export const Default = ({value = "all", content = "Everyone"}: TabPanelStoryInterface) => (
    <AppScaffold>
        <TabPanel value={value}>{content}</TabPanel>
    </AppScaffold>
);
