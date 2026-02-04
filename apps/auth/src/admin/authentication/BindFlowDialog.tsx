import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { getErrorDescription, getErrorMessage, SelectControl } from "../../shared/keycloak-ui-shared";
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
import { useAdminClient } from "../admin-client";
import { useRealm } from "../context/realm-context/RealmContext";
import { REALM_FLOWS } from "./constants";

type BindingForm = {
    bindingType: keyof RealmRepresentation;
};

type BindFlowDialogProps = {
    flowAlias: string;
    onClose: (used?: boolean) => void;
};

export const BindFlowDialog = ({ flowAlias, onClose }: BindFlowDialogProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<BindingForm>();
const { realm, realmRepresentation: realmRep, refresh } = useRealm();

    const onSubmit = async ({ bindingType }: BindingForm) => {
        try {
            await adminClient.realms.update(
                { realm },
                { ...realmRep, [bindingType]: flowAlias }
            );
            refresh();
            toast.success(t("updateFlowSuccess"));
        } catch (error) {
            toast.error(t("updateFlowError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }

        onClose(true);
    };

    const flowKeys = Array.from(REALM_FLOWS.keys());

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("bindFlow")}</DialogTitle>
                </DialogHeader>
                <form id="bind-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormProvider {...form}>
                        <SelectControl
                            id="chooseBindingType"
                            name="bindingType"
                            label={t("chooseBindingType")}
                            options={flowKeys
                                .filter(f => f !== "dockerAuthenticationFlow")
                                .map(key => ({
                                    key,
                                    value: t(`flow.${REALM_FLOWS.get(key)}`)
                                }))}
                            controller={{ defaultValue: flowKeys[0] }}
                            menuAppendTo="parent"
                            aria-label={t("chooseBindingType")}
                        />
                    </FormProvider>
                </form>
                <DialogFooter>
                    <Button key="confirm" data-testid="save" type="submit" form="bind-form">
                        {t("save")}
                    </Button>
                    <Button
                        data-testid="cancel"
                        key="cancel"
                        variant="link"
                        onClick={() => onClose()}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
