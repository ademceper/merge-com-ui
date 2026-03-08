import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { toFlow } from "../../shared/lib/routes/authentication";
import { useDuplicateFlow } from "./hooks/use-duplicate-flow";
import { NameDescription } from "./form/name-description";

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
    const { mutateAsync: duplicateFlow } = useDuplicateFlow();

    const onSubmit = async () => {
        const formData = getValues();
        try {
            const newFlow = await duplicateFlow({
                flow: name,
                newName: formData.alias!,
                description: formData.description,
                originalDescription: description
            });
            toast.success(t("copyFlowSuccess"));
            navigate({
                to: toFlow({
                    realm,
                    id: newFlow.id!,
                    usedBy: "notInUse",
                    builtIn: newFlow.builtIn ? "builtIn" : undefined
                }) as string
            });
        } catch (error) {
            toast.error(t("copyFlowError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
        onComplete();
    };

    return (
        <Dialog
            open
            onOpenChange={open => {
                if (!open) toggleDialog();
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("duplicateFlow")}</DialogTitle>
                </DialogHeader>
                <FormProvider {...form}>
                    <form id="duplicate-flow-form" onSubmit={handleSubmit(onSubmit)}>
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
