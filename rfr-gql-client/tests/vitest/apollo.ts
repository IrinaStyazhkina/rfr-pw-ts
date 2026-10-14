import {ApolloLink, DocumentNode} from "@apollo/client";
import {MockLink} from "@apollo/client/testing";

type Answer = ApolloLink.Result | ((variables: Record<string, unknown>) => ApolloLink.Result);

// Any variables match and every answer repeats, because tests assert on what was sent rather than on mock bookkeeping.
export const answer = (query: DocumentNode, result: Answer, delay?: number): MockLink.MockedResponse => ({
    request: {query, variables: () => true},
    result,
    delay,
    maxUsageCount: Number.POSITIVE_INFINITY,
});

export const recording = (query: DocumentNode, result: ApolloLink.Result, sent: Record<string, unknown>[]) =>
    answer(query, (variables) => {
        sent.push(variables);
        return result;
    });

export const failure = (message: string, classification = "INTERNAL_ERROR") => ({
    errors: [{message, extensions: {classification}}],
});
