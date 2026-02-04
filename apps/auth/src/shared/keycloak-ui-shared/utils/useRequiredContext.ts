import type { Context } from "react";
import { useContext } from "react";
import { isDefined } from "./isDefined";

export function useRequiredContext<T>(context: Context<T>): NonNullable<T> {
    const resolved = useContext(context);

    if (isDefined(resolved)) {
        return resolved;
    }

    throw new Error(
        `No provider found for ${
            context.displayName ? `the '${context.displayName}'` : "an unknown"
        } context, make sure it is included in your component hierarchy.`
    );
}
