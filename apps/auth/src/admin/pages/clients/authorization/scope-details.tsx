import type ScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/scopeRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button, buttonVariants } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useUpdateAuthorizationScope, useCreateAuthorizationScope } from "./hooks/use-authorization-mutations";
import type { ScopeDetailsParams } from "../../../shared/lib/routes/clients";
import { toAuthorizationTab } from "../../../shared/lib/routes/clients";
import { useParams } from "../../../shared/lib/use-params";
import { useToggle } from "../../../shared/lib/use-toggle";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { useScopeDetails as useScopeDetailsQuery } from "./hooks/use-scope-details";
import { DeleteScopeDialog } from "./delete-scope-dialog";

type FormFields = Omit<ScopeRepresentation, "resources">;

export function ScopeDetails() {

    const { t } = useTranslation();
    const { id, scopeId, realm } = useParams<ScopeDetailsParams>();
    const navigate = useNavigate();
    const { mutateAsync: updateScopeMutation } = useUpdateAuthorizationScope();
    const { mutateAsync: createScopeMutation } = useCreateAuthorizationScope();
    const [deleteDialog, toggleDeleteDialog] = useToggle();
    const [scope, setScope] = useState<ScopeRepresentation>();
    const form = useForm<FormFields>({
        mode: "onChange"
    });
    const { reset, handleSubmit } = form;

    const { data: scopeData } = useScopeDetailsQuery(id, scopeId);

    useEffect(() => {
        if (scopeData) {
            setScope(scopeData);
            reset({ ...scopeData });
        }
    }, [scopeData]);

    const onSubmit = async (scope: ScopeRepresentation) => {
        try {
            if (scopeId) {
                await updateScopeMutation({
                    clientId: id,
                    scopeId,
                    scope
                });
                setScope(scope);
            } else {
                await createScopeMutation({
                    clientId: id,
                    scope: {
                        name: scope.name!,
                        displayName: scope.displayName,
                        iconUri: scope.iconUri
                    }
                });
                navigate({
                    to: toAuthorizationTab({
                        realm,
                        clientId: id,
                        tab: "scopes"
                    }) as string
                });
            }
            toast.success(t(`${scopeId ? "update" : "create"}ScopeSuccess`));
        } catch (error) {
            toast.error(t("scopeSaveError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
                    navigate({
                        to: toAuthorizationTab({
                            realm,
                            clientId: id,
                            tab: "scopes"
                        }) as string
                    })
                }
            />
            {scopeId && (
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
                            <Button type="submit" data-testid="save">
                                {t("save")}
                            </Button>

                            {!scope ? (
                                <Button variant="link" data-testid="cancel" asChild>
                                    <Link
                                        to={
                                            toAuthorizationTab({
                                                realm,
                                                clientId: id,
                                                tab: "scopes"
                                            }) as string
                                        }
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
