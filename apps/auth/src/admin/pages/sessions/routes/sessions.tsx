import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type SessionsParams = { realm: string };

const toSessions = (params: SessionsParams): string =>
    generateEncodedPath("/:realm/sessions", params);
