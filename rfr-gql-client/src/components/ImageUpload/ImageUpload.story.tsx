import {useState} from "react";
import {ImageUpload} from ".";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface ImageUploadStoryInterface {
    buttonText?: string;
    file?: string;
    error?: boolean;
    helperText?: string;
    isAvatar?: boolean;
}

export const Static = ({buttonText = "Upload", file, error = false, helperText, isAvatar = false}: ImageUploadStoryInterface) => (
    <AppScaffold>
        <ImageUpload
            onFileUpload={() => undefined}
            buttonText={buttonText}
            file={file}
            error={error}
            helperText={helperText}
            isAvatar={isAvatar}
        />
    </AppScaffold>
);

export const Uploadable = () => {
    const [file, setFile] = useState<string>();
    return (
        <AppScaffold>
            <ImageUpload onFileUpload={setFile} buttonText="Upload new image" file={file} error={false}/>
            <Probe values={{file: file ?? ""}}/>
        </AppScaffold>
    );
};
