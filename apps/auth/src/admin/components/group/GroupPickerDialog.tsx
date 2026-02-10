import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
    GroupQuery,
    SubGroupQuery
} from "@keycloak/keycloak-admin-client/lib/resources/groups";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { TablePagination } from "@merge/ui/components/pagination";
import { Checkbox } from "@merge/ui/components/checkbox";
import { Input } from "@merge/ui/components/input";
import { Separator } from "@merge/ui/components/separator";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { KeyboardEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { GroupPath } from "./GroupPath";

export type GroupPickerDialogProps = {
    id?: string;
    type: "selectOne" | "selectMany";
    filterGroups?: GroupRepresentation[];
    text: { title: string; ok: string };
    canBrowse?: boolean;
    isMove?: boolean;
    onConfirm: (groups: GroupRepresentation[] | undefined) => void;
    onClose: () => void;
};

type SelectableGroup = GroupRepresentation & {
    checked?: boolean;
};

export const GroupPickerDialog = ({
    id,
    type,
    filterGroups,
    text,
    canBrowse = true,
    isMove = false,
    onClose,
    onConfirm
}: GroupPickerDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<SelectableGroup[]>([]);

    const [navigation, setNavigation] = useState<SelectableGroup[]>([]);
    const [groups, setGroups] = useState<SelectableGroup[]>([]);
    const [filter, setFilter] = useState("");
    const [joinedGroups, setJoinedGroups] = useState<GroupRepresentation[]>([]);
    const [groupId, setGroupId] = useState<string>();

    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);

    const [count, setCount] = useState(0);
    const [moveSearchValue, setMoveSearchValue] = useState("");
    const [searchInputValue, setSearchInputValue] = useState("");

    const currentGroup = () => navigation[navigation.length - 1];

    const applyMoveSearch = () => {
        setFilter(moveSearchValue.trim());
        setFirst(0);
        setMax(10);
        setNavigation([]);
        setGroupId(undefined);
    };

    const handleMoveSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") applyMoveSearch();
    };

    useFetch(
        async () => {
            let group;
            let groups;
            let existingUserGroups;

            if (!groupId) {
                const args: GroupQuery = {
                    first,
                    max: max + 1
                };
                if (filter !== "") {
                    args.search = filter;
                }
                groups = await adminClient.groups.find(args);
            } else {
                if (!navigation.map(({ id }) => id).includes(groupId)) {
                    group = await adminClient.groups.findOne({ id: groupId });
                    if (!group) {
                        throw new Error(t("notFound"));
                    }
                }

                const args: SubGroupQuery = {
                    first,
                    max,
                    parentId: groupId
                };
                groups = await adminClient.groups.listSubGroups(args);
            }

            if (id) {
                existingUserGroups = await adminClient.users.listGroups({
                    id
                });
            }

            return { group, groups, existingUserGroups };
        },
        async ({ group: selectedGroup, groups, existingUserGroups }) => {
            setJoinedGroups(existingUserGroups || []);
            if (selectedGroup) {
                setNavigation([...navigation, selectedGroup]);
                setCount(selectedGroup.subGroupCount!);
            }

            groups.forEach((group: SelectableGroup) => {
                group.checked = !!selectedRows.find(r => r.id === group.id);
            });
            setGroups(groups);
            if (filter !== "" || !groupId) {
                setCount(groups.length);
            }
        },
        [groupId, filter, first, max]
    );

    const isRowDisabled = (row?: GroupRepresentation) => {
        return [
            ...joinedGroups.map(item => item.id),
            ...(filterGroups || []).map(group => group.id)
        ].some(group => group === row?.id);
    };

    const paginationProps = {
        count,
        first,
        max,
        onNextClick: setFirst,
        onPreviousClick: setFirst,
        onPerPageSelect: (newMax: number, newFirst: number) => {
            setMax(newMax);
            setFirst(newFirst);
        }
    };

    const listContent = (
        <>
            <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm mb-2">
                {navigation.length > 0 && (
                    <span key="home">
                        <Button
                            variant="link"
                            onClick={() => {
                                setGroupId(undefined);
                                setNavigation([]);
                                setFirst(0);
                                setMax(10);
                            }}
                        >
                            {t("groups")}
                        </Button>
                        <span className="mx-1">/</span>
                    </span>
                )}
                {navigation.map((group, i) => (
                    <span key={i}>
                        {navigation.length - 1 !== i && (
                            <>
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setGroupId(group.id);
                                        setNavigation([...navigation].slice(0, i));
                                        setFirst(0);
                                        setMax(10);
                                    }}
                                >
                                    {group.name}
                                </Button>
                                <span className="mx-1">/</span>
                            </>
                        )}
                        {navigation.length - 1 === i && <span className="font-medium">{group.name}</span>}
                    </span>
                ))}
            </nav>
            <div aria-label={t("groups")} className="space-y-1">
                {filter == ""
                    ? groups.slice(0, max).map((group: SelectableGroup) => (
                          <GroupRow
                              key={group.id}
                              group={group}
                              isRowDisabled={isRowDisabled}
                              onSelect={group => {
                                  setGroupId(group.id);
                                  setFirst(0);
                              }}
                              type={type}
                              isSearching={filter !== ""}
                              setIsSearching={boolean =>
                                  setFilter(boolean ? "" : filter)
                              }
                              selectedRows={selectedRows}
                              setSelectedRows={setSelectedRows}
                              canBrowse={canBrowse}
                          />
                      ))
                    : groups
                          ?.map(g => deepGroup([g]))
                          .flat()
                          .map(g => (
                              <GroupRow
                                  key={g.id}
                                  group={g}
                                  isRowDisabled={isRowDisabled}
                                  type={type}
                                  isSearching
                                  selectedRows={selectedRows}
                                  setSelectedRows={setSelectedRows}
                                  canBrowse={false}
                              />
                          ))}
            </div>
            {groups.length === 0 && filter === "" && (
                <Empty className="py-8">
                    <EmptyHeader><EmptyTitle>{t("moveGroupEmpty")}</EmptyTitle></EmptyHeader>
                    {isMove && <EmptyContent><EmptyDescription>{t("moveGroupEmptyInstructions")}</EmptyDescription></EmptyContent>}
                </Empty>
            )}
            {groups.length === 0 && filter !== "" && (
                <Empty className="py-8">
                    <EmptyHeader><EmptyTitle>{t("noSearchResults")}</EmptyTitle></EmptyHeader>
                    <EmptyContent><EmptyDescription>{t("noSearchResultsInstructions")}</EmptyDescription></EmptyContent>
                </Empty>
            )}
        </>
    );

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t(text.title, {
                        group1: filterGroups?.[0]?.name,
                        group2: navigation.length ? currentGroup().name : t("root")
                    })}</DialogTitle>
                </DialogHeader>
                {isMove ? (
                    <>
                        <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2 mb-3">
                            <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                            <Input
                                data-testid="table-search-input"
                                placeholder={t("searchForGroups")}
                                aria-label={t("search")}
                                value={moveSearchValue}
                                onChange={e => setMoveSearchValue(e.target.value)}
                                onKeyDown={handleMoveSearchKeyDown}
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0"
                            />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <TablePagination {...paginationProps} t={t} />
                        </div>
                        <Separator className="mb-3" />
                        {listContent}
                        {count !== 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <TablePagination {...paginationProps} variant="bottom" t={t} />
                            </div>
                        )}
                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                data-testid={`${text.ok}-button`}
                                onClick={() => {
                                    onConfirm(
                                        type === "selectMany"
                                            ? selectedRows
                                            : navigation.length
                                              ? [currentGroup()]
                                              : undefined
                                    );
                                }}
                                disabled={type === "selectMany" && selectedRows.length === 0}
                            >
                                {t(text.ok)}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                                <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                                <Input
                                    data-testid="table-search-input"
                                    placeholder={t("searchForGroups")}
                                    aria-label={t("search")}
                                    value={searchInputValue}
                                    onChange={(e) => setSearchInputValue(e.target.value)}
                                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setFilter(searchInputValue);
                                            setFirst(0);
                                            setMax(10);
                                            setNavigation([]);
                                            setGroupId(undefined);
                                        }
                                    }}
                                />
                            </div>
                            <TablePagination
                                count={count}
                                first={first}
                                max={max}
                                onNextClick={setFirst}
                                onPreviousClick={setFirst}
                                onPerPageSelect={(_first, newMax) => {
                                    setMax(newMax);
                                    setFirst(0);
                                }}
                                t={t}
                            />
                        </div>
                        {listContent}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={onClose}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                data-testid={`${text.ok}-button`}
                                key="confirm"
                                form="group-form"
                                onClick={() => {
                                    onConfirm(
                                        type === "selectMany"
                                            ? selectedRows
                                            : navigation.length
                                              ? [currentGroup()]
                                              : undefined
                                    );
                                }}
                                disabled={type === "selectMany" && selectedRows.length === 0}
                            >
                                {t(text.ok)}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

function deepGroup(groups: GroupRepresentation[]) {
    const flattened: GroupRepresentation[] = [];
    for (const group of groups) {
        flattened.push(group);
        if (group.subGroups && group.subGroups.length > 0) {
            flattened.push(...deepGroup(group.subGroups));
        }
    }
    return flattened;
}

type GroupRowProps = {
    group: SelectableGroup;
    type: "selectOne" | "selectMany";
    isRowDisabled: (row?: GroupRepresentation) => boolean;
    isSearching: boolean;
    setIsSearching?: (value: boolean) => void;
    onSelect?: (group: GroupRepresentation) => void;
    selectedRows: SelectableGroup[];
    setSelectedRows: (groups: SelectableGroup[]) => void;
    canBrowse: boolean;
};

const GroupRow = ({
    group,
    type,
    isRowDisabled,
    isSearching,
    setIsSearching,
    onSelect,
    selectedRows,
    setSelectedRows,
    canBrowse
}: GroupRowProps) => {
    const { t } = useTranslation();

    return (
        <div
            aria-labelledby={group.name}
            key={group.id}
            id={group.id}
            onClick={e => {
                if (type === "selectOne") {
                    onSelect?.(group);
                } else if (
                    (e.target as HTMLInputElement).type !== "checkbox" &&
                    group.subGroupCount !== 0
                ) {
                    onSelect?.(group);
                    setIsSearching?.(false);
                }
            }}
            className="border-b last:border-b-0"
        >
            <div
                className={`flex items-center gap-2 p-2 join-group-dialog-row${
                    isRowDisabled(group) ? "-m-disabled opacity-50" : ""
                }`}
                data-testid={group.name}
            >
                {type === "selectMany" && (
                    <Checkbox
                        className="kc-join-group-modal-check"
                        data-testid={`${group.name}-check`}
                        aria-label={group.name}
                        checked={group.checked}
                        disabled={isRowDisabled(group)}
                        onCheckedChange={(checked) => {
                            group.checked = !!checked;
                            let newSelectedRows: SelectableGroup[] = [];
                            if (!group.checked) {
                                newSelectedRows = selectedRows.filter(
                                    r => r.id !== group.id
                                );
                            } else {
                                newSelectedRows = [...selectedRows, group];
                            }

                            setSelectedRows(newSelectedRows);
                        }}
                        aria-labelledby={`select-${group.name}`}
                    />
                )}

                <div className="flex-1 keycloak-groups-group-path">
                    {isSearching ? (
                        <GroupPath id={`select-${group.name}`} group={group} />
                    ) : (
                        <span id={`select-${group.name}`}>{group.name}</span>
                    )}
                </div>
                <div
                    aria-labelledby={`select-${group.name}`}
                    aria-label={t("groupName")}
                >
                    {(canBrowse || type === "selectOne") && group.subGroupCount !== 0 && (
                        <Button variant="link" aria-label={t("select")}>
                            <CaretRight className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
