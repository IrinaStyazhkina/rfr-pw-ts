import {useState} from "react";
import {WorldMap} from ".";
import {Stat} from "../../types/Stat";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface WorldMapStoryInterface {
    stat?: Stat[];
    selected?: string;
}

export const Stateful = ({stat = [], selected}: WorldMapStoryInterface) => {
    const [clicked, setClicked] = useState("");
    return (
        <AppScaffold>
            <WorldMap data={stat} selectedCountry={selected} onCountryClick={setClicked}/>
            <Probe values={{clicked}}/>
        </AppScaffold>
    );
};
