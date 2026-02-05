import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { PropsWithChildren, useState, useCallback, useMemo } from "react";
import { createNamedContext, useRequiredContext } from "../../shared/keycloak-ui-shared";

type SubGroupsProps = {
    subGroups: GroupRepresentation[];
    setSubGroups: (group: GroupRepresentation[]) => void;
    clear: () => void;
    remove: (group: GroupRepresentation) => void;
    currentGroup: () => GroupRepresentation | undefined;
};

const SubGroupsContext = createNamedContext<SubGroupsProps | undefined>(
    "SubGroupsContext",
    undefined
);

export const SubGroups = ({ children }: PropsWithChildren) => {
    const [subGroups, setSubGroups] = useState<GroupRepresentation[]>([]);

    const clear = useCallback(() => setSubGroups([]), []);

    const remove = useCallback((group: GroupRepresentation) => {
        setSubGroups(current =>
            current.slice(0, current.findIndex(g => g.id === group.id) + 1)
        );
    }, []);

    const currentGroup = useCallback(() => subGroups[subGroups.length - 1], [subGroups]);

    const value = useMemo(
        () => ({ subGroups, setSubGroups, clear, remove, currentGroup }),
        [subGroups, clear, remove, currentGroup]
    );

    return (
        <SubGroupsContext.Provider value={value}>
            {children}
        </SubGroupsContext.Provider>
    );
};

export const useSubGroups = () => useRequiredContext(SubGroupsContext);
