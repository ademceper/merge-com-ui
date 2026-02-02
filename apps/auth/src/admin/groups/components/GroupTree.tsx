/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/groups/components/GroupTree.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
    PaginatingTableToolbar,
    useAlerts,
    useFetch,
    AlertVariant
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Checkbox } from "@merge/ui/components/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Separator } from "@merge/ui/components/separator";
import { Spinner } from "@merge/ui/components/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@merge/ui/components/tooltip";
import { CaretRight, DotsThreeVertical } from "@phosphor-icons/react";
import { unionBy } from "lodash-es";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

export type TreeViewDataItem = {
    id?: string;
    name: ReactNode;
    children?: TreeViewDataItem[];
    action?: ReactNode;
    defaultExpanded?: boolean;
};
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useAccess } from "../../context/access/Access";
import { fetchAdminUI } from "../../context/auth/admin-ui-endpoint";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { GroupsModal } from "../GroupsModal";
import { useSubGroups } from "../SubGroupsContext";
import { toGroups } from "../routes/Groups";
import { DeleteGroup } from "./DeleteGroup";
import { MoveDialog } from "./MoveDialog";


type ExtendedTreeViewDataItem = TreeViewDataItem & {
    access?: Record<string, boolean>;
};

type GroupTreeContextMenuProps = {
    group: GroupRepresentation;
    refresh: () => void;
};

export function countGroups(groups: GroupRepresentation[]) {
    let count = groups.length;
    for (const group of groups) {
        if (group.subGroups) {
            count += countGroups(group.subGroups);
        }
    }
    return count;
}

const GroupTreeContextMenu = ({ group, refresh }: GroupTreeContextMenuProps) => {
    const { t } = useTranslation();

    const [isOpen, toggleOpen] = useToggle();
    const [renameOpen, toggleRenameOpen] = useToggle();
    const [createOpen, toggleCreateOpen] = useToggle();
    const [moveOpen, toggleMoveOpen] = useToggle();
    const [deleteOpen, toggleDeleteOpen] = useToggle();
    const navigate = useNavigate();
    const { realm } = useRealm();

    return (
        <>
            {renameOpen && (
                <GroupsModal
                    id={group.id}
                    rename={group}
                    refresh={() => {
                        navigate(toGroups({ realm }));
                        refresh();
                    }}
                    handleModalToggle={toggleRenameOpen}
                />
            )}
            {createOpen && (
                <GroupsModal
                    id={group.id}
                    handleModalToggle={toggleCreateOpen}
                    refresh={refresh}
                />
            )}
            {moveOpen && (
                <MoveDialog source={group} refresh={refresh} onClose={toggleMoveOpen} />
            )}
            <DeleteGroup
                show={deleteOpen}
                toggleDialog={toggleDeleteOpen}
                selectedRows={[group]}
                refresh={() => {
                    navigate(toGroups({ realm }));
                    refresh();
                }}
            />
            <DropdownMenu open={isOpen} onOpenChange={toggleOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                        <DotsThreeVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleRenameOpen}>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleMoveOpen}>{t("moveTo")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleCreateOpen}>{t("createChildGroup")}</DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem onClick={toggleDeleteOpen}>{t("delete")}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

type GroupTreeProps = {
    refresh: () => void;
    canViewDetails: boolean;
};

const SUBGROUP_COUNT = 50;

type SimpleTreeViewProps = {
    data: ExtendedTreeViewDataItem[];
    allExpanded: boolean;
    activeItems?: ExtendedTreeViewDataItem[];
    onExpand: (_e: unknown, item: ExtendedTreeViewDataItem) => void;
    onSelect: (_e: unknown, item: ExtendedTreeViewDataItem) => void;
};

function SimpleTreeView({ data, allExpanded, activeItems = [], onExpand, onSelect }: SimpleTreeViewProps) {
    const [expanded, setExpanded] = useState<Set<string>>(() =>
        new Set(data.filter(i => i.defaultExpanded && i.id).map(i => i.id!))
    );
    const isExpanded = (id: string | undefined) => id && (allExpanded || expanded.has(id));
    const toggle = (id: string | undefined) => {
        if (!id) return;
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const renderItem = (item: ExtendedTreeViewDataItem, depth: number) => {
        const hasChildren = item.children && item.children.length > 0;
        const expanded_ = isExpanded(item.id);
        const active = activeItems.some(a => a.id === item.id);

        return (
            <div key={item.id ?? `depth-${depth}`} className="keycloak_groups_treeview">
                <div
                    className={`flex items-center gap-1 py-1 px-2 border-l-2 border-transparent hover:bg-muted/50 cursor-pointer min-h-8 ${active ? "border-primary bg-muted/50" : ""}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        if (item.id === "next") return;
                        if (hasChildren && item.id) toggle(item.id);
                        onExpand(null as unknown, item);
                        onSelect(null as unknown, item);
                    }}
                >
                    <span className="w-5 flex items-center justify-center shrink-0">
                        {hasChildren ? (
                            <button
                                type="button"
                                className="p-0 border-0 bg-transparent cursor-pointer inline-flex"
                                onClick={e => {
                                    e.stopPropagation();
                                    if (item.id) toggle(item.id);
                                }}
                                aria-expanded={expanded_}
                            >
                                <CaretRight className={`size-4 transition-transform ${expanded_ ? "rotate-90" : ""}`} />
                            </button>
                        ) : null}
                    </span>
                    <span className="flex-1 min-w-0 truncate">{item.name}</span>
                    {item.action ? <span onClick={e => e.stopPropagation()}>{item.action}</span> : null}
                </div>
                {hasChildren && expanded_ && (
                    <div>
                        {item.children!.map((child, i) => renderItem(child as ExtendedTreeViewDataItem, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-md border">
            {data.map((item, i) => renderItem(item, 0))}
        </div>
    );
}

const TreeLoading = () => {
    const { t } = useTranslation();
    return (
        <span className="flex items-center gap-2">
            <Spinner className="size-4" /> {t("spinnerLoading")}
        </span>
    );
};

const LOADING_TREE = [
    {
        name: <TreeLoading />
    }
];

export const GroupTree = ({ refresh: viewRefresh, canViewDetails }: GroupTreeProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { realm } = useRealm();
    const navigate = useNavigate();
    const { addAlert } = useAlerts();
    const { hasAccess } = useAccess();

    const [data, setData] = useState<ExtendedTreeViewDataItem[]>();
    const { subGroups, clear } = useSubGroups();

    const [search, setSearch] = useState("");
    const [max, setMax] = useState(20);
    const [first, setFirst] = useState(0);
    const prefFirst = useRef(0);
    const prefMax = useRef(20);
    const [count, setCount] = useState(0);
    const [exact, setExact] = useState(false);
    const [activeItem, setActiveItem] = useState<ExtendedTreeViewDataItem>();

    const [firstSub, setFirstSub] = useState(0);

    const [key, setKey] = useState(0);
    const refresh = () => {
        setKey(key + 1);
        viewRefresh();
    };

    const mapGroup = (
        group: GroupRepresentation,
        refresh: () => void
    ): ExtendedTreeViewDataItem => {
        const hasSubGroups = group.subGroupCount;
        return {
            id: group.id,
            name: (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-default">{group.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>{group.name}</TooltipContent>
                </Tooltip>
            ),
            access: group.access || {},
            children: hasSubGroups
                ? search.length === 0
                    ? LOADING_TREE
                    : group.subGroups?.map(g => mapGroup(g, refresh))
                : undefined,
            action: (hasAccess("manage-users") || group.access?.manage) && (
                <GroupTreeContextMenu group={group} refresh={refresh} />
            ),
            defaultExpanded: subGroups.map(g => g.id).includes(group.id)
        };
    };

    useFetch(
        async () => {
            const groups = await fetchAdminUI<GroupRepresentation[]>(
                adminClient,
                "groups",
                Object.assign(
                    {
                        first: `${first}`,
                        max: `${max + 1}`,
                        exact: `${exact}`,
                        global: `${search !== ""}`
                    },
                    search === "" ? null : { search }
                )
            );
            let subGroups: GroupRepresentation[] = [];
            if (activeItem) {
                subGroups = await fetchAdminUI<GroupRepresentation[]>(
                    adminClient,
                    `groups/${activeItem.id}/children`,
                    {
                        first: `${firstSub}`,
                        max: `${SUBGROUP_COUNT}`
                    }
                );
            }
            return { groups, subGroups };
        },
        ({ groups, subGroups }) => {
            if (activeItem) {
                const found = findGroup(data || [], activeItem.id!, []);
                if (found.length && subGroups.length) {
                    const foundTreeItem = found.pop()!;
                    foundTreeItem.children = [
                        ...(unionBy(foundTreeItem.children || []).splice(
                            0,
                            SUBGROUP_COUNT
                        ),
                        subGroups.map(g => mapGroup(g, refresh), "id")),
                        ...(subGroups.length === SUBGROUP_COUNT
                            ? [
                                  {
                                      id: "next",
                                      name: (
                                          <Button
                                              variant="plain"
                                              onClick={() =>
                                                  setFirstSub(firstSub + SUBGROUP_COUNT)
                                              }
                                          >
                                              <AngleRightIcon />
                                          </Button>
                                      )
                                  }
                              ]
                            : [])
                    ];
                }
            }
            if (search || prefFirst.current !== first || prefMax.current !== max) {
                setData(groups.map(g => mapGroup(g, refresh)));
            } else {
                setData(
                    unionBy(
                        data,
                        groups.map(g => mapGroup(g, refresh)),
                        "id"
                    )
                );
            }
            setCount(countGroups(groups));
            prefFirst.current = first;
            prefMax.current = max;
        },
        [key, first, firstSub, max, search, exact, activeItem]
    );

    const findGroup = (
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
    };

    const nav = (item: TreeViewDataItem, data: ExtendedTreeViewDataItem[]) => {
        if (item.id === "next") return;
        setActiveItem(item);

        const path = findGroup(data, item.id!, []);
        if (!subGroups.every(({ id }) => path.find(t => t.id === id))) clear();
        if (
            canViewDetails ||
            path.at(-1)?.access?.view ||
            subGroups.at(-1)?.access?.view
        ) {
            navigate(
                toGroups({
                    realm,
                    id: path.map(g => g.id).join("/")
                })
            );
        } else {
            addAlert(t("noViewRights"), AlertVariant.warning);
            navigate(toGroups({ realm }));
        }
    };

    return data ? (
        <PaginatingTableToolbar
            count={count}
            first={first}
            max={max}
            onNextClick={setFirst}
            onPreviousClick={setFirst}
            onPerPageSelect={(first, max) => {
                setFirst(first);
                setMax(max);
            }}
            inputGroupName="searchForGroups"
            inputGroupPlaceholder={t("searchForGroups")}
            inputGroupOnEnter={setSearch}
            toolbarItem={
                <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                        id="exact"
                        data-testid="exact-search"
                        checked={exact}
                        onCheckedChange={(checked) => setExact(checked === true)}
                        className="mr-1"
                    />
                    <label htmlFor="exact" className="text-sm cursor-pointer pl-1">
                        {t("exactSearch")}
                    </label>
                </div>
            }
        >
            {data.length > 0 && (
                <SimpleTreeView
                    data={data.slice(0, max)}
                    allExpanded={search.length > 0}
                    activeItems={activeItem ? [activeItem] : undefined}
                    onExpand={(_, item) => nav(item, data)}
                    onSelect={(_, item) => nav(item, data)}
                />
            )}
        </PaginatingTableToolbar>
    ) : (
        <KeycloakSpinner />
    );
};
