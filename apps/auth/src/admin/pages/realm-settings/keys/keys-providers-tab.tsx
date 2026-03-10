import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
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
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useDeleteComponent } from "../hooks/use-delete-component";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import {
    type ProviderType,
    toKeyProvider
} from "@/admin/shared/lib/routes/realm-settings";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { KEY_PROVIDER_TYPE } from "@/admin/shared/lib/util";
import { KeyProviderModal } from "./key-providers/key-provider-modal";
import { KeyProvidersPicker } from "./key-providers/key-providers-picker";

type ComponentData = ComponentRepresentation & {
    providerDescription?: string;
};

type KeysProvidersTabProps = {
    realmComponents: ComponentRepresentation[];
    refresh: () => void;
};

export const KeysProvidersTab = ({ realmComponents, refresh }: KeysProvidersTabProps) => {
    const { t } = useTranslation();
    const { realm } = useRealm();

    const [isCreateModalOpen, handleModalToggle] = useToggle();
    const serverInfo = useServerInfo();
    const keyProviderComponentTypes =
        serverInfo.componentTypes?.[KEY_PROVIDER_TYPE] ?? [];

    const { mutateAsync: deleteComponentMut } = useDeleteComponent();
    const [providerOpen, toggleProviderOpen] = useToggle();
    const [defaultUIDisplayName, setDefaultUIDisplayName] = useState<ProviderType>();
    const [selectedComponent, setSelectedComponent] = useState<ComponentRepresentation>();

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const data = useMemo(
        () =>
            realmComponents.map(component => {
                const provider = keyProviderComponentTypes.find(
                    (ct: ComponentTypeRepresentation) => component.providerId === ct.id
                );
                return {
                    ...component,
                    providerDescription: provider?.helpText
                } as ComponentData;
            }),
        [realmComponents, keyProviderComponentTypes]
    );

    const filteredData = useMemo(() => {
        if (!search) return data;
        const lower = search.toLowerCase();
        return data.filter(d => d.name?.toLowerCase().includes(lower));
    }, [data, search]);

    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedData = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const onDeleteConfirm = async () => {
        if (!selectedComponent?.id) return;
        try {
            await deleteComponentMut(selectedComponent.id);
            setSelectedComponent(undefined);
            refresh();
            toast.success(t("deleteProviderSuccess"));
        } catch (error) {
            toast.error(t("deleteProviderError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            {providerOpen && (
                <KeyProvidersPicker
                    onClose={() => toggleProviderOpen()}
                    onConfirm={provider => {
                        handleModalToggle();
                        setDefaultUIDisplayName(provider as ProviderType);
                        toggleProviderOpen();
                    }}
                />
            )}
            {isCreateModalOpen && defaultUIDisplayName && (
                <KeyProviderModal
                    providerType={defaultUIDisplayName}
                    onClose={() => {
                        handleModalToggle();
                        refresh();
                    }}
                />
            )}
            <AlertDialog
                open={!!selectedComponent}
                onOpenChange={open => !open && setSelectedComponent(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteProviderTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteProviderConfirm", {
                                provider: selectedComponent?.name
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
                    <Button
                        type="button"
                        data-testid="addProviderDropdown"
                        variant="default"
                        className="flex h-9 w-9 shrink-0 items-center justify-center p-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
                        aria-label={t("addProvider")}
                        onClick={() => toggleProviderOpen()}
                    >
                        <Plus size={20} className="shrink-0 sm:hidden" />
                        <span className="hidden sm:inline">{t("addProvider")}</span>
                    </Button>
                </div>

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">{t("name")}</TableHead>
                            <TableHead className="w-[20%]">{t("provider")}</TableHead>
                            <TableHead className="w-[40%]">{t("providerDescription")}</TableHead>
                            <TableHead className="w-[10%]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noProviders")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map(component => (
                                <TableRow key={component.id}>
                                    <TableCell className="truncate">
                                        <Link
                                            to={
                                                toKeyProvider({
                                                    realm,
                                                    id: component.id!,
                                                    providerType: component.providerId as ProviderType
                                                }) as string
                                            }
                                            className="text-primary hover:underline"
                                            data-testid="provider-name-link"
                                        >
                                            {component.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {component.providerId ?? "-"}
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {component.providerDescription ?? "-"}
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
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setSelectedComponent(component)}
                                                >
                                                    <Trash className="size-4" />
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
        </>
    );
};
