import {useState} from "react";
import {CombinedGraphQLErrors} from "@apollo/client";
import {QueryErrorAlert} from ".";
import {AppScaffold} from "../../stories/AppScaffold";
import {Probe} from "../../stories/Probe";

interface FailedStoryInterface {
    message?: string;
    classification?: string;
    fallback?: string;
}

const failure = (message: string, classification: string) =>
    new CombinedGraphQLErrors({errors: [{message, extensions: {classification}}]});

export const WithoutError = () => (
    <AppScaffold>
        <QueryErrorAlert onRetry={() => undefined}/>
    </AppScaffold>
);

export const Failed = ({message = "Boom", classification = "INTERNAL_ERROR", fallback}: FailedStoryInterface) => (
    <AppScaffold>
        <QueryErrorAlert error={failure(message, classification)} fallback={fallback}/>
    </AppScaffold>
);

export const Retryable = () => {
    const [retries, setRetries] = useState(0);
    return (
        <AppScaffold>
            <QueryErrorAlert error={failure("Boom", "INTERNAL_ERROR")} onRetry={() => setRetries((count) => count + 1)}/>
            <Probe values={{retries}}/>
        </AppScaffold>
    );
};
