import AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
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
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import { NameDescription } from "./form/NameDescription";
import { toFlow } from "./routes/Flow";

type DuplicateFlowModalProps = {
    name: string;
    description: string;
    toggleDialog: () => void;
    onComplete: () => void;
};

export const DuplicateFlowModal = ({
    name,
    description,
    toggleDialog,
    onComplete
}: DuplicateFlowModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<AuthenticationFlowRepresentation>({
        mode: "onChange",
        defaultValues: {
            alias: t("copyOf", { name }),
            description: description
        }
    });
    const { getValues, handleSubmit } = form;
const navigate = useNavigate();
    const { realm } = useRealm();

    const onSubmit = async () => {
        const form = getValues();
        try {
            await adminClient.authenticationManagement.copyFlow({
                flow: name,
                newName: form.alias!
            });
            const newFlow = (await adminClient.authenticationManagement.getFlows()).find(
                flow => flow.alias === form.alias
            )!;

            if (form.description !== description) {
                newFlow.description = form.description;
                await adminClient.authenticationManagement.updateFlow(
                    { flowId: newFlow.id! },
                    newFlow
                );
            }
            toast.success(t("copyFlowSuccess"));
            navigate(
                toFlow({
                    realm,
                    id: newFlow.id!,
                    usedBy: "notInUse",
                    builtIn: newFlow.builtIn ? "builtIn" : undefined
                })
            );
        } catch (error) {
            toast.error(t("copyFlowError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
        onComplete();
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open) toggleDialog(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("duplicateFlow")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form
                        id="duplicate-flow-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <NameDescription />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        key="confirm"
                        data-testid="confirm"
                        type="submit"
                        form="duplicate-flow-form"
                    >
                        {t("duplicate")}
                    </Button>
                    <Button
                        key="cancel"
                        data-testid="cancel"
                        variant="link"
                        onClick={toggleDialog}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
