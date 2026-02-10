import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHelp } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import type { ClientRoleParams } from "../clients/routes/ClientRole";
import { useRealm } from "../context/realm-context/RealmContext";
import { emptyFormatter, upperCaseFormatter } from "../util";
import { useParams } from "../utils/useParams";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge/ui/components/empty";
import { useEffect, useState } from "react";

export const UsersInRoleTab = () => {
    const { adminClient } = useAdminClient();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { id, clientId } = useParams<ClientRoleParams>();
    const [users, setUsers] = useState<UserRepresentation[]>([]);
    const [key, _setKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const role = await adminClient.roles.findOneById({ id: id! });
                if (!role) throw new Error(t("notFound"));
                const list = role.clientRole
                    ? await adminClient.clients.findUsersWithRole({ roleName: role.name!, id: clientId!, briefRepresentation: true, first: 0, max: 500 })
                    : await adminClient.roles.findUsersWithRole({ name: role.name!, briefRepresentation: true, first: 0, max: 500 });
                if (!cancelled) setUsers(list);
            } catch {
                if (!cancelled) setUsers([]);
            }
        })();
        return () => { cancelled = true; };
    }, [key, id, clientId]);

    const { enabled } = useHelp();

    const columns: ColumnDef<UserRepresentation>[] = [
        { accessorKey: "username", header: t("userName"), cell: ({ row }) => emptyFormatter()(row.original.username) as string },
        { accessorKey: "email", header: t("email"), cell: ({ row }) => emptyFormatter()(row.original.email) as string },
        { accessorKey: "lastName", header: t("lastName"), cell: ({ row }) => emptyFormatter()(row.original.lastName) as string },
        { accessorKey: "firstName", header: t("firstName"), cell: ({ row }) => upperCaseFormatter()(emptyFormatter()(row.original.firstName)) as string }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader><EmptyTitle>{t("noDirectUsers")}</EmptyTitle></EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    <span>{t("noUsersEmptyStateDescription")} </span>
                    <Button variant="link" className="kc-groups-link-empty-state p-0 h-auto ml-1" onClick={() => navigate(`/${realm}/groups`)}>{t("groups")}</Button>
                    <span> {t("or")} </span>
                    <Button variant="link" className="kc-users-link-empty-state p-0 h-auto ml-1" onClick={() => navigate(`/${realm}/users`)}>{t("users")}</Button>
                    <span> {t("noUsersEmptyStateDescriptionContinued")}</span>
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    return (
        <section className="py-6 bg-muted/30" data-testid="users-page">
            <DataTable<UserRepresentation>
                key={key}
                columns={columns}
                data={users}
                searchColumnId="username"
                searchPlaceholder={t("search")}
                emptyContent={emptyContent}
                emptyMessage={t("noDirectUsers")}
                toolbar={
                    enabled ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="kc-who-will-appear-button">
                                    <Question className="size-4 mr-1" />
                                    {t("whoWillAppearLinkTextRoles")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-sm" align="start">
                                <div className="space-y-2 text-sm">
                                    <p>
                                        {t("whoWillAppearPopoverTextRoles")}
                                        <Button variant="link" className="kc-groups-link p-0 h-auto ml-1" onClick={() => navigate(`/${realm}/groups`)}>{t("groups")}</Button>
                                        {t("or")}
                                        <Button variant="link" className="kc-users-link p-0 h-auto ml-1" onClick={() => navigate(`/${realm}/users`)}>{t("users")}.</Button>
                                    </p>
                                    <p className="text-muted-foreground">{t("whoWillAppearPopoverFooterText")}</p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : undefined
                }
            />
        </section>
    );
};
