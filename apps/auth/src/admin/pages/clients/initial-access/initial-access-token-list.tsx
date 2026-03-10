import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import { useTranslation } from "@merge-rd/i18n";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@merge-rd/ui/components/alert-dialog";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
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
import { DotsThree, Plus, Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteInitialAccessToken } from "../hooks/use-delete-initial-access-token";
import { useFormatDate, FORMAT_DATE_AND_TIME } from "@/admin/shared/lib/use-format-date";
import { clientKeys } from "../hooks/keys";
import { useInitialAccessTokens } from "../hooks/use-initial-access-tokens";
import { AddInitialAccessTokenDialog } from "./add-initial-access-token-dialog";

export const InitialAccessTokenList = () => {
    const { t } = useTranslation();
    const { realm } = useRealm();
    const formatDate = useFormatDate();

    const queryClient = useQueryClient();
    const { mutateAsync: deleteToken } = useDeleteInitialAccessToken();
    const { data: tokens = [] } = useInitialAccessTokens();
    const [token, setToken] = useState<ClientInitialAccessPresentation>();
    const invalidateTokens = () =>
        queryClient.invalidateQueries({ queryKey: clientKeys.initialAccessTokens() });

    const onDeleteConfirm = async () => {
        if (!token?.id) return;
        try {
            await deleteToken(token.id);
            toast.success(t("tokenDeleteSuccess"));
            setToken(undefined);
        } catch (error) {
            toast.error(t("tokenDeleteError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredTokens = useMemo(() => {
        if (!search) return tokens;
        const lower = search.toLowerCase();
        return tokens.filter(t => t.id?.toLowerCase().includes(lower));
    }, [tokens, search]);

    const totalCount = filteredTokens.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedTokens = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredTokens.slice(start, start + pageSize);
    }, [filteredTokens, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const columnCount = 6;

    return (
        <>
            <AlertDialog
                open={!!token}
                onOpenChange={open => !open && setToken(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("tokenDeleteConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("tokenDeleteConfirm", { id: token?.id })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            data-testid="confirm"
                            onClick={onDeleteConfirm}
                        >
                            {t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between gap-2 py-2.5">
                    <FacetedFormFilter
                        type="text"
                        size="small"
                        title={t("search")}
                        value={search}
                        onChange={value => setSearch(value)}
                        placeholder={t("searchInitialAccessToken")}
                    />
                    <AddInitialAccessTokenDialog
                        onSuccess={() => invalidateTokens()}
                        trigger={
                            <Button
                                type="button"
                                data-testid="createInitialAccessToken"
                                variant="default"
                                className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                                aria-label={t("createToken")}
                            >
                                <Plus size={20} className="shrink-0 sm:hidden" />
                                <span className="hidden sm:inline">
                                    {t("createToken")}
                                </span>
                            </Button>
                        }
                    />
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[25%]">{t("id")}</TableHead>
                            <TableHead className="w-[18%]">{t("timestamp")}</TableHead>
                            <TableHead className="w-[18%]">{t("expires")}</TableHead>
                            <TableHead className="w-[12%]">{t("count")}</TableHead>
                            <TableHead className="w-[15%]">{t("remainingCount")}</TableHead>
                            <TableHead className="w-[12%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noTokens")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTokens.map(t_token => (
                                <TableRow key={t_token.id}>
                                    <TableCell className="truncate">
                                        {t_token.id || "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {formatDate(new Date(t_token.timestamp! * 1000), FORMAT_DATE_AND_TIME)}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {formatDate(
                                            new Date(
                                                t_token.timestamp! * 1000 + t_token.expiration! * 1000
                                            ),
                                            FORMAT_DATE_AND_TIME
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {t_token.count ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {t_token.remainingCount ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon-sm">
                                                    <DotsThree
                                                        weight="bold"
                                                        className="size-4"
                                                    />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => setToken(t_token)}
                                                >
                                                    <Trash className="size-4 shrink-0" />
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={columnCount} className="p-0">
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
            </div>
        </>
    );
};
