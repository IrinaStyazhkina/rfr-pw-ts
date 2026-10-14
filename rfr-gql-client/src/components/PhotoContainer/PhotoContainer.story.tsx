import {useState} from "react";
import {PhotoContainer} from ".";
import {Photo} from "../../types/Photo";
import {Country} from "../../types/Country";
import {DialogProvider} from "../../context/DialogContext";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface PhotoContainerStoryInterface {
    photos?: Photo[];
    countries?: Country[];
    hasNextPage?: boolean;
    loading?: boolean;
    loadingMore?: boolean;
    refreshing?: boolean;
    filterCountryName?: string;
}

export const Stateful = ({
                             photos = [],
                             countries = [],
                             hasNextPage = false,
                             loading = false,
                             loadingMore = false,
                             refreshing = false,
                             filterCountryName,
                         }: PhotoContainerStoryInterface) => {
    const [adds, setAdds] = useState(0);
    const [resets, setResets] = useState(0);
    const [loads, setLoads] = useState(0);
    return (
        <AppScaffold countries={countries}>
            <DialogProvider>
                <PhotoContainer
                    data={photos}
                    hasNextPage={hasNextPage}
                    loadMore={() => setLoads((count) => count + 1)}
                    loading={loading}
                    loadingMore={loadingMore}
                    refreshing={refreshing}
                    withFriends={false}
                    onAddClick={() => setAdds((count) => count + 1)}
                    filterCountryName={filterCountryName}
                    onResetFilter={() => setResets((count) => count + 1)}
                />
            </DialogProvider>
            <Probe values={{adds, resets, loads}}/>
        </AppScaffold>
    );
};
