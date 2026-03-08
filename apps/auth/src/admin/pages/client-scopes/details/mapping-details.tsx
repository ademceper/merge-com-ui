import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { useServerInfo } from "../../../app/providers/server-info/server-info-provider";
import { useParams } from "../../../shared/lib/useParams";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { toDedicatedScope } from "../../../shared/lib/routes/clients";
import { useProtocolMapper } from "../api/use-protocol-mapper";
import { toClientScope } from "../../../shared/lib/routes/client-scopes";
import type { MapperParams } from "../../../shared/lib/routes/client-scopes";

export default function MappingDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id, mapperId, viewMode } = useParams<MapperParams>();
    const form = useForm();
    const { setValue, handleSubmit } = form;
    const [mapping, setMapping] = useState<ProtocolMapperTypeRepresentation>();
    const [config, setConfig] = useState<{
        protocol?: string;
        protocolMapper?: string;
    }>();

    const navigate = useNavigate();
    const { realm } = useRealm();
    const serverInfo = useServerInfo();
    const isUpdating = viewMode === "edit";

    const location = useLocation();
    const isOnClientScope = location.pathname.includes("/client-scopes/");
    const toDetails = () =>
        isOnClientScope
            ? toClientScope({ realm, id, tab: "mappers" })
            : toDedicatedScope({ realm, clientId: id, tab: "mappers" });

    const { query: mapperQuery } = useProtocolMapper(
        id,
        mapperId,
        isUpdating,
        isOnClientScope
    );

    useEffect(() => {
        if (mapperQuery.data) {
            const { config: fetchedConfig, data: fetchedData } = mapperQuery.data;
            setConfig(fetchedConfig);
            if (fetchedData) {
                const mapperTypes =
                    serverInfo.protocolMapperTypes![fetchedData.protocol!];
                const foundMapping = mapperTypes.find(
                    type => type.id === fetchedData.protocolMapper
                );
                setMapping(foundMapping);
                convertToFormValues(fetchedData, setValue);
            } else {
                // New mapper mode
                const protocolMappers =
                    serverInfo.protocolMapperTypes![fetchedConfig.protocol!];
                const foundMapping = protocolMappers.find(
                    mapper => mapper.id === mapperId
                );
                setMapping(foundMapping);
            }
        }
    }, [mapperQuery.data]);

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteMappingTitle",
        messageKey: "deleteMappingConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                if (isOnClientScope) {
                    await adminClient.clientScopes.delProtocolMapper({
                        id,
                        mapperId
                    });
                } else {
                    await adminClient.clients.delProtocolMapper({
                        id,
                        mapperId
                    });
                }
                toast.success(t("mappingDeletedSuccess"));
                navigate({ to: toDetails() as string });
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const save = async (formMapping: ProtocolMapperRepresentation) => {
        const key = isUpdating ? "Updated" : "Created";
        try {
            const mapping = { ...config, ...convertFormValuesToObject(formMapping) };
            if (isUpdating) {
                if (isOnClientScope) {
                    await adminClient.clientScopes.updateProtocolMapper(
                        { id, mapperId },
                        { id: mapperId, ...mapping }
                    );
                } else {
                    await adminClient.clients.updateProtocolMapper(
                        { id, mapperId },
                        { id: mapperId, ...mapping }
                    );
                }
            } else {
                if (isOnClientScope) {
                    await adminClient.clientScopes.addProtocolMapper({ id }, mapping);
                } else {
                    await adminClient.clients.addProtocolMapper({ id }, mapping);
                }
            }
            toast.success(t(`mapping${key}Success`));
            if (!isUpdating) {
                navigate({ to: toDetails() as string });
            }
        } catch (error) {
            toast.error(t(`mapping${key}Error`, { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <>
            <DeleteConfirm />
            {isUpdating && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                data-testid="action-dropdown"
                                className={buttonVariants()}
                            >
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    key="delete"
                                    onClick={toggleDeleteDialog}
                                >
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        isHorizontal
                        onSubmit={handleSubmit(save)}
                        role="manage-clients"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="mapperType">{t("mapperType")}</Label>
                            <Input
                                type="text"
                                id="mapperType"
                                name="mapperType"
                                readOnly
                                value={mapping?.name}
                            />
                        </div>
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("mapperNameHelp")}
                            readOnlyVariant={isUpdating ? "default" : undefined}
                            rules={{ required: t("required") }}
                        />
                        <DynamicComponents
                            properties={mapping?.properties || []}
                            isNew={!isUpdating}
                            stringify
                        />
                        <div className="flex gap-2">
                            <Button type="submit" data-testid="save">
                                {t("save")}
                            </Button>
                            <Button data-testid="cancel" variant="link" asChild>
                                <Link to={toDetails() as string}>{t("cancel")}</Link>
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
