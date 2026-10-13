import {useState} from "react";
import {VisitedCountries} from ".";
import {Stat} from "../../types/Stat";
import {Country} from "../../types/Country";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface VisitedCountriesStoryInterface {
    stat?: Stat[];
    countries?: Country[];
    selected?: string;
}

export const Stateful = ({stat = [], countries = [], selected}: VisitedCountriesStoryInterface) => {
    const [chosen, setChosen] = useState(selected ?? "");
    return (
        <AppScaffold countries={countries}>
            <VisitedCountries stat={stat} selectedCountry={chosen || null} onSelect={setChosen}/>
            <Probe values={{chosen}}/>
        </AppScaffold>
    );
};
