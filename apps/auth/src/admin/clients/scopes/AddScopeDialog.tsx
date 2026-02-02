/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/scopes/AddScopeDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import { KeycloakSelect } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
const SelectOption = ({ value, children, ...props }: any) => <option value={value} {...props}>{children}</option>;
import { CaretDown, CaretUp, Funnel } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ClientScopeType,
    clientScopeTypesDropdown
} from "../../components/client-scope/ClientScopeTypes";
import { ListEmptyState } from "../../../shared/keycloak-ui-shared";
import { KeycloakDataTable } from "../../../shared/keycloak-ui-shared";
import useToggle from "../../utils/useToggle";
import { getProtocolName } from "../utils";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";


export type AddScopeDialogProps = {
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
            <SelectOption key={1} value={ProtocolType.SAML}>
                {t("protocolTypes.saml")}
            </SelectOption>,
            <SelectOption key={2} value={ProtocolType.OpenIDConnect}>
                {t("protocolTypes.openid-connect")}
            </SelectOption>
        ];

        if (isOid4vcEnabled) {
            options.push(
                <SelectOption key={3} value={ProtocolType.OID4VC}>
                    {t("protocolTypes.oid4vc")}
                </SelectOption>
            );
        }

        options.push(
            <SelectOption key={4} value={ProtocolType.All}>
                {t("protocolTypes.all")}
            </SelectOption>
        );

        return options;
    }, [t, isOid4vcEnabled]);

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
                <KeycloakDataTable
                loader={clientScopes}
                ariaLabelKey="chooseAMapperType"
                searchPlaceholderKey={
                    filterType === FilterType.Name ? "searchForClientScope" : undefined
                }
                isSearching={filterType !== FilterType.Name}
                searchTypeComponent={
                    <DropdownMenu open={isFilterTypeDropdownOpen} onOpenChange={toggleIsFilterTypeDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                data-testid="filter-type-dropdown"
                                id="toggle-id-9"
                                variant="outline"
                            >
                                <Funnel className="size-4 mr-1" />
                                {filterType}
                                <CaretDown className="size-4 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                data-testid="filter-type-dropdown-item"
                                onClick={() => onFilterTypeDropdownSelect(filterType)}
                            >
                                {filterType === FilterType.Name
                                    ? t("protocol")
                                    : t("name")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
                toolbarItem={
                    filterType === FilterType.Protocol && (
                        <>
                            <DropdownMenu open={isFilterTypeDropdownOpen} onOpenChange={toggleIsFilterTypeDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" data-testid="filter-type-dropdown" id="toggle-id-9">
                                        <Funnel className="size-4 mr-1" />
                                        {filterType}
                                        <CaretDown className="size-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        data-testid="filter-type-dropdown-item"
                                        onClick={() => onFilterTypeDropdownSelect(filterType)}
                                    >
                                        {t("name")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <KeycloakSelect
                                className="kc-protocolType-select"
                                aria-label={t("selectOne")}
                                onToggle={toggleIsProtocolTypeDropdownOpen}
                                onSelect={value =>
                                    onProtocolTypeDropdownSelect(value.toString())
                                }
                                selections={protocolType}
                                isOpen={isProtocolTypeDropdownOpen}
                            >
                                {protocolTypeOptions}
                            </KeycloakSelect>
                        </>
                    )
                }
                canSelectAll
                onSelect={rows => setRows(rows)}
                columns={[
                    {
                        name: "name"
                    },
                    {
                        name: "protocol",
                        displayKey: "protocol",
                        cellRenderer: client =>
                            getProtocolName(t, client.protocol ?? "openid-connect")
                    },
                    {
                        name: "description"
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyAddClientScopes")}
                        instructions={t("emptyAddClientScopesInstructions")}
                    />
                }
            />
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
