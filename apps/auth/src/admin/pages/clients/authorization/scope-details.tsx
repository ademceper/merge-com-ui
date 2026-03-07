import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { getErrorDescription, getErrorMessage, TextControl, useFetch } from "../../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge-rd/ui/components/dropdown-menu";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../../app/admin-client";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useParams } from "../../../shared/lib/useParams";
import useToggle from "../../../shared/lib/useToggle";
import { toAuthorizationTab } from "../routes/authentication-tab";
import type { ScopeDetailsParams } from "../routes/scope";
import { DeleteScopeDialog } from "./delete-scope-dialog";

type FormFields = Omit<ScopeRepresentation, "resources">;

export default function ScopeDetails() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { id, scopeId, realm } = useParams<ScopeDetailsParams>();
    const navigate = useNavigate();
const [deleteDialog, toggleDeleteDialog] = useToggle();
    const [scope, setScope] = useState<ScopeRepresentation>();
    const form = useForm<FormFields>({
        mode: "onChange"
    });
    const { reset, handleSubmit } = form;

    useFetch(
        async () => {
            if (scopeId) {
                const scope = await adminClient.clients.getAuthorizationScope({
                    id,
                    scopeId
                });
                if (!scope) {
                    throw new Error(t("notFound"));
                }
                return scope;
            }
        },
        scope => {
            setScope(scope);
            reset({ ...scope });
        },
        []
    );

    const onSubmit = async (scope: ScopeRepresentation) => {
        try {
            if (scopeId) {
                await adminClient.clients.updateAuthorizationScope(
                    { id, scopeId },
                    scope
                );
                setScope(scope);
            } else {
                await adminClient.clients.createAuthorizationScope(
                    { id },
                    {
                        name: scope.name!,
                        displayName: scope.displayName,
                        iconUri: scope.iconUri
                    }
                );
                navigate({ to: toAuthorizationTab({ realm, clientId: id, tab: "scopes" }) as string });
            }
            toast.success(
                t((scopeId ? "update" : "create") + "ScopeSuccess")
            );
        } catch (error) {
            toast.error(t("scopeSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
            <DeleteScopeDialog
                clientId={id}
                open={deleteDialog}
                toggleDialog={toggleDeleteDialog}
                selectedScope={scope}
                refresh={() =>
                    navigate({ to: toAuthorizationTab({ realm, clientId: id, tab: "scopes" }) as string })
                }
            />
            {scopeId && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2" />
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger data-testid="action-dropdown" className={buttonVariants()}>
                                {t("action")}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    key="delete"
                                    data-testid="delete-resource"
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
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <TextControl
                            name="name"
                            label={t("name")}
                            labelIcon={t("scopeNameHelp")}
                            rules={{ required: t("required") }}
                        />
                        <TextControl
                            name="displayName"
                            label={t("displayName")}
                            labelIcon={t("scopeDisplayNameHelp")}
                        />
                        <TextControl
                            name="iconUri"
                            label={t("iconUri")}
                            labelIcon={t("iconUriHelp")}
                        />
                        <div className="flex gap-2 mt-4">
                            <Button
                                type="submit"
                                data-testid="save"
                            >
                                {t("save")}
                            </Button>

                            {!scope ? (
                                <Button
                                    variant="link"
                                    data-testid="cancel"
                                    asChild
                                >
                                    <Link
                                        to={toAuthorizationTab({
                                            realm,
                                            clientId: id,
                                            tab: "scopes"
                                        }) as string}
                                    >
                                        {t("cancel")}
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    variant="link"
                                    data-testid="revert"
                                    onClick={() => reset({ ...scope })}
                                >
                                    {t("revert")}
                                </Button>
                            )}
                        </div>
                    </FormAccess>
                </FormProvider>
            </div>
        </>
    );
}
