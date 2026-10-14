import {useState} from "react";
import {TableToolbar} from ".";
import {AppScaffold} from "../../../stories/AppScaffold";
import {Probe} from "../../../stories/Probe";

export const Searchable = () => {
    const [search, setSearch] = useState("");
    const [submits, setSubmits] = useState(0);
    return (
        <AppScaffold>
            <TableToolbar setSearch={setSearch} onSearchSubmit={() => setSubmits((count) => count + 1)}/>
            <Probe values={{search, submits}}/>
        </AppScaffold>
    );
};
