import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type ComponentTypeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentTypeRepresentation";
import { DirectionType } from "@keycloak/keycloak-admin-client/lib/resources/userStorageProvider";
import { getErrorDescription, getErrorMessage, HelpItem,
    KeycloakSpinner,
    TextControl,
    useFetch } from "../../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge-rd/ui/components/select";
import { useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../../../app/admin-client";
import { useConfirmDialog } from "../../../../shared/ui/confirm-dialog/confirm-dialog";
import {
    convertToName,
    DynamicComponents
} from "../../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../../shared/ui/form/form-access";

import { useRealm } from "../../../../app/providers/realm-context/realm-context";
import { convertFormValuesToObject, convertToFormValues } from "../../../../shared/lib/util";
import { useParams } from "../../../../shared/lib/useParams";
import { toUserFederationLdap } from "../../routes/user-federation-ldap";
import { UserFederationLdapMapperParams } from "../../routes/user-federation-ldap-mapper";

export default function LdapMapperDetails() {
    const { adminClient } = useAdminClient();

    const form = useForm<ComponentRepresentation>();
    const [mapping, setMapping] = useState<ComponentRepresentation>();
    const [components, setComponents] = useState<ComponentTypeRepresentation[]>();

    const { id, mapperId } = useParams<UserFederationLdapMapperParams>();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { t } = useTranslation();
const [isMapperDropdownOpen, setIsMapperDropdownOpen] = useState(false);
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    useFetch(
        async () => {
            const components = await adminClient.components.listSubComponents({
                id,
                type: "org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
            });
            if (mapperId && mapperId !== "new") {
                const fetchedMapper = await adminClient.components.findOne({
                    id: mapperId
                });
                return { components, fetchedMapper };
            }
            return { components };
        },
        ({ components, fetchedMapper }) => {
            setMapping(fetchedMapper);
            setComponents(components);
            if (mapperId !== "new" && !fetchedMapper) throw new Error(t("notFound"));

            if (fetchedMapper) setupForm(fetchedMapper);
        },
        []
    );

    const setupForm = (mapper: ComponentRepresentation) => {
        convertToFormValues(mapper, form.setValue);
    };

    const save = async (mapper: ComponentRepresentation) => {
        const component: ComponentRepresentation = convertFormValuesToObject(mapper);
        const map = {
            ...component,
            config: Object.entries(component.config || {}).reduce(
                (result, [key, value]) => {
                    result[key] = Array.isArray(value) ? value : [value];
                    return result;
                },
                {} as Record<string, string | string[]>
            )
        };

        try {
            if (mapperId === "new") {
                await adminClient.components.create(map);
                navigate({
                    to: toUserFederationLdap({ realm, id: mapper.parentId!, tab: "mappers" }) as string
                });
            } else {
                await adminClient.components.update({ id: mapperId }, map);
            }
            setupForm(map as ComponentRepresentation);
            toast.success(t(mapperId === "new" ? "mappingCreatedSuccess" : "mappingUpdatedSuccess"));
        } catch (error) {
            toast.error(
                t(mapperId === "new" ? "mappingCreatedError" : "mappingUpdatedError", { error: getErrorMessage(error) }),
                { description: getErrorDescription(error) }
            );
        }
    };

    const sync = async (direction: DirectionType) => {
        try {
            const result = await adminClient.userStorageProvider.mappersSync({
                parentId: mapping?.parentId || "",
                id: mapperId,
                direction
            });
            toast.success(t("syncLDAPGroupsSuccessful", {
                    result: result.status
                }));
        } catch (error) {
            toast.error(t("syncLDAPGroupsError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        refresh();
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteMappingTitle",
        messageKey: "deleteMappingConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    id: mapping!.id!
                });
                toast.success(t("mappingDeletedSuccess"));
                navigate({ to: toUserFederationLdap({ id, realm, tab: "mappers" }) as string });
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    const mapperType = useWatch({
        control: form.control,
        name: "providerId"
    });

    const filteredComponents = components || [];

    if (!components) {
        return <KeycloakSpinner />;
    }

    const isNew = mapperId === "new";
    const mapper = components.find(c => c.id === mapperType);

    return (
        <>
            <DeleteConfirm />
            {!isNew && (
                <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem key="delete" onClick={toggleDeleteDialog}>
                                    {t("delete")}
                                </DropdownMenuItem>
                                {mapper?.metadata.fedToKeycloakSyncSupported && (
                                    <DropdownMenuItem
                                        key="fedSync"
                                        onClick={() => sync("fedToKeycloak")}
                                    >
                                        {t(mapper.metadata.fedToKeycloakSyncMessage)}
                                    </DropdownMenuItem>
                                )}
                                {mapper?.metadata.keycloakToFedSyncSupported && (
                                    <DropdownMenuItem
                                        key="ldapSync"
                                        onClick={async () => {
                                            await sync("keycloakToFed");
                                        }}
                                    >
                                        {t(mapper.metadata.keycloakToFedSyncMessage)}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <div className="p-6 flex-1">
                <FormProvider {...form}>
                    <FormAccess
                        role="manage-realm"
                        isHorizontal
                        onSubmit={form.handleSubmit(() => save(form.getValues()))}
                    >
                        {!isNew && <TextControl name="id" label={t("id")} isDisabled />}
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("mapperNameHelp")}
                            isDisabled={!isNew}
                            rules={{ required: t("required") }}
                        />
                        <input
                            type="hidden"
                            defaultValue={isNew ? id : mapping ? mapping.parentId : ""}
                            data-testid="ldap-mapper-parentId"
                            {...form.register("parentId")}
                        />
                        <input
                            type="hidden"
                            defaultValue="org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
                            data-testid="ldap-mapper-provider-type"
                            {...form.register("providerType")}
                        />
                        {!isNew ? (
                            <TextControl
                                name="providerId"
                                label={t("mapperType")}
                                labelIcon={
                                    mapper?.helpText
                                        ? mapper.helpText
                                        : t("mapperTypeHelp")
                                }
                                rules={{ required: t("required") }}
                                isDisabled={!isNew}
                            />
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="kc-providerId">{t("mapperType")} *</Label>
                                    <HelpItem
                                        helpText={
                                            mapper?.helpText
                                                ? mapper.helpText
                                                : t("mapperTypeHelp")
                                        }
                                        fieldLabelId="mapperType"
                                    />
                                </div>
                                <Controller
                                    name="providerId"
                                    defaultValue=""
                                    control={form.control}
                                    data-testid="ldap-mapper-type-select"
                                    render={({ field }) => (
                                        <Select
                                            open={isMapperDropdownOpen}
                                            onOpenChange={setIsMapperDropdownOpen}
                                            value={field.value ?? ""}
                                            onValueChange={(value) => {
                                                setupForm({
                                                    providerId: value,
                                                    ...Object.fromEntries(
                                                        components
                                                            ?.find(c => c.id === value)
                                                            ?.properties.filter(
                                                                m => m.type === "List"
                                                            )
                                                            .map(m => [
                                                                convertToName(m.name!),
                                                                m.options?.[0]
                                                            ]) || []
                                                    )
                                                });
                                                field.onChange(value);
                                                setIsMapperDropdownOpen(false);
                                            }}
                                            aria-label={t("selectMapperType")}
                                        >
                                            <SelectTrigger id="kc-providerId">
                                                <SelectValue placeholder={t("mapperType")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredComponents.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                ></Controller>
                            </div>
                        )}

                        {!!mapperType && (
                            <DynamicComponents properties={mapper?.properties!} />
                        )}
                        <div className="flex gap-2">
                            <Button
                                disabled={!form.formState.isDirty}
                                type="submit"
                                data-testid="ldap-mapper-save"
                            >
                                {t("save")}
                            </Button>
                            <Button
                                variant="link"
                                onClick={() =>
                                    isNew
                                        ? window.history.back()
                                        : navigate({
                                              to: `/${realm}/user-federation/ldap/${
                                                  mapping!.parentId
                                              }/mappers` as string
                                          })
                                }
                                data-testid="ldap-mapper-cancel"
                            >
                                {t("cancel")}
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
