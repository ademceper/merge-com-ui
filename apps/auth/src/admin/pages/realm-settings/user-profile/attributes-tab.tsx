import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
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
import { DotsThree, Funnel, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { uniqBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    deleteRealmLocalizationTexts,
    fetchRealmLocalizationTexts
} from "@/admin/api/realm-settings";
import { toAddAttribute, toAttribute } from "@/admin/shared/lib/routes/realm-settings";
import { useLocale } from "@/admin/shared/lib/use-locale";
import { useUserProfile } from "./user-profile-context";

const RESTRICTED_ATTRIBUTES = ["username", "email"];

type AttributesTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesTab = ({ setTableData }: AttributesTabProps) => {
    const { config, save } = useUserProfile();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("allGroups");
    const [attributeToDelete, setAttributeToDelete] = useState("");

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const onDeleteConfirm = async () => {
        if (!config?.attributes || !attributeToDelete) return;

        const translationsToDelete = config.attributes.find(
            attribute => attribute.name === attributeToDelete
        )?.displayName;

        const formattedTranslationsToDelete = translationsToDelete?.substring(
            2,
            translationsToDelete.length - 1
        );

        try {
            await Promise.all(
                combinedLocales.map(async locale => {
                    try {
                        await fetchRealmLocalizationTexts(realm, locale);

                        await deleteRealmLocalizationTexts(
                            realm,
                            locale,
                            formattedTranslationsToDelete
                        );

                        const updatedData =
                            await fetchRealmLocalizationTexts(realm, locale);
                        setTableData([updatedData]);
                    } catch {
                        console.error(`Error removing translations for ${locale}`);
                    }
                })
            );

            const updatedAttributes = config.attributes.filter(
                attribute => attribute.name !== attributeToDelete
            );
            const groups = config.groups ?? [];

            await save(
                { ...config, attributes: updatedAttributes, groups },
                {
                    successMessageKey: "deleteAttributeSuccess",
                    errorMessageKey: "deleteAttributeError"
                }
            );

            setAttributeToDelete("");
        } catch (error) {
            console.error(`Error removing translations or updating attributes: ${error}`);
        }
    };

    const attributes = config?.attributes ?? [];
    const filteredByGroup = useMemo(() => {
        if (filter === "allGroups") return attributes;
        return attributes.filter(attr => attr.group === filter);
    }, [attributes, filter]);

    const filteredData = useMemo(() => {
        if (!search) return filteredByGroup;
        const lower = search.toLowerCase();
        return filteredByGroup.filter(a => a.name?.toLowerCase().includes(lower));
    }, [filteredByGroup, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const groupOptions = useMemo(
        () =>
            uniqBy(
                attributes.filter(attr => !!attr.group),
                "group"
            ),
        [attributes]
    );

    if (!config) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <AlertDialog
                open={!!attributeToDelete}
                onOpenChange={open => !open && setAttributeToDelete("")}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("deleteAttributeConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteAttributeConfirm", {
                                attributeName: attributeToDelete
                            })}
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
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Select value={filter} onValueChange={value => setFilter(value)}>
                        <SelectTrigger className="w-[200px]" data-testid="filter-select">
                            <Funnel className="mr-2 size-4 shrink-0 opacity-60" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="allGroups" data-testid="all-groups">
                                {t("allGroups")}
                            </SelectItem>
                            {groupOptions.map(
                                attr =>
                                    attr.group && (
                                        <SelectItem key={attr.group} value={attr.group}>
                                            {attr.group}
                                        </SelectItem>
                                    )
                            )}
                        </SelectContent>
                    </Select>
                    <Button
                        data-testid="createAttributeBtn"
                        asChild
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                    >
                        <Link to={toAddAttribute({ realm: realm ?? "" }) as string}>
                            <Plus size={20} className="shrink-0 sm:hidden" />
                            <span className="hidden sm:inline">
                                {t("createAttribute")}
                            </span>
                        </Link>
                    </Button>
                </div>
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchAttributes")}
                        />
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">{t("attributeName")}</TableHead>
                                <TableHead className="w-[30%]">{t("attributeDisplayName")}</TableHead>
                                <TableHead className="w-[25%]">{t("attributeGroup")}</TableHead>
                                <TableHead className="w-[20%]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("noAttributes")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map(attr => (
                                    <TableRow key={attr.name}>
                                        <TableCell className="truncate">
                                            <Link
                                                to={
                                                    toAttribute({
                                                        realm: realm ?? "",
                                                        attributeName: attr.name!
                                                    }) as string
                                                }
                                                className="text-primary hover:underline"
                                            >
                                                {attr.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {attr.displayName ?? "-"}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {attr.group ?? "-"}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
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
                                                        onClick={() =>
                                                            navigate({
                                                                to: toAttribute({
                                                                    realm: realm ?? "",
                                                                    attributeName: attr.name!
                                                                }) as string
                                                            })
                                                        }
                                                    >
                                                        <PencilSimple className="size-4" />
                                                        {t("edit")}
                                                    </DropdownMenuItem>
                                                    {!RESTRICTED_ATTRIBUTES.includes(attr.name ?? "") && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    setAttributeToDelete(attr.name ?? "")
                                                                }
                                                            >
                                                                <Trash className="size-4" />
                                                                {t("delete")}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={4} className="p-0">
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
            </div>
        </>
    );
};
