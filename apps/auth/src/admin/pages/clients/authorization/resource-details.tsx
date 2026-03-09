import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import type ResourceRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceRepresentation";
import type ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertDescription, AlertTitle } from "@merge-rd/ui/components/alert";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Label } from "@merge-rd/ui/components/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    KeycloakSpinner,
    TextControl
} from "@/shared/keycloak-ui-shared";
import { useAccess } from "@/admin/app/providers/access/access";
import { useUpdateResource, useCreateResource, useDeleteResource } from "./hooks/use-authorization-mutations";
import {
    type ResourceDetailsParams,
    toAuthorizationTab,
    toResourceDetails
} from "@/admin/shared/lib/routes/clients";
import { useParams } from "@/admin/shared/lib/use-params";
import { convertFormValuesToObject, convertToFormValues } from "@/admin/shared/lib/util";
import { useConfirmDialog } from "@/admin/shared/ui/confirm-dialog/confirm-dialog";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import type { KeyValueType } from "@/admin/shared/ui/key-value-form/key-value-convert";
import { KeyValueInput } from "@/admin/shared/ui/key-value-form/key-value-input";
import { MultiLineInput } from "@/admin/shared/ui/multi-line-input/multi-line-input";
import { DefaultSwitchControl } from "@/admin/shared/ui/switch-control";
import { useResourceDetails as useResourceDetailsQuery } from "./hooks/use-resource-details";
import { ScopePicker } from "./scope-picker";

type SubmittedResource = Omit<ResourceRepresentation, "attributes" | "scopes"> & {
    attributes: KeyValueType[];
};

export function ResourceDetails() {

    const { t } = useTranslation();
    const [client, setClient] = useState<ClientRepresentation>();
    const [resource, setResource] = useState<ResourceRepresentation>();

    const [permissions, setPermission] = useState<ResourceServerRepresentation[]>();
    const form = useForm<SubmittedResource>({
        mode: "onChange"
    });
    const { setValue, handleSubmit } = form;

    const { id, resourceId, realm } = useParams<ResourceDetailsParams>();
    const navigate = useNavigate();
    const { mutateAsync: updateResourceMutation } = useUpdateResource();
    const { mutateAsync: createResourceMutation } = useCreateResource();
    const { mutateAsync: deleteResourceMutation } = useDeleteResource();

    const setupForm = (resource: ResourceRepresentation = {}) => {
        convertToFormValues(resource, setValue);
    };

    const { hasAccess } = useAccess();

    const isDisabled = !hasAccess("manage-authorization");

    const { data: resourceDetailsData } = useResourceDetailsQuery(id, resourceId);

    useEffect(() => {
        if (resourceDetailsData) {
            const [fetchedClient, fetchedResource, fetchedPermissions] =
                resourceDetailsData;
            if (!fetchedClient) {
                throw new Error(t("notFound"));
            }
            setClient(fetchedClient);
            setPermission(fetchedPermissions);
            setResource(fetchedResource);
            setupForm(fetchedResource);
        }
    }, [resourceDetailsData]);

    const submit = async (submitted: SubmittedResource) => {
        const resource = convertFormValuesToObject<
            SubmittedResource,
            ResourceRepresentation
        >(submitted);

        try {
            if (resourceId) {
                await updateResourceMutation({ clientId: id, resourceId, resource });
            } else {
                const result = await createResourceMutation({ clientId: id, resource });
                setResource(resource);
                navigate({
                    to: toResourceDetails({
                        realm,
                        id,
                        resourceId: result._id!
                    }) as string
                });
            }
            toast.success(t(`${resourceId ? "update" : "create"}ResourceSuccess`));
        } catch (error) {
            toast.error(t("resourceSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                await deleteResourceMutation({
                    clientId: id,
                    resourceId: resourceId!
                });
                toast.success(t("resourceDeletedSuccess"));
                navigate({
                    to: toAuthorizationTab({
                        realm,
                        clientId: id,
                        tab: "resources"
                    }) as string
                });
            } catch (error) {
                toast.error(
                    t("resourceDeletedError", { error: getErrorMessage(error) }),
                    { description: getErrorDescription(error) }
                );
            }
        }
    });

    if (!client) {
        return <KeycloakSpinner />;
    }

    return (
        <>
            <DeleteConfirm />
            {resourceId && (
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
                                    data-testid="delete-resource"
                                    disabled={isDisabled}
                                    onClick={() => toggleDeleteDialog()}
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
                            <Button type="submit" data-testid="save">
                                {t("save")}
                            </Button>

                            <Button variant="link" data-testid="cancel" asChild>
                                <Link
                                    to={
                                        toAuthorizationTab({
                                            realm,
                                            clientId: id,
                                            tab: "resources"
                                        }) as string
                                    }
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
