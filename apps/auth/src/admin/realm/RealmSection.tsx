/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm/RealmSection.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { NetworkError } from "@keycloak/keycloak-admin-client";
import { KeycloakDataTable } from "../../shared/keycloak-ui-shared";
import { useAlerts, AlertVariant } from "../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { DotsThreeVertical } from "@phosphor-icons/react";
const cellWidth = (_width: number) => (value: any) => value;
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import { useRealm } from "../context/realm-context/RealmContext";
import { useRecentRealms } from "../context/RecentRealms";
import { useWhoAmI } from "../context/whoami/WhoAmI";
import { translationFormatter } from "../utils/translationFormatter";
import NewRealmForm from "./add/NewRealmForm";
import { toRealm } from "./RealmRoutes";
import { toDashboard } from "../dashboard/routes/Dashboard";

export type RealmNameRepresentation = {
    name: string;
    displayName?: string;
};

const RecentRealmsDropdown = () => {
    const { t } = useTranslation();
    const recentRealms = useRecentRealms();

    if (recentRealms.length < 3) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="kebab" aria-label="Recent realms">
                    {t("recentRealms")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {recentRealms.map(({ name }) => (
                    <DropdownMenuItem key={name} asChild>
                        <Link to={toDashboard({ realm: name })}>{name}</Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

type KebabDropdownProps = {
    onClick: () => void;
    isDisabled?: boolean;
};

const KebabDropdown = ({ onClick, isDisabled }: KebabDropdownProps) => {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    data-testid="kebab"
                    aria-label="Kebab toggle"
                    variant="ghost"
                    disabled={isDisabled}
                >
                    <DotsThreeVertical className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem
                    data-testid="delete"
                    onClick={onClick}
                >
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

type RealmRow = RealmNameRepresentation & { id: string };

export default function RealmSection() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { whoAmI } = useWhoAmI();
    const { realm } = useRealm();
    const { adminClient } = useAdminClient();
    const { addAlert, addError } = useAlerts();

    const [selected, setSelected] = useState<RealmRow[]>([]);
    const [openNewRealm, setOpenNewRealm] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const loader = async (first?: number, max?: number, search?: string) => {
        try {
            const result = await fetchAdminUI<RealmNameRepresentation[]>(
                adminClient,
                "ui-ext/realms/names",
                { first: `${first}`, max: `${max}`, search: search || "" }
            );
            return result.map(r => ({ ...r, id: r.name }));
        } catch (error) {
            if (error instanceof NetworkError && error.response.status < 500) {
                return [];
            }

            throw error;
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteConfirmRealm", {
            count: selected.length,
            name: selected[0]?.name
        }),
        messageKey: "deleteConfirmRealmSetting",
        continueButtonLabel: "delete",
        onConfirm: async () => {
            try {
                if (selected.filter(({ name }) => name === "master").length > 0) {
                    addAlert(t("cantDeleteMasterRealm"), AlertVariant.warning);
                }
                const filtered = selected.filter(({ name }) => name !== "master");
                if (filtered.length === 0) return;
                await Promise.all(
                    filtered.map(({ name: realmName }) =>
                        adminClient.realms.del({ realm: realmName })
                    )
                );
                addAlert(t("deletedSuccessRealmSetting"));
                if (selected.filter(({ name }) => name === realm).length > 0) {
                    navigate(toRealm({ realm: "master" }));
                }
                refresh();
                setSelected([]);
            } catch (error) {
                addError("deleteError", error);
            }
        }
    });

    return (
        <>
            <DeleteConfirm />
            {openNewRealm && (
                <NewRealmForm
                    onClose={() => {
                        setOpenNewRealm(false);
                        refresh();
                    }}
                />
            )}
            <ViewHeader titleKey="manageRealms" divider={false} />
            <section className="py-6 bg-muted/30 p-0">
                <KeycloakDataTable
                    key={key}
                    loader={loader}
                    isPaginated
                    onSelect={setSelected}
                    canSelectAll
                    ariaLabelKey="selectRealm"
                    searchPlaceholderKey="search"
                    actions={[
                        {
                            title: t("delete"),
                            onRowClick: selected => {
                                setSelected([selected]);
                                toggleDeleteDialog();
                            }
                        }
                    ]}
                    toolbarItem={
                        <>
                            <div>
                                {whoAmI.createRealm && (
                                    <Button onClick={() => setOpenNewRealm(true)} data-testid="add-realm">
                                        {t("createRealm")}
                                    </Button>
                                )}
                            </div>
                            <div>
                                <RecentRealmsDropdown />
                            </div>
                            <div>
                                <KebabDropdown
                                    onClick={toggleDeleteDialog}
                                    isDisabled={selected.length === 0}
                                />
                            </div>
                        </>
                    }
                    columns={[
                        {
                            name: "name",
                            transforms: [cellWidth(20)],
                            cellRenderer: ({ name }) =>
                                name !== realm ? (
                                    <Link to={toDashboard({ realm: name })}>{name}</Link>
                                ) : (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <span className="inline-flex items-center gap-1 cursor-help">
                                                {name} <Badge variant="secondary">{t("currentRealm")}</Badge>
                                            </span>
                                        </PopoverTrigger>
                                        <PopoverContent className="max-w-xs">
                                            {t("currentRealmExplain")}
                                        </PopoverContent>
                                    </Popover>
                                )
                        },
                        {
                            name: "displayName",
                            transforms: [cellWidth(80)],
                            cellFormatters: [translationFormatter(t)]
                        }
                    ]}
                />
            </section>
        </>
    );
}
