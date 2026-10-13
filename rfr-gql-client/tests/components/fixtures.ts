import {randomUUID} from "node:crypto";
import type {User} from "../../src/types/User";

const FLAG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'/%3E";
const PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='30'/%3E";

export const word = () => randomUUID().slice(0, 8);

let sequence = Math.floor(Math.random() * 676);

// Consecutive codes never repeat within a test, because components key rows and look countries up by code.
const code = () => {
    sequence = (sequence + 1) % 676;
    return String.fromCharCode(97 + Math.floor(sequence / 26), 97 + sequence % 26);
};

export const country = () => ({
    __typename: "Country",
    code: code(),
    name: `Land ${word()}`,
    flag: FLAG,
});

// The API answers NOT_FRIEND for strangers, while the client User type has no such member, hence the cast.
export const person = (friendStatus = "NOT_FRIEND" as User["friendStatus"]): User & {__typename: string, firstname: string, surname: string} => ({
    __typename: "User",
    id: randomUUID(),
    username: `user-${word()}`,
    firstname: `Name${word()}`,
    surname: `Surname${word()}`,
    avatar: "",
    location: country(),
    friendStatus,
});

export const photo = (isOwner: boolean, likers: string[] = []) => ({
    __typename: "Photo",
    id: randomUUID(),
    src: PHOTO,
    country: country(),
    description: `Sunset over ${word()}`,
    isOwner,
    likes: {__typename: "Likes", total: likers.length, likes: likers.map((user) => ({__typename: "Like", user}))},
});

export const connection = (nodes: object[], hasNextPage = false, hasPreviousPage = false) => ({
    __typename: "UserConnection",
    edges: nodes.map((node) => ({__typename: "UserEdge", node})),
    pageInfo: {__typename: "PageInfo", hasNextPage, hasPreviousPage},
});

export const failure = (message: string, classification = "INTERNAL_ERROR") => ({
    errors: [{message, extensions: {classification}}],
});
