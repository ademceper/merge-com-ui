import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { CaretDown, CaretUp, Funnel } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useIsFeatureEnabled, Feature } from "@/admin/shared/lib/use-is-feature-enabled";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import {
    type ClientScopeType,
    clientScopeTypesDropdown
} from "@/admin/shared/ui/client-scope/client-scope-types";
import { getProtocolName } from "../utils";

type AddScopeDialogProps = {
    clientScopes: ClientScopeRepresentation[];
    clientName?: string;
    open: boolean;
    toggleDialog: () => void;
    onAdd: (
        scopes: { scope: ClientScopeRepresentation; type?: ClientScopeType }[]
    ) => void;
    isClientScopesConditionType?: boolean;
};

enum FilterType {
    Name = "Name",
    Protocol = "Protocol"
}

enum ProtocolType {
    All = "All",
    SAML = "SAML",
    OpenIDConnect = "OpenID Connect",
    OID4VC = "OpenID4VC"
}

export const AddScopeDialog = ({
    clientScopes: scopes,
    clientName,
    open,
    toggleDialog,
    onAdd,
    isClientScopesConditionType
}: AddScopeDialogProps) => {
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();
    const [addToggle, setAddToggle] = useState(false);
    const [rows, setRows] = useState<ClientScopeRepresentation[]>([]);
    const [filterType, setFilterType] = useState(FilterType.Name);
    const [protocolType, setProtocolType] = useState(ProtocolType.All);

    const isOid4vcEnabled = isFeatureEnabled(Feature.OpenId4VCI);

    const [isFilterTypeDropdownOpen, toggleIsFilterTypeDropdownOpen] = useToggle();

    const [isProtocolTypeDropdownOpen, toggleIsProtocolTypeDropdownOpen] =
        useToggle(false);

    const clientScopes = useMemo(() => {
        if (protocolType === ProtocolType.OpenIDConnect) {
            return scopes.filter(item => item.protocol === "openid-connect");
        } else if (protocolType === ProtocolType.SAML) {
            return scopes.filter(item => item.protocol === "saml");
        } else if (protocolType === ProtocolType.OID4VC) {
            return scopes.filter(item => item.protocol === "oid4vc");
        }
        return scopes;
    }, [scopes, filterType, protocolType]);

    const action = (scope: ClientScopeType) => {
        const scopes = rows.map(row => {
            return { scope: row, type: scope };
        });
        onAdd(scopes);
        setAddToggle(false);
        toggleDialog();
    };

    const onFilterTypeDropdownSelect = (filterType: string) => {
        if (filterType === FilterType.Name) {
            setFilterType(FilterType.Protocol);
        } else if (filterType === FilterType.Protocol) {
            setFilterType(FilterType.Name);
            setProtocolType(ProtocolType.All);
        }

        toggleIsFilterTypeDropdownOpen();
    };

    const onProtocolTypeDropdownSelect = (protocolType: string) => {
        if (protocolType === ProtocolType.SAML) {
            setProtocolType(ProtocolType.SAML);
        } else if (protocolType === ProtocolType.OpenIDConnect) {
            setProtocolType(ProtocolType.OpenIDConnect);
        } else if (protocolType === ProtocolType.OID4VC) {
            setProtocolType(ProtocolType.OID4VC);
        } else if (protocolType === ProtocolType.All) {
            setProtocolType(ProtocolType.All);
        }

        toggleIsProtocolTypeDropdownOpen();
    };

    const protocolTypeOptions = useMemo(() => {
        const options = [
            <SelectItem key={1} value={ProtocolType.SAML}>
                {t("protocolTypes.saml")}
            </SelectItem>,
            <SelectItem key={2} value={ProtocolType.OpenIDConnect}>
                {t("protocolTypes.openid-connect")}
            </SelectItem>
        ];

        if (isOid4vcEnabled) {
            options.push(
                <SelectItem key={3} value={ProtocolType.OID4VC}>
                    {t("protocolTypes.oid4vc")}
                </SelectItem>
            );
        }

        options.push(
            <SelectItem key={4} value={ProtocolType.All}>
                {t("protocolTypes.all")}
            </SelectItem>
        );

        return options;
    }, [t, isOid4vcEnabled]);

    const toggleRowSelection = (scope: ClientScopeRepresentation) => {
        const isSelected = rows.some(r => r.id === scope.id);
        if (isSelected) {
            setRows(rows.filter(r => r.id !== scope.id));
        } else {
            setRows([...rows, scope]);
        }
    };

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const filteredScopes = useMemo(() => {
        if (!search) return clientScopes;
        const lower = search.toLowerCase();
        return clientScopes.filter(s => s.name?.toLowerCase().includes(lower));
    }, [clientScopes, search]);

    const totalCount = filteredScopes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedScopes = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredScopes.slice(start, start + pageSize);
    }, [filteredScopes, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(0);
    }, [search, pageSize]);

    const columnCount = 4;

    return (
        <Dialog open={open} onOpenChange={open => !open && toggleDialog()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isClientScopesConditionType
                            ? t("addClientScope")
                            : t("addClientScopesTo", { clientName })}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex h-full w-full flex-col">
                    <div className="flex items-center justify-between gap-2 py-2.5">
                        <FacetedFormFilter
                            type="text"
                            size="small"
                            title={t("search")}
                            value={search}
                            onChange={value => setSearch(value)}
                            placeholder={t("searchForClientScope")}
                        />
                        <div className="flex gap-2">
                            <DropdownMenu
                                open={isFilterTypeDropdownOpen}
                                onOpenChange={toggleIsFilterTypeDropdownOpen}
                            >
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        data-testid="filter-type-dropdown"
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Funnel className="size-4 mr-1" />
                                        {filterType}
                                        <CaretDown className="size-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        data-testid="filter-type-dropdown-item"
                                        onClick={() =>
                                            onFilterTypeDropdownSelect(filterType)
                                        }
                                    >
                                        {filterType === FilterType.Name
                                            ? t("protocol")
                                            : t("name")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {filterType === FilterType.Protocol && (
                                <Select
                                    open={isProtocolTypeDropdownOpen}
                                    onOpenChange={toggleIsProtocolTypeDropdownOpen}
                                    value={protocolType}
                                    onValueChange={v => onProtocolTypeDropdownSelect(v)}
                                    aria-label={t("selectOne")}
                                >
                                    <SelectTrigger className="kc-protocolType-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>{protocolTypeOptions}</SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <Table className="table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={
                                            rows.length === clientScopes.length && clientScopes.length > 0
                                        }
                                        onCheckedChange={checked => {
                                            if (checked) {
                                                setRows([...clientScopes]);
                                            } else {
                                                setRows([]);
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead className="w-[30%]">{t("name")}</TableHead>
                                <TableHead className="w-[25%]">{t("protocol")}</TableHead>
                                <TableHead>{t("description")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedScopes.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columnCount}
                                        className="text-center text-muted-foreground"
                                    >
                                        {t("emptyAddClientScopes")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedScopes.map(scope => (
                                    <TableRow key={scope.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={rows.some(r => r.id === scope.id)}
                                                onCheckedChange={() => toggleRowSelection(scope)}
                                            />
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {scope.name || "-"}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {getProtocolName(t, scope.protocol ?? "openid-connect")}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            {scope.description || "-"}
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
                <DialogFooter>
                    {isClientScopesConditionType ? (
                        <>
                            <Button
                                id="modal-add"
                                data-testid="confirm"
                                onClick={() => {
                                    const scopes = rows.map(scope => ({ scope }));
                                    onAdd(scopes);
                                    toggleDialog();
                                }}
                                disabled={rows.length === 0}
                            >
                                {t("add")}
                            </Button>
                            <Button
                                id="modal-cancel"
                                data-testid="cancel"
                                variant="ghost"
                                onClick={() => {
                                    setRows([]);
                                    toggleDialog();
                                }}
                            >
                                {t("cancel")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <DropdownMenu open={addToggle} onOpenChange={setAddToggle}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        id="add-dropdown"
                                        data-testid="add-dropdown"
                                        disabled={rows.length === 0}
                                    >
                                        {t("add")}
                                        <CaretUp className="size-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top">
                                    {clientScopeTypesDropdown(t, action)}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                id="modal-cancel"
                                variant="ghost"
                                onClick={() => {
                                    setRows([]);
                                    toggleDialog();
                                }}
                            >
                                {t("cancel")}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
