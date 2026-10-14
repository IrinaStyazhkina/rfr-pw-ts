import {useState} from "react";
import {PhotoModal} from ".";
import {formInitialState} from "./formValidate";
import {Country} from "../../types/Country";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface PhotoModalStoryInterface {
    isEdit?: boolean;
    photoId?: string;
    src?: string;
    description?: string;
    country?: string;
    countries?: Country[];
}

export const Stateful = ({isEdit = false, photoId, src, description = "", country = "ru", countries = []}: PhotoModalStoryInterface) => {
    const [visible, setVisible] = useState(true);
    const [closes, setCloses] = useState(0);
    const formData = {
        ...formInitialState,
        id: photoId,
        src: {...formInitialState.src, value: src},
        description: {...formInitialState.description, value: description},
        country: {...formInitialState.country, value: country},
    };
    const [modalState] = useState({formData, photoId: photoId ?? null});
    return (
        <AppScaffold countries={countries}>
            <PhotoModal
                modalState={{...modalState, isVisible: visible}}
                onClose={() => {
                    setVisible(false);
                    setCloses((count) => count + 1);
                }}
                isEdit={isEdit}
            />
            <Probe values={{closes}}/>
        </AppScaffold>
    );
};
