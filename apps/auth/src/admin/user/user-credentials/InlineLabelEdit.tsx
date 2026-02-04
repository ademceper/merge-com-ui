import type CredentialRepresentation from "@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Check, PencilSimple, X } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";

type UserLabelForm = {
    userLabel: string;
};

type InlineLabelEditProps = {
    userId: string;
    credential: CredentialRepresentation;
    isEditable: boolean;
    toggle: () => void;
};

export const InlineLabelEdit = ({
    userId,
    credential,
    isEditable,
    toggle
}: InlineLabelEditProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const { register, handleSubmit } = useForm<UserLabelForm>();
const saveUserLabel = async (userLabel: UserLabelForm) => {
        try {
            await adminClient.users.updateCredentialLabel(
                {
                    id: userId,
                    credentialId: credential.id!
                },
                userLabel.userLabel || ""
            );
            toast.success(t("updateCredentialUserLabelSuccess"));
            toggle();
        } catch (error) {
            toast.error(t("updateCredentialUserLabelError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <form
            className="kc-form-userLabel"
            onSubmit={handleSubmit(saveUserLabel)}
        >
            <div className="space-y-2 kc-userLabel-row">
                <div className="kc-form-group-userLabel">
                    {isEditable ? (
                        <>
                            <Input
                                data-testid="userLabelFld"
                                defaultValue={credential.userLabel}
                                className="kc-userLabel"
                                aria-label={t("userLabel")}
                                {...register("userLabel")}
                            />
                            <div className="kc-userLabel-actionBtns">
                                <Button
                                    data-testid="editUserLabelAcceptBtn"
                                    variant="link"
                                    className="kc-editUserLabelAcceptBtn"
                                    aria-label={t("acceptBtn")}
                                    type="submit"
                                >
                                    <Check className="size-4" />
                                </Button>
                                <Button
                                    data-testid="editUserLabelCancelBtn"
                                    variant="link"
                                    className="kc-editUserLabel-cancelBtn"
                                    aria-label={t("cancelBtn")}
                                    onClick={toggle}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {credential.userLabel}
                            <Button
                                aria-label={t("editUserLabel")}
                                variant="link"
                                className="kc-editUserLabel-btn"
                                onClick={toggle}
                                data-testid="editUserLabelBtn"
                            >
                                <PencilSimple className="size-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </form>
    );
};
