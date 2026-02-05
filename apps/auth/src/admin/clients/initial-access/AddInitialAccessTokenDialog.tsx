import type ClientInitialAccessPresentation from "@keycloak/keycloak-admin-client/lib/defs/clientInitialAccessPresentation";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@merge/ui/components/dialog";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { useRealm } from "../../context/realm-context/RealmContext";
import { NumberInput } from "@merge/ui/components/number-input";
import { TimeSelector } from "../../components/time-selector/TimeSelector";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { FormErrorText, HelpItem } from "../../../shared/keycloak-ui-shared";
import { AccessTokenDialog } from "./AccessTokenDialog";

type AddInitialAccessTokenDialogProps = {
    trigger: React.ReactNode;
    onSuccess?: () => void;
};

export function AddInitialAccessTokenDialog({ trigger, onSuccess }: AddInitialAccessTokenDialogProps) {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();
    const [open, setOpen] = useState(false);
    const [token, setToken] = useState("");

    const form = useForm({ mode: "onChange" });
    const { handleSubmit, formState: { isValid, isSubmitting, isValidating } } = form;

    const save = async (clientToken: ClientInitialAccessPresentation) => {
        try {
            const access = await adminClient.realms.createClientsInitialAccess(
                { realm },
                clientToken
            );
            setOpen(false);
            setToken(access.token!);
        } catch (error) {
            toast.error(t("tokenSaveError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const onTokenDialogClose = () => {
        setToken("");
        toast.success(t("tokenSaveSuccess"));
        onSuccess?.();
    };

    return (
        <>
            {token && (
                <AccessTokenDialog
                    token={token}
                    toggleDialog={onTokenDialogClose}
                />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <FormProvider {...form}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t("createToken")}</DialogTitle>
                        </DialogHeader>
                        <FormAccess
                            id="create-initial-access-token-form"
                            role="create-client"
                            onSubmit={handleSubmit(save)}
                            isHorizontal
                        >
                            <div className="flex flex-col gap-5">
                                <div className="space-y-2">
                                    <div className="flex w-full items-center gap-2">
                                        <Controller
                                            name="expiration"
                                            control={form.control}
                                            defaultValue={86400}
                                            rules={{
                                                min: {
                                                    value: 1,
                                                    message: t("expirationValueNotValid")
                                                }
                                            }}
                                            render={({ field, fieldState }) => (
                                                <TimeSelector
                                                    id="expiration"
                                                    data-testid="expiration"
                                                    fullWidth
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    validated={fieldState.invalid ? "error" : "default"}
                                                />
                                            )}
                                        />
                                        <HelpItem helpText={t("tokenExpirationHelp")} fieldLabelId="expiration" />
                                    </div>
                                    {form.formState.errors.expiration && (
                                        <FormErrorText
                                            data-testid="expiration-helper"
                                            message={form.formState.errors.expiration.message as string}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex w-full items-center gap-2">
                                        <Controller
                                            name="count"
                                            control={form.control}
                                            defaultValue={1}
                                            rules={{ min: 1 }}
                                            render={({ field }) => (
                                                <NumberInput
                                                    id="count"
                                                    data-testid="count"
                                                    className="w-full"
                                                    min={1}
                                                    value={field.value ?? ""}
                                                    onChange={(v) => field.onChange(v === "" ? 1 : v)}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                />
                                            )}
                                        />
                                        <HelpItem helpText={t("countHelp")} fieldLabelId="count" />
                                    </div>
                                    {form.formState.errors.count && (
                                        <FormErrorText
                                            data-testid="count-helper"
                                            message={form.formState.errors.count.message as string}
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <MultiLineInput
                                        id="kc-web-origins"
                                        name="webOrigins"
                                        aria-label={t("webOrigins")}
                                        addButtonLabel="addWebOrigins"
                                        placeholder={t("webOrigins")}
                                        labelIcon={t("webOriginsHelp")}
                                    />
                                </div>
                            </div>
                        </FormAccess>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="submit"
                                form="create-initial-access-token-form"
                                data-testid="save"
                                disabled={!isValid || isSubmitting || isValidating}
                            >
                                {t("save")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </FormProvider>
            </Dialog>
        </>
    );
}
