import {useState} from "react";
import {PeopleTable} from ".";
import {User} from "../../types/User";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface PeopleTableStoryInterface {
    users?: User[];
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
}

export const Stateful = ({users = [], hasNextPage = false, hasPreviousPage = false}: PeopleTableStoryInterface) => {
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [submits, setSubmits] = useState(0);
    return (
        <AppScaffold>
            <PeopleTable
                data={users}
                page={page}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                setPage={setPage}
                setSearch={setSearch}
                onSearchSubmit={() => setSubmits((count) => count + 1)}
            />
            <Probe values={{page, search, submits}}/>
        </AppScaffold>
    );
};
