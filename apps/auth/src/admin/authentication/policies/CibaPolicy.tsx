import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    getErrorDescription,
    getErrorMessage,
    SelectControl,
    TextControl,
} from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertFormValuesToObject, convertToFormValues } from "../../util";

const CIBA_BACKHANNEL_TOKEN_DELIVERY_MODES = ["poll", "ping"] as const;
const CIBA_EXPIRES_IN_MIN = 10;
const CIBA_EXPIRES_IN_MAX = 600;
const CIBA_INTERVAL_MIN = 0;
const CIBA_INTERVAL_MAX = 600;

type CibaPolicyProps = {
    realm: RealmRepresentation;
    realmUpdated: (realm: RealmRepresentation) => void;
};

type FormFields = Omit<RealmRepresentation, "clients" | "components" | "groups">;

export const CibaPolicy = ({ realm, realmUpdated }: CibaPolicyProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<FormFields>({ mode: "onChange" });
    const { realm: realmName } = useRealm();
const setupForm = (realm: RealmRepresentation) =>
        convertToFormValues(realm, form.setValue);

    useEffect(() => setupForm(realm), []);

    const onSubmit = async (formValues: FormFields) => {
        try {
            await adminClient.realms.update(
                { realm: realmName },
                convertFormValuesToObject(formValues)
            );

            const updatedRealm = await adminClient.realms.findOne({
                realm: realmName
            });

            realmUpdated(updatedRealm!);
            setupForm(updatedRealm!);
            toast.success(t("updateCibaSuccess"));
        } catch (error) {
            toast.error(t("updateCibaError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <FormProvider {...form}>
            <FormAccess
                role="manage-realm"
                isHorizontal
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormPanel title={t("cibaPolicy")}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <SelectControl
                                name="attributes.cibaBackchannelTokenDeliveryMode"
                                label={t("cibaBackchannelTokenDeliveryMode")}
                                labelIcon={t("cibaBackchannelTokenDeliveryModeHelp")}
                                options={CIBA_BACKHANNEL_TOKEN_DELIVERY_MODES.map(mode => ({
                                    key: mode,
                                    value: t(`cibaBackhannelTokenDeliveryModes.${mode}`)
                                }))}
                                controller={{ defaultValue: "" }}
                            />
                        </div>
                        <div className="space-y-2">
                            <TextControl
                                name="attributes.cibaExpiresIn"
                                type="number"
                                min={CIBA_EXPIRES_IN_MIN}
                                max={CIBA_EXPIRES_IN_MAX}
                                label={t("cibaExpiresIn")}
                                labelIcon={t("cibaExpiresInHelp")}
                                rules={{
                                    min: {
                                        value: CIBA_EXPIRES_IN_MIN,
                                        message: t("greaterThan", {
                                            value: CIBA_EXPIRES_IN_MIN
                                        })
                                    },
                                    max: {
                                        value: CIBA_EXPIRES_IN_MAX,
                                        message: t("lessThan", { value: CIBA_EXPIRES_IN_MAX })
                                    },
                                    required: t("required")
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <TextControl
                                name="attributes.cibaInterval"
                                type="number"
                                min={CIBA_EXPIRES_IN_MIN}
                                max={CIBA_EXPIRES_IN_MAX}
                                label={t("cibaInterval")}
                                labelIcon={t("cibaIntervalHelp")}
                                rules={{
                                    min: {
                                        value: CIBA_INTERVAL_MIN,
                                        message: t("greaterThan", {
                                            value: CIBA_INTERVAL_MIN
                                        })
                                    },
                                    max: {
                                        value: CIBA_INTERVAL_MAX,
                                        message: t("lessThan", { value: CIBA_INTERVAL_MAX })
                                    },
                                    required: t("required")
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <SelectControl
                                name="attributes.cibaAuthRequestedUserHint"
                                label={t("cibaAuthRequestedUserHint")}
                                labelIcon={t("cibaAuthRequestedUserHintHelp")}
                                options={["login_hint", "id_token_hint", "login_hint_token"]}
                                controller={{ defaultValue: "" }}
                                isDisabled
                            />
                        </div>
                    </div>
                </FormPanel>
                <FixedButtonsGroup
                    name="cibaPolicy"
                    reset={() => setupForm({ ...realm })}
                    resetText={t("reload")}
                    isSubmit
                    isDisabled={!form.formState.isValid || !form.formState.isDirty}
                />
            </FormAccess>
        </FormProvider>
    );
};
