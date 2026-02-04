import type FederatedIdentityRepresentation from "@keycloak/keycloak-admin-client/lib/defs/federatedIdentityRepresentation";
import { Button } from "@merge/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@merge/ui/components/dialog";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { capitalize } from "lodash-es";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextControl } from "../../shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";

type UserIdpModalProps = {
    userId: string;
    federatedId: string;
    onClose: () => void;
    onRefresh: () => void;
};

export const UserIdpModal = ({
    userId,
    federatedId,
    onClose,
    onRefresh
}: UserIdpModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const form = useForm<FederatedIdentityRepresentation>({
        mode: "onChange"
    });
    const {
        handleSubmit,
        formState: { isValid }
    } = form;

    const onSubmit = async (federatedIdentity: FederatedIdentityRepresentation) => {
        try {
            await adminClient.users.addToFederatedIdentity({
                id: userId,
                federatedIdentityId: federatedId,
                federatedIdentity
            });
            toast.success(t("idpLinkSuccess"));
            onClose();
            onRefresh();
        } catch (error) {
            toast.error(t("couldNotLinkIdP", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t("linkAccountTitle", {
                            provider: capitalize(federatedId)
                        })}
                    </DialogTitle>
                </DialogHeader>
                <form id="group-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormProvider {...form}>
                        <div className="space-y-2">
                            <Label htmlFor="identityProvider">{t("identityProvider")}</Label>
                            <Input
                                id="identityProvider"
                                data-testid="idpNameInput"
                                value={capitalize(federatedId)}
                                readOnly
                            />
                        </div>
                        <TextControl
                            name="userId"
                            label={t("userID")}
                            helperText={t("userIdHelperText")}
                            autoFocus
                            rules={{
                                required: t("required")
                            }}
                        />
                        <TextControl
                            name="userName"
                            label={t("username")}
                            helperText={t("usernameHelperText")}
                            rules={{
                                required: t("required")
                            }}
                        />
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="group-form"
                        disabled={!isValid}
                    >
                        {t("link")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={onClose}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
