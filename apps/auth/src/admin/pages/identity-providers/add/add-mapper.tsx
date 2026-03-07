import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type { IdentityProviderMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperTypeRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../../app/admin-client";
import { useConfirmDialog } from "../../../shared/ui/confirm-dialog/confirm-dialog";
import { DynamicComponents } from "../../../shared/ui/dynamic/dynamic-components";
import { FormAccess } from "../../../shared/ui/form/form-access";
import type { AttributeForm } from "../../../shared/ui/key-value-form/attribute-form";
import { KeycloakSpinner } from "../../../../shared/keycloak-ui-shared";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import useLocaleSort, { mapByKey } from "../../../shared/lib/useLocaleSort";
import { useParams } from "../../../shared/lib/useParams";
import {
    IdentityProviderEditMapperParams,
    toIdentityProviderEditMapper
} from "../routes/edit-mapper";
import { toIdentityProvider } from "../routes/identity-provider";
import { AddMapperForm } from "./add-mapper-form";

export type IdPMapperRepresentationWithAttributes = IdentityProviderMapperRepresentation &
    AttributeForm;

export type Role = RoleRepresentation & {
    clientId?: string;
};

export default function AddMapper() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const form = useForm<IdPMapperRepresentationWithAttributes>({
        shouldUnregister: true
    });
    const { handleSubmit } = form;
const navigate = useNavigate();
    const localeSort = useLocaleSort();

    const { realm } = useRealm();

    const { id, providerId, alias } = useParams<IdentityProviderEditMapperParams>();

    const [mapperTypes, setMapperTypes] =
        useState<IdentityProviderMapperTypeRepresentation[]>();

    const [currentMapper, setCurrentMapper] =
        useState<IdentityProviderMapperTypeRepresentation>();

    const save = async (idpMapper: IdentityProviderMapperRepresentation) => {
        const mapper = convertFormValuesToObject(idpMapper);

        const identityProviderMapper = {
            ...mapper,
            config: {
                ...mapper.config
            },
            identityProviderAlias: alias!
        };

        if (id) {
            try {
                await adminClient.identityProviders.updateMapper(
                    {
                        id: id!,
                        alias: alias!
                    },
                    { ...identityProviderMapper, id }
                );
                toast.success(t("mapperSaveSuccess"));
            } catch (error) {
                toast.error(t("mapperSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        } else {
            try {
                const createdMapper = await adminClient.identityProviders.createMapper({
                    identityProviderMapper,
                    alias: alias!
                });

                toast.success(t("mapperCreateSuccess"));
                navigate({
                    to: toIdentityProviderEditMapper({
                        realm,
                        alias,
                        providerId: providerId,
                        id: createdMapper.id
                    }) as string
                });
            } catch (error) {
                toast.error(t("mapperCreateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    };

    const [toggleDeleteMapperDialog, DeleteMapperConfirm] = useConfirmDialog({
        titleKey: "deleteProviderMapper",
        messageKey: t("deleteMapperConfirm", {
            mapper: currentMapper?.name
        }),
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.identityProviders.delMapper({
                    alias: alias,
                    id: id!
                });
                toast.success(t("deleteMapperSuccess"));
                navigate({
                    to: toIdentityProvider({ providerId, alias, tab: "mappers", realm }) as string
                });
            } catch (error) {
                toast.error(t("deleteErrorIdentityProvider", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    useFetch(
        () =>
            Promise.all([
                id ? adminClient.identityProviders.findOneMapper({ alias, id }) : null,
                adminClient.identityProviders.findMapperTypes({ alias })
            ]),
        ([mapper, mapperTypes]) => {
            const mappers = localeSort(Object.values(mapperTypes), mapByKey("name"));
            if (mapper) {
                setCurrentMapper(
                    mappers.find(({ id }) => id === mapper.identityProviderMapper)
                );
                setupForm(mapper);
            } else {
                setCurrentMapper(mappers[0]);
            }

            setMapperTypes(mappers);
        },
        [id]
    );

    const setupForm = (mapper: IdentityProviderMapperRepresentation) => {
        convertToFormValues(mapper, form.setValue);
    };

    if (!mapperTypes || !currentMapper) {
        return <KeycloakSpinner />;
    }

    return (
        <div className="p-6">
            <DeleteMapperConfirm />
            {id && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem key="delete" onClick={toggleDeleteMapperDialog}>
                                    {t("delete")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            <FormAccess
                role="manage-identity-providers"
                isHorizontal
                onSubmit={handleSubmit(save)}
                className="mt-6"
            >
                <FormProvider {...form}>
                    {id && (
                        <TextControl
                            name="id"
                            label={t("id")}
                            readOnly
                            rules={{
                                required: t("required")
                            }}
                        />
                    )}
                    {currentMapper.properties && (
                        <>
                            <AddMapperForm
                                form={form}
                                id={id}
                                mapperTypes={mapperTypes}
                                updateMapperType={setCurrentMapper}
                                mapperType={currentMapper}
                            />

                            <DynamicComponents properties={currentMapper.properties!} />
                        </>
                    )}
                </FormProvider>
                <div className="flex gap-2">
                    <Button
                        data-testid="new-mapper-save-button"
                        type="submit"
                    >
                        {t("save")}
                    </Button>
                    <Button
                        data-testid="new-mapper-cancel-button"
                        variant="link"
                        asChild
                    >
                        <Link
                            to={toIdentityProvider({
                                realm,
                                providerId,
                                alias: alias!,
                                tab: "mappers"
                            }) as string}
                        >
                            {t("cancel")}
                        </Link>
                    </Button>
                </div>
            </FormAccess>
        </div>
    );
}
