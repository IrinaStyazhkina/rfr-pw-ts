import {ProfileForm} from ".";
import {User} from "../../types/User";
import {Country} from "../../types/Country";
import {AppScaffold} from "../../stories/AppScaffold";

interface ProfileFormStoryInterface {
    user: User;
    countries?: Country[];
}

export const Default = ({user, countries = []}: ProfileFormStoryInterface) => (
    <AppScaffold user={user} countries={countries}>
        <ProfileForm/>
    </AppScaffold>
);
