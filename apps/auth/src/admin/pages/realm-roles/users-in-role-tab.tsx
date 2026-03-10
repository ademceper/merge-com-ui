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
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TablePaginationFooter,
    TableRow
} from "@merge-rd/ui/components/table";
import { Question } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useHelp } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import type { ClientRoleParams } from "@/admin/shared/lib/routes/clients";
import { useParams } from "@/admin/shared/lib/use-params";
import { emptyFormatter, upperCaseFormatter } from "@/admin/shared/lib/util";
import { useUsersInRole } from "./hooks/use-users-in-role";

export const UsersInRoleTab = () => {
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const { id, clientId } = useParams<ClientRoleParams>();
    const { data: users = [] } = useUsersInRole(id, clientId);

    const { enabled } = useHelp();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const lower = search.toLowerCase();
        return users.filter(u => u.username?.toLowerCase().includes(lower));
    }, [users, search]);

    const totalCount = filteredUsers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const colSpan = 4;

    return (
        <section className="py-6 bg-muted/30" data-testid="users-page">
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("search")}
                    />
                    {enabled && (
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
                    )}
                </div>

                {totalCount === 0 && !search ? (
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
                ) : (
                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">{t("userName")}</TableHead>
                                <TableHead className="w-[25%]">{t("email")}</TableHead>
                                <TableHead className="w-[25%]">{t("lastName")}</TableHead>
                                <TableHead className="w-[25%]">{t("firstName")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={colSpan}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noDirectUsers")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="truncate">
                                            {emptyFormatter()(user.username) as string}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {emptyFormatter()(user.email) as string}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {emptyFormatter()(user.lastName) as string}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {upperCaseFormatter()(
                                                emptyFormatter()(user.firstName)
                                            ) as string}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={colSpan} className="p-0">
                                    <TablePaginationFooter
                                        pageSize={pageSize}
                                        onPageSizeChange={setPageSize}
                                        onPreviousPage={() =>
                                            setCurrentPage(p => Math.max(0, p - 1))
                                        }
                                        onNextPage={() =>
                                            setCurrentPage(p =>
                                                Math.min(totalPages - 1, p + 1)
                                            )
                                        }
                                        hasPreviousPage={currentPage > 0}
                                        hasNextPage={currentPage < totalPages - 1}
                                        totalCount={totalCount}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                )}
            </div>
        </section>
    );
};
