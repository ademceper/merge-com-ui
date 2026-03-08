import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    TextControl
} from "../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../app/admin-client";
import { useWhoAmI } from "../../../app/providers/whoami/who-am-i";
import { convertFormValuesToObject, convertToFormValues } from "../../../shared/lib/util";
import { FormAccess } from "../../../shared/ui/form/form-access";
import { JsonFileUpload } from "../../../shared/ui/json-file-upload/json-file-upload";
import { DefaultSwitchControl } from "../../../shared/ui/switch-control";
import { toRealm } from "../realm-routes";

type NewRealmFormProps = {
    onClose: () => void;
};

export default function NewRealmForm({ onClose }: NewRealmFormProps) {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refresh, whoAmI } = useWhoAmI();
    const [realm, setRealm] = useState<RealmRepresentation>();

    const form = useForm<RealmRepresentation>({
        mode: "onChange"
    });

    const { handleSubmit, setValue, formState } = form;

    const handleFileChange = (obj?: object) => {
        const defaultRealm = { id: "", realm: "", enabled: true };
        convertToFormValues(obj || defaultRealm, setValue);
        setRealm(obj || defaultRealm);
    };

    const save = async (fields: RealmRepresentation) => {
        try {
            await adminClient.realms.create({
                ...realm,
                ...convertFormValuesToObject(fields)
            });
            toast.success(t("saveRealmSuccess"));

            refresh();
            onClose();
            navigate({ to: toRealm({ realm: fields.realm! }) as string });
        } catch (error) {
            toast.error(t("saveRealmError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <Dialog open={true} onOpenChange={v => !v && onClose()}>
            <DialogContent showCloseButton className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("createRealm")}</DialogTitle>
                    <DialogDescription>{t("realmExplain")}</DialogDescription>
                </DialogHeader>
                <FormProvider {...form}>
                    <FormAccess
                        id="realm-form"
                        isHorizontal
                        onSubmit={handleSubmit(save)}
                        role="query-realms"
                        isReadOnly={!whoAmI.createRealm}
                    >
                        <JsonFileUpload
                            id="kc-realm-filename"
                            allowEditingUploadedText
                            onChange={handleFileChange}
                        />
                        <TextControl
                            name="realm"
                            label={t("realmNameField")}
                            rules={{ required: t("required") }}
                        />
                        <DefaultSwitchControl
                            name="enabled"
                            label={t("enabled")}
                            defaultValue={true}
                        />
                    </FormAccess>
                </FormProvider>
                <DialogFooter>
                    <Button
                        type="submit"
                        form="realm-form"
                        data-testid="create"
                        disabled={
                            formState.isLoading ||
                            formState.isValidating ||
                            formState.isSubmitting
                        }
                    >
                        {t("create")}
                    </Button>
                    <Button variant="link" onClick={onClose} data-testid="cancel">
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
