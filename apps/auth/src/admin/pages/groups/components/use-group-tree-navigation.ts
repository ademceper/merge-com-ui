import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toGroups } from "@/admin/shared/lib/routes/groups";
import { useSubGroups } from "../sub-groups-context";

type TreeViewDataItem = {
    id?: string;
    name: ReactNode;
    children?: TreeViewDataItem[];
    action?: ReactNode;
    defaultExpanded?: boolean;
};

type ExtendedTreeViewDataItem = TreeViewDataItem & {
    access?: Record<string, boolean>;
};

type UseGroupTreeNavigationParams = {
    canViewDetails: boolean;
};

type UseGroupTreeNavigationReturn = {
    activeItem: ExtendedTreeViewDataItem | undefined;
    setActiveItem: (item: ExtendedTreeViewDataItem | undefined) => void;
    nav: (item: TreeViewDataItem, treeData: ExtendedTreeViewDataItem[]) => void;
    handleCollapse: (item: TreeViewDataItem) => void;
    findGroup: (
        groups: ExtendedTreeViewDataItem[],
        id: string,
        path: ExtendedTreeViewDataItem[]
    ) => ExtendedTreeViewDataItem[];
    loadingGroupId: string | undefined;
    setLoadingGroupId: (id: string | undefined) => void;
};

export function useGroupTreeNavigation({
    canViewDetails
}: UseGroupTreeNavigationParams): UseGroupTreeNavigationReturn {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { subGroups, clear, setSubGroups } = useSubGroups();

    const [activeItem, setActiveItem] = useState<ExtendedTreeViewDataItem>();
    const [loadingGroupId, setLoadingGroupId] = useState<string>();
    const navigatingToRef = useRef<string | undefined>(undefined);

    const findGroup = useCallback(
        (
            groups: ExtendedTreeViewDataItem[],
            id: string,
            path: ExtendedTreeViewDataItem[]
        ) => {
            for (let index = 0; index < groups.length; index++) {
                const group = groups[index];
                if (group.id === id) {
                    path.push(group);
                    return path;
                }

                if (group.children) {
                    path.push(group);
                    findGroup(group.children, id, path);
                    if (path[path.length - 1].id !== id) {
                        path.pop();
                    }
                }
            }
            return path;
        },
        []
    );

    const nav = useCallback(
        (item: TreeViewDataItem, treeData_: ExtendedTreeViewDataItem[]) => {
            if (item.id === "next" || item.id === "__placeholder") return;

            // Prevent duplicate navigation calls for the same item
            if (navigatingToRef.current === item.id) {
                return;
            }
            navigatingToRef.current = item.id;
            // Clear the guard after a short delay
            setTimeout(() => {
                if (navigatingToRef.current === item.id) {
                    navigatingToRef.current = undefined;
                }
            }, 100);

            const path = findGroup(treeData_, item.id ?? "", []);

            // If path is empty or invalid, don't navigate
            if (path.length === 0 || !path.at(-1)?.id) {
                return;
            }

            setActiveItem(item);
            // Show loading state immediately for the clicked group
            setLoadingGroupId(item.id ?? undefined);

            // Optimistically update breadcrumb with new path instead of clearing (prevents flickering)
            const newBreadcrumbPath = path.map(g => {
                let name: string | undefined = g.id;
                if (typeof g.name === "string") {
                    name = g.name;
                } else if (g.name && typeof g.name === "object" && "props" in g.name) {
                    // Extract from React element: <span>{name}</span>
                    const element = g.name as { props?: { children?: string } };
                    name = element.props?.children ?? g.id;
                }
                return {
                    id: g.id,
                    name: typeof name === "string" ? name : String(name || g.id),
                    access: g.access
                } as GroupRepresentation;
            });
            setSubGroups(newBreadcrumbPath);

            // Check permission using path (target group), not subGroups (old state)
            const targetGroup = path.at(-1);
            const hasPermission = canViewDetails || targetGroup?.access?.view;

            if (hasPermission) {
                navigate({
                    to: toGroups({
                        realm,
                        id: path.map(g => g.id).join("/")
                    }) as string
                });
            } else {
                toast.warning(t("noViewRights"));
                navigate({ to: toGroups({ realm }) as string });
            }
        },
        [canViewDetails, findGroup, navigate, realm, setSubGroups, t]
    );

    /** Navigate to the parent when a group is collapsed */
    const handleCollapse = useCallback(
        (item: TreeViewDataItem) => {
            if (!item.id) return;
            const idx = subGroups.findIndex(g => g.id === item.id);
            if (idx <= 0) {
                setActiveItem(undefined);
                clear();
                navigate({ to: toGroups({ realm }) as string });
                return;
            }
            const newSubGroups = subGroups.slice(0, idx);
            const parentPath = newSubGroups.map(g => g.id).join("/");
            const parentGroup = newSubGroups[newSubGroups.length - 1];
            setActiveItem({
                id: parentGroup.id,
                name: parentGroup.name
            } as ExtendedTreeViewDataItem);
            setSubGroups(newSubGroups);
            navigate({ to: toGroups({ realm, id: parentPath }) as string });
        },
        [subGroups, clear, navigate, realm, setSubGroups]
    );

    return {
        activeItem,
        setActiveItem,
        nav,
        handleCollapse,
        findGroup,
        loadingGroupId,
        setLoadingGroupId
    };
}
