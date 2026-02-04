import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useAdminClient } from "../admin-client";
import { NameDescription } from "./form/NameDescription";

type EditFlowModalProps = {
    flow: AuthenticationFlowRepresentation;
    toggleDialog: () => void;
};

export const EditFlowModal = ({ flow, toggleDialog }: EditFlowModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const form = useForm<AuthenticationFlowRepresentation>({ mode: "onChange" });
    const { reset, handleSubmit } = form;

    useEffect(() => reset(flow), [flow]);

    const onSubmit = async (formValues: AuthenticationFlowRepresentation) => {
        try {
            await adminClient.authenticationManagement.updateFlow(
                { flowId: flow.id! },
                { ...flow, ...formValues }
            );
            toast.success(t("updateFlowSuccess"));
        } catch (error) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        toggleDialog();
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("editFlow")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="edit-flow-form" onSubmit={handleSubmit(onSubmit)}>
                        <NameDescription />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="edit-flow-form"
                    >
                        {t("edit")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={() => toggleDialog()}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
