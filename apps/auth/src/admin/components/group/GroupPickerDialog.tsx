import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import {
    GroupQuery,
    SubGroupQuery
} from "@keycloak/keycloak-admin-client/lib/resources/groups";
import {
    ListEmptyState,
    PaginatingTableToolbar,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { Checkbox } from "@merge/ui/components/checkbox";
import { CaretRight } from "@phosphor-icons/react";
import { useState } from "react";
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

    const currentGroup = () => navigation[navigation.length - 1];

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

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className={filter !== "" ? "max-w-2xl" : "max-w-md"}>
                <DialogHeader>
                    <DialogTitle>{t(text.title, {
                        group1: filterGroups?.[0]?.name,
                        group2: navigation.length ? currentGroup().name : t("root")
                    })}</DialogTitle>
                </DialogHeader>
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
                inputGroupName={"search"}
                inputGroupOnEnter={search => {
                    setFilter(search);
                    setFirst(0);
                    setMax(10);
                    setNavigation([]);
                    setGroupId(undefined);
                }}
                inputGroupPlaceholder={t("searchForGroups")}
            >
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
                    <ListEmptyState
                        hasIcon={false}
                        message={t("moveGroupEmpty")}
                        instructions={
                            isMove ? t("moveGroupEmptyInstructions") : undefined
                        }
                    />
                )}
                {groups.length === 0 && filter !== "" && (
                    <ListEmptyState
                        message={t("noSearchResults")}
                        instructions={t("noSearchResultsInstructions")}
                    />
                )}
            </PaginatingTableToolbar>
                <DialogFooter>
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
