import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { useHelp } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { ClientRoleParams } from "../../shared/lib/routes/clients";
import { useParams } from "../../shared/lib/use-params";
import { emptyFormatter, upperCaseFormatter } from "../../shared/lib/util";
import { useUsersInRole } from "./hooks/use-users-in-role";

export const UsersInRoleTab = () => {
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { id, clientId } = useParams<ClientRoleParams>();
    const { data: users = [] } = useUsersInRole(id, clientId);

    const { enabled } = useHelp();

    const columns: ColumnDef<UserRepresentation>[] = [
        {
            accessorKey: "username",
            header: t("userName"),
            cell: ({ row }) => emptyFormatter()(row.original.username) as string
        },
        {
            accessorKey: "email",
            header: t("email"),
            cell: ({ row }) => emptyFormatter()(row.original.email) as string
        },
        {
            accessorKey: "lastName",
            header: t("lastName"),
            cell: ({ row }) => emptyFormatter()(row.original.lastName) as string
        },
        {
            accessorKey: "firstName",
            header: t("firstName"),
            cell: ({ row }) =>
                upperCaseFormatter()(emptyFormatter()(row.original.firstName)) as string
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("noDirectUsers")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>
                    <span>{t("noUsersEmptyStateDescription")} </span>
                    <Button
                        variant="link"
                        className="kc-groups-link-empty-state p-0 h-auto ml-1"
                        onClick={() => navigate({ to: `/${realm}/groups` })}
                    >
                        {t("groups")}
                    </Button>
                    <span> {t("or")} </span>
                    <Button
                        variant="link"
                        className="kc-users-link-empty-state p-0 h-auto ml-1"
                        onClick={() => navigate({ to: `/${realm}/users` })}
                    >
                        {t("users")}
                    </Button>
                    <span> {t("noUsersEmptyStateDescriptionContinued")}</span>
                </EmptyDescription>
            </EmptyContent>
        </Empty>
    );

    return (
        <section className="py-6 bg-muted/30" data-testid="users-page">
            <DataTable<UserRepresentation>
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
                                <Button
                                    variant="ghost"
                                    className="kc-who-will-appear-button"
                                >
                                    <Question className="size-4 mr-1" />
                                    {t("whoWillAppearLinkTextRoles")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="max-w-sm" align="start">
                                <div className="space-y-2 text-sm">
                                    <p>
                                        {t("whoWillAppearPopoverTextRoles")}
                                        <Button
                                            variant="link"
                                            className="kc-groups-link p-0 h-auto ml-1"
                                            onClick={() =>
                                                navigate({ to: `/${realm}/groups` })
                                            }
                                        >
                                            {t("groups")}
                                        </Button>
                                        {t("or")}
                                        <Button
                                            variant="link"
                                            className="kc-users-link p-0 h-auto ml-1"
                                            onClick={() =>
                                                navigate({ to: `/${realm}/users` })
                                            }
                                        >
                                            {t("users")}.
                                        </Button>
                                    </p>
                                    <p className="text-muted-foreground">
                                        {t("whoWillAppearPopoverFooterText")}
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : undefined
                }
            />
        </section>
    );
};
