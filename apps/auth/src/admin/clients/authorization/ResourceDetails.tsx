/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/authorization/ResourceDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import {
    HelpItem,
    TextControl,
    useAlerts,
    useFetch
} from "../../../shared/keycloak-ui-shared";
import { AlertVariant } from "../../../shared/keycloak-ui-shared";
import { Alert, AlertDescription, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Label } from "@merge/ui/components/label";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { DefaultSwitchControl } from "../../components/SwitchControl";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { FormAccess } from "../../components/form/FormAccess";
import { KeyValueInput } from "../../components/key-value-form/KeyValueInput";
import type { KeyValueType } from "../../components/key-value-form/key-value-convert";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { ViewHeader } from "../../components/view-header/ViewHeader";
import { useAccess } from "../../context/access/Access";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import { useParams } from "../../utils/useParams";
import { toAuthorizationTab } from "../routes/AuthenticationTab";
import { ResourceDetailsParams, toResourceDetails } from "../routes/Resource";
import { ScopePicker } from "./ScopePicker";

type SubmittedResource = Omit<ResourceRepresentation, "attributes" | "scopes"> & {
    attributes: KeyValueType[];
};

export default function ResourceDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const [client, setClient] = useState<ClientRepresentation>();
    const [resource, setResource] = useState<ResourceRepresentation>();

    const [permissions, setPermission] = useState<ResourceServerRepresentation[]>();

    const { addAlert, addError } = useAlerts();
    const form = useForm<SubmittedResource>({
        mode: "onChange"
    });
    const { setValue, handleSubmit } = form;

    const { id, resourceId, realm } = useParams<ResourceDetailsParams>();
    const navigate = useNavigate();

    const setupForm = (resource: ResourceRepresentation = {}) => {
        convertToFormValues(resource, setValue);
    };

    const { hasAccess } = useAccess();

    const isDisabled = !hasAccess("manage-authorization");

    useFetch(
        () =>
            Promise.all([
                adminClient.clients.findOne({ id }),
                resourceId
                    ? adminClient.clients.getResource({ id, resourceId })
                    : Promise.resolve(undefined),
                resourceId
                    ? adminClient.clients.listPermissionsByResource({ id, resourceId })
                    : Promise.resolve(undefined)
            ]),
        ([client, resource, permissions]) => {
            if (!client) {
                throw new Error(t("notFound"));
            }
            setClient(client);
            setPermission(permissions);
            setResource(resource);
            setupForm(resource);
        },
        []
    );

    const submit = async (submitted: SubmittedResource) => {
        const resource = convertFormValuesToObject<
            SubmittedResource,
            ResourceRepresentation
        >(submitted);

        try {
            if (resourceId) {
                await adminClient.clients.updateResource({ id, resourceId }, resource);
            } else {
                const result = await adminClient.clients.createResource({ id }, resource);
                setResource(resource);
                navigate(toResourceDetails({ realm, id, resourceId: result._id! }));
            }
            addAlert(
                t((resourceId ? "update" : "create") + "ResourceSuccess"),
                AlertVariant.success
            );
        } catch (error) {
            addError("resourceSaveError", error);
        }
    };

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: "deleteResource",
        children: (
            <>
                {t("deleteResourceConfirm")}
                {permissions?.length !== 0 && (
                    <Alert variant="destructive" className="pt-4">
                        <AlertTitle>{t("deleteResourceWarning")}</AlertTitle>
                        <AlertDescription>
                        <p className="pt-1">
                            {permissions?.map(permission => (
                                <strong key={permission.id} className="pr-2">
                                    {permission.name}
                                </strong>
                            ))}
                        </p>
                        </AlertDescription>
                    </Alert>
                )}
            </>
        ),
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.clients.delResource({
                    id,
                    resourceId: resourceId!
                });
                addAlert(t("resourceDeletedSuccess"), AlertVariant.success);
                navigate(toAuthorizationTab({ realm, clientId: id, tab: "resources" }));
            } catch (error) {
                addError("resourceDeletedError", error);
            }
        }
    });

    if (!client) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            <ViewHeader
                titleKey={resourceId ? resource?.name! : "createResource"}
                dropdownItems={
                    resourceId
                        ? [
                              <DropdownMenuItem
                                  key="delete"
                                  data-testid="delete-resource"
                                  isDisabled={isDisabled}
                                  onClick={() => toggleDeleteDialog()}
                              >
                                  {t("delete")}
                              </DropdownMenuItem>
                          ]
                        : undefined
                }
            />
            <div className="p-6">
                <FormProvider {...form}>
                    <FormAccess
                        isHorizontal
                        role="manage-authorization"
                        className="keycloak__resource-details__form"
                        onSubmit={handleSubmit(submit)}
                    >
                        <TextControl
                            name={resourceId ? "owner.name" : ""}
                            label={t("owner")}
                            labelIcon={t("ownerHelp")}
                            defaultValue={client.clientId}
                            readOnly
                        />
                        <TextControl
                            name={"name"}
                            label={t("name")}
                            labelIcon={t("resourceNameHelp")}
                            rules={{ required: t("required") }}
                        />
                        <TextControl
                            name="displayName"
                            label={t("displayName")}
                            labelIcon={t("displayNameHelp")}
                            rules={{ required: t("required") }}
                        />
                        <TextControl
                            name="type"
                            label={t("type")}
                            labelIcon={t("resourceDetailsTypeHelp")}
                        />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("uris")}</Label>
                                <HelpItem helpText={t("urisHelp")} fieldLabelId="uris" />
                            </div>
                            <MultiLineInput
                                name="uris"
                                type="url"
                                aria-label={t("uris")}
                                addButtonLabel="addUri"
                            />
                        </div>
                        <ScopePicker clientId={id} />
                        <TextControl
                            name="icon_uri"
                            label={t("iconUri")}
                            labelIcon={t("iconUriHelp")}
                            type="url"
                        />
                        <DefaultSwitchControl
                            name="ownerManagedAccess"
                            label={t("ownerManagedAccess")}
                            labelIcon={t("ownerManagedAccessHelp")}
                        />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label>{t("resourceAttribute")}</Label>
                                <HelpItem
                                    helpText={t("resourceAttributeHelp")}
                                    fieldLabelId="resourceAttribute"
                                />
                            </div>
                            <KeyValueInput name="attributes" isDisabled={isDisabled} />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="submit"
                                data-testid="save"
                            >
                                {t("save")}
                            </Button>

                            <Button
                                variant="link"
                                data-testid="cancel"
                                asChild
                            >
                                <Link
                                    to={toAuthorizationTab({
                                        realm,
                                        clientId: id,
                                        tab: "resources"
                                    })}
                                >
                                    {t("cancel")}
                                </Link>
                            </Button>
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
