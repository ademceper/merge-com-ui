import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Input } from "@merge-rd/ui/components/input";
import { Separator } from "@merge-rd/ui/components/separator";
import { Spinner } from "@merge-rd/ui/components/spinner";
import { cn } from "@merge-rd/ui/lib/utils";
import {
    CaretRight,
    DotsThreeVertical,
    MagnifyingGlass,
    XCircle
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { unionBy } from "lodash-es";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toGroups } from "@/admin/shared/lib/routes/groups";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useGroupTree } from "../hooks/use-group-tree";
import { GroupsModal } from "../groups-modal";
import { MoveDialog } from "../move-dialog";
import { useSubGroups } from "../sub-groups-context";
import { DeleteGroup } from "./delete-group";
import { useGroupTreeNavigation } from "./use-group-tree-navigation";
import { SUBGROUP_COUNT, useGroupTreePagination } from "./use-group-tree-pagination";
import { useGroupTreeSearch } from "./use-group-tree-search";

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

type GroupTreeContextMenuProps = {
    group: GroupRepresentation;
    refresh: () => void;
};

function countGroups(groups: GroupRepresentation[]) {
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
                        navigate({ to: toGroups({ realm }) as string });
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
                    navigate({ to: toGroups({ realm }) as string });
                    refresh();
                }}
            />
            <DropdownMenu open={isOpen} onOpenChange={toggleOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                        <DotsThreeVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="z-[100]"
                    sideOffset={5}
                    collisionPadding={10}
                >
                    <DropdownMenuItem onClick={toggleRenameOpen}>
                        {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleMoveOpen}>
                        {t("moveTo")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleCreateOpen}>
                        {t("createChildGroup")}
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem onClick={toggleDeleteOpen}>
                        {t("delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

type GroupTreeProps = {
    refresh: () => void;
    canViewDetails: boolean;
};

type SimpleTreeViewProps = {
    data: ExtendedTreeViewDataItem[];
    allExpanded: boolean;
    activeItems?: ExtendedTreeViewDataItem[];
    onExpand: (_e: unknown, item: ExtendedTreeViewDataItem) => void;
    onSelect: (_e: unknown, item: ExtendedTreeViewDataItem) => void;
    onCollapse?: (item: ExtendedTreeViewDataItem) => void;
};

/** Placeholder dışında en az bir child varsa düğümün gerçekten açılmış sayılır (yenilemede boş açık kalmasın). */
function hasRealChildren(item: ExtendedTreeViewDataItem) {
    return item.children?.some(c => c.id !== "__placeholder") ?? false;
}

/** Path'teki (defaultExpanded) ve gerçek children'ı olan düğüm id'lerini toplar (recursive). */
function pathIdsToExpand(items: ExtendedTreeViewDataItem[]): Set<string> {
    const ids = new Set<string>();
    for (const item of items) {
        if (item.id && item.defaultExpanded && hasRealChildren(item)) ids.add(item.id);
        if (item.children?.length)
            pathIdsToExpand(item.children as ExtendedTreeViewDataItem[]).forEach(id =>
                ids.add(id)
            );
    }
    return ids;
}

function SimpleTreeView({
    data,
    allExpanded,
    activeItems = [],
    onExpand,
    onSelect,
    onCollapse
}: SimpleTreeViewProps) {
    const [expanded, setExpanded] = useState<Set<string>>(
        () =>
            new Set(
                data
                    .filter(i => i.defaultExpanded && i.id && hasRealChildren(i))
                    .map(i => i.id as string)
            )
    );

    // Path restore: sadece henüz eklenmemiş path düğümlerini aç (kullanıcı kapattıysa tekrar açma)
    const pathRestoredIdsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const toExpand = pathIdsToExpand(data);
        setExpanded(prev => {
            let next = prev;
            for (const id of toExpand) {
                if (pathRestoredIdsRef.current.has(id)) continue;
                pathRestoredIdsRef.current.add(id);
                if (!next.has(id)) {
                    next = next === prev ? new Set(prev) : next;
                    next.add(id);
                }
            }
            return next;
        });
    }, [data]);
    const isExpanded = (id: string | undefined) =>
        id && (allExpanded || expanded.has(id));
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
                    className={`flex items-center gap-1 py-2 px-2 border-l-2 border-transparent hover:bg-muted/50 cursor-pointer ${active ? "border-primary bg-muted/50" : ""}`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={e => {
                        e.stopPropagation();
                        if (item.id === "next") return;
                        const wasExpanded = expanded_;

                        // Only collapse if the item is both expanded AND active
                        // If it's expanded but not active, navigate to it instead
                        if (hasChildren && wasExpanded && active) {
                            if (item.id) toggle(item.id);
                            onCollapse?.(item);
                        } else {
                            if (hasChildren && item.id) toggle(item.id);
                            onExpand(null as unknown, item);
                            onSelect(null as unknown, item);
                        }
                    }}
                >
                    <span className="w-5 flex items-center justify-center shrink-0">
                        {hasChildren ? (
                            <button
                                type="button"
                                className="p-0 border-0 bg-transparent cursor-pointer inline-flex"
                                onClick={e => {
                                    e.stopPropagation();
                                    if (item.id) {
                                        const wasExpanded = expanded_;
                                        toggle(item.id);
                                        if (wasExpanded) onCollapse?.(item);
                                    }
                                }}
                                aria-expanded={!!expanded_}
                            >
                                <CaretRight
                                    className={`size-4 transition-transform ${expanded_ ? "rotate-90" : ""}`}
                                />
                            </button>
                        ) : null}
                    </span>
                    <span className="flex-1 min-w-0 truncate">{item.name}</span>
                    {item.action ? (
                        <span onClick={e => e.stopPropagation()}>{item.action}</span>
                    ) : null}
                </div>
                {hasChildren && expanded_ && item.children && (
                    <div>
                        {item.children.map((child, _i) =>
                            renderItem(child as ExtendedTreeViewDataItem, depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-md border">
            {data.map((item, _i) => renderItem(item, 0))}
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

/** Chevron görünsün diye tek placeholder; tıklanınca yükleme tetiklenir, gerçek veriyle değişir. */
const CHEVRON_PLACEHOLDER: ExtendedTreeViewDataItem[] = [
    { id: "__placeholder", name: "\u00A0" }
];

export const GroupTree = ({ refresh: viewRefresh, canViewDetails }: GroupTreeProps) => {
    const { t } = useTranslation();
    const { hasAccess: _hasAccess } = useAccess();
    const { subGroups } = useSubGroups();

    const [data, setData] = useState<ExtendedTreeViewDataItem[]>();
    const [count, setCount] = useState(0);

    // --- Custom hooks ---
    const { search, searchInput, setSearchInput, clearSearch, inputRef } =
        useGroupTreeSearch();

    const {
        activeItem,
        setActiveItem,
        nav,
        handleCollapse,
        findGroup,
        loadingGroupId,
        setLoadingGroupId
    } = useGroupTreeNavigation({ canViewDetails });

    const {
        first,
        setFirst,
        max,
        firstSub,
        setFirstSub,
        prefFirst,
        prefMax,
        getPageInfo
    } = useGroupTreePagination();

    /** URL path'ini sırayla yüklerken hangi segmentte olduğumuz (restore path after refresh). */
    const pathIndexRef = useRef(0);
    const pathKeyRef = useRef<string>("");

    const [key, setKey] = useState(0);
    const refresh = () => {
        setKey(key + 1);
        viewRefresh();
    };

    const updateChildrenAtId = (
        nodes: ExtendedTreeViewDataItem[],
        id: string,
        newChildren: ExtendedTreeViewDataItem[]
    ): ExtendedTreeViewDataItem[] =>
        nodes.map(node => {
            if (node.id === id) return { ...node, children: newChildren };
            if (node.children?.length)
                return {
                    ...node,
                    children: updateChildrenAtId(node.children, id, newChildren)
                };
            return node;
        });

    const mapGroup = (
        group: GroupRepresentation,
        refresh: () => void
    ): ExtendedTreeViewDataItem => {
        const hasSubGroups = group.subGroupCount;
        const isThisGroupLoading = loadingGroupId === group.id;
        return {
            id: group.id,
            name: <span className="cursor-default">{group.name}</span>,
            access: group.access || {},
            children: hasSubGroups
                ? search.length === 0
                    ? isThisGroupLoading
                        ? LOADING_TREE
                        : CHEVRON_PLACEHOLDER
                    : group.subGroups?.map(g => mapGroup(g, refresh))
                : undefined,
            action: undefined,
            defaultExpanded: subGroups.map(g => g.id).includes(group.id)
        };
    };

    const { data: treeData } = useGroupTree({
        first,
        max,
        search,
        activeItemId: activeItem?.id,
        firstSub,
        subGroupCount: SUBGROUP_COUNT
    });

    useEffect(() => {
        if (!treeData) return;
        const { groups, subGroups: fetchedSubGroups } = treeData;

        let newData: ExtendedTreeViewDataItem[];
        if (search || prefFirst.current !== first || prefMax.current !== max) {
            newData = groups.map(g => mapGroup(g, refresh));
        } else {
            newData = unionBy(
                data || [],
                groups.map(g => mapGroup(g, refresh)),
                "id"
            );
        }
        if (activeItem && fetchedSubGroups.length > 0) {
            const path = findGroup(newData, activeItem.id ?? "", []);
            const foundTreeItem = path[path.length - 1];
            const currentChildren = foundTreeItem?.children || [];
            const existing = unionBy(currentChildren, "id")
                .filter(
                    (c: ExtendedTreeViewDataItem) =>
                        c.id !== "next" && c.id !== "__placeholder"
                )
                .slice(0, SUBGROUP_COUNT);
            const mapped = fetchedSubGroups.map(g => mapGroup(g, refresh));
            const mergedChildren = unionBy(existing, mapped, "id");
            const newChildren: ExtendedTreeViewDataItem[] = [
                ...mergedChildren,
                ...(fetchedSubGroups.length === SUBGROUP_COUNT
                    ? [
                          {
                              id: "next",
                              name: (
                                  <Button
                                      variant="ghost"
                                      onClick={() =>
                                          setFirstSub(firstSub + SUBGROUP_COUNT)
                                      }
                                  >
                                      <CaretRight className="size-4" />
                                  </Button>
                              )
                          } as ExtendedTreeViewDataItem
                      ]
                    : [])
            ];
            newData = updateChildrenAtId(newData, activeItem.id ?? "", newChildren);
        }
        // Clear loading state after data is loaded (whether subgroups exist or not)
        if (activeItem && loadingGroupId === activeItem.id) {
            setLoadingGroupId(undefined);
        }
        setCount(countGroups(groups));
        prefFirst.current = first;
        prefMax.current = max;
        setData(newData);

        // URL path restore: bu segment yüklendi, sıradaki varsa onu yükle
        const pathFromUrl = subGroups;
        if (
            pathFromUrl.length > 0 &&
            activeItem?.id === pathFromUrl[pathIndexRef.current]?.id &&
            pathIndexRef.current < pathFromUrl.length - 1
        ) {
            pathIndexRef.current += 1;
            setActiveItem({
                id: pathFromUrl[pathIndexRef.current].id,
                name: pathFromUrl[pathIndexRef.current].name
            } as ExtendedTreeViewDataItem);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [treeData]);

    // URL'de path varken sayfa yenilendiğinde path'i sırayla yükle; tıklayınca zaten nav() set ediyor, tekrar set etme (takılma önlenir)
    const pathKey = subGroups.map(g => g.id).join("/");
    useEffect(() => {
        if (subGroups.length === 0) return;
        if (pathKey === pathKeyRef.current) return;
        if (activeItem?.id === subGroups[0].id) return;
        pathKeyRef.current = pathKey;
        pathIndexRef.current = 0;
        setActiveItem({
            id: subGroups[0].id,
            name: subGroups[0].name
        } as ExtendedTreeViewDataItem);
    }, [pathKey, subGroups, activeItem?.id, setActiveItem]);

    const { pageCount, currentPage, from, to } = getPageInfo(count);

    return data ? (
        <div className="flex flex-col gap-3">
            <div className="relative min-w-0 flex-1 sm:min-w-0 sm:flex-initial">
                <Input
                    ref={inputRef}
                    data-testid="searchForGroups"
                    aria-label={t("searchForGroups")}
                    placeholder={t("searchForGroups")}
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className={cn(
                        "peer h-9 min-w-0 flex-1 ps-9 sm:min-w-60",
                        searchInput && "pe-9"
                    )}
                />
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80">
                    <MagnifyingGlass size={16} />
                </span>
                {searchInput && (
                    <button
                        type="button"
                        aria-label={t("clear")}
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none hover:text-foreground focus-visible:ring-2"
                        onClick={clearSearch}
                    >
                        <XCircle size={16} />
                    </button>
                )}
            </div>
            <Separator />
            {data.length > 0 && (
                <SimpleTreeView
                    data={data.slice(0, max)}
                    allExpanded={search.length > 0}
                    activeItems={activeItem ? [activeItem] : undefined}
                    onExpand={(_, item) => nav(item, data)}
                    onSelect={(_, item) => nav(item, data)}
                    onCollapse={handleCollapse}
                />
            )}
            {count > 0 && (
                <div className="flex items-center justify-between gap-2 pt-2 text-muted-foreground text-xs">
                    <span>
                        {from}-{to} / {count}
                    </span>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={currentPage <= 1}
                            onClick={() => setFirst(Math.max(0, first - max))}
                        >
                            <CaretRight className="size-3 rotate-180" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={currentPage >= pageCount}
                            onClick={() => setFirst(first + max)}
                        >
                            <CaretRight className="size-3" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <KeycloakSpinner />
    );
};
