import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { getErrorDescription, getErrorMessage, HelpItem,
    NumberControl,
    SelectControl,
    SwitchControl } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { useMemo } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";
import { useRealm } from "../../context/realm-context/RealmContext";
import useLocaleSort from "../../utils/useLocaleSort";

const POLICY_TYPES = ["totp", "hotp"] as const;
const OTP_HASH_ALGORITHMS = ["SHA1", "SHA256", "SHA512"] as const;
const NUMBER_OF_DIGITS = [6, 8] as const;

type OtpPolicyProps = {
    realm: RealmRepresentation;
    realmUpdated: (realm: RealmRepresentation) => void;
};

type FormFields = Omit<
    RealmRepresentation,
    "clients" | "components" | "groups" | "users" | "federatedUsers"
>;

export const OtpPolicy = ({ realm, realmUpdated }: OtpPolicyProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const form = useForm<FormFields>({
        mode: "onChange",
        defaultValues: {
            otpPolicyType: realm.otpPolicyType ?? POLICY_TYPES[0],
            otpPolicyAlgorithm:
                realm.otpPolicyAlgorithm ?? `Hmac${OTP_HASH_ALGORITHMS[0]}`,
            otpPolicyDigits: realm.otpPolicyDigits ?? NUMBER_OF_DIGITS[0],
            otpPolicyLookAheadWindow: realm.otpPolicyLookAheadWindow ?? 1,
            otpPolicyPeriod: realm.otpPolicyPeriod ?? 30,
            otpPolicyInitialCounter: realm.otpPolicyInitialCounter ?? 30,
            otpPolicyCodeReusable: realm.otpPolicyCodeReusable ?? false
        }
    });
    const {
        control,
        reset,
        handleSubmit,
        formState: { isValid, isDirty }
    } = form;
    const { realm: realmName } = useRealm();
const localeSort = useLocaleSort();

    const otpType = useWatch({ name: "otpPolicyType", control });

    const setupForm = (formValues: FormFields) => reset(formValues);

    const supportedApplications = useMemo(() => {
        const labels = (realm.otpSupportedApplications ?? []).map(key =>
            t(`otpSupportedApplications.${key}`)
        );

        return localeSort(labels, label => label);
    }, [realm.otpSupportedApplications]);

    const onSubmit = async (formValues: FormFields) => {
        try {
            await adminClient.realms.update({ realm: realmName }, formValues);
            const updatedRealm = await adminClient.realms.findOne({
                realm: realmName
            });
            realmUpdated(updatedRealm!);
            setupForm(updatedRealm!);
            toast.success(t("updateOtpSuccess"));
        } catch (error) {
            toast.error(t("updateOtpError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <div className="p-6">
            <FormAccess
                role="manage-realm"
                isHorizontal
                onSubmit={handleSubmit(onSubmit)}
                className="keycloak__otp_policies_authentication__form"
            >
                <FormProvider {...form}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label>{t("otpType")}</label>
                            <HelpItem
                                helpText={t("otpTypeHelp")}
                                fieldLabelId="otpType"
                            />
                        </div>
                        <Controller
                            name="otpPolicyType"
                            data-testid="otpPolicyType"
                            defaultValue={POLICY_TYPES[0]}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <>
                                    {POLICY_TYPES.map(type => (
                                        <label key={type} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id={type}
                                                data-testid={type}
                                                checked={value === type}
                                                name="otpPolicyType"
                                                onChange={() => onChange(type)}
                                            />
                                            {t(`policyType.${type}`)}
                                        </label>
                                    ))}
                                </>
                            )}
                        />
                    </div>
                    <SelectControl
                        name="otpPolicyAlgorithm"
                        label={t("otpHashAlgorithm")}
                        labelIcon={t("otpHashAlgorithmHelp")}
                        options={OTP_HASH_ALGORITHMS.map(type => ({
                            key: `Hmac${type}`,
                            value: type
                        }))}
                        controller={{ defaultValue: `Hmac${OTP_HASH_ALGORITHMS[0]}` }}
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label>{t("otpPolicyDigits")}</label>
                            <HelpItem
                                helpText={t("otpPolicyDigitsHelp")}
                                fieldLabelId="otpPolicyDigits"
                            />
                        </div>
                        <Controller
                            name="otpPolicyDigits"
                            data-testid="otpPolicyDigits"
                            defaultValue={NUMBER_OF_DIGITS[0]}
                            control={control}
                            render={({ field }) => (
                                <>
                                    {NUMBER_OF_DIGITS.map(type => (
                                        <label key={type} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                id={`digit-${type}`}
                                                data-testid={`digit-${type}`}
                                                checked={field.value === type}
                                                name="otpPolicyDigits"
                                                onChange={() => field.onChange(type)}
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </>
                            )}
                        />
                    </div>
                    <NumberControl
                        name="otpPolicyLookAheadWindow"
                        label={t("lookAround")}
                        labelIcon={t("lookAroundHelp")}
                        controller={{ defaultValue: 1, rules: { min: 0 } }}
                    />
                    {otpType === POLICY_TYPES[0] && (
                        <TimeSelectorControl
                            name="otpPolicyPeriod"
                            label={t("otpPolicyPeriod")}
                            labelIcon={t("otpPolicyPeriodHelp")}
                            units={["second", "minute"]}
                            controller={{
                                defaultValue: 30,
                                rules: {
                                    min: 1,
                                    max: {
                                        value: 120,
                                        message: t("maxLength", {
                                            length: "2 " + t("minutes")
                                        })
                                    }
                                }
                            }}
                        />
                    )}
                    {otpType === POLICY_TYPES[1] && (
                        <NumberControl
                            name="otpPolicyInitialCounter"
                            label={t("initialCounter")}
                            labelIcon={t("initialCounterHelp")}
                            controller={{ defaultValue: 30, rules: { min: 1, max: 120 } }}
                        />
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label>{t("supportedApplications")}</label>
                            <HelpItem
                                helpText={t("supportedApplicationsHelp")}
                                fieldLabelId="supportedApplications"
                            />
                        </div>
                        <span data-testid="supportedApplications" className="flex flex-wrap gap-1">
                            {supportedApplications.map(label => (
                                <Badge key={label} variant="secondary">
                                    {label}
                                </Badge>
                            ))}
                        </span>
                    </div>

                    {otpType === POLICY_TYPES[0] && (
                        <SwitchControl
                            name="otpPolicyCodeReusable"
                            label={t("otpPolicyCodeReusable")}
                            labelIcon={t("otpPolicyCodeReusableHelp")}
                            labelOn={t("on")}
                            labelOff={t("off")}
                        />
                    )}

                    <div className="flex gap-2">
                        <Button
                            data-testid="save"
                            variant="default"
                            type="submit"
                            disabled={!isValid || !isDirty}
                        >
                            {t("save")}
                        </Button>
                        <Button
                            data-testid="reload"
                            variant="link"
                            onClick={() => reset({ ...realm })}
                        >
                            {t("reload")}
                        </Button>
                    </div>
                </FormProvider>
            </FormAccess>
        </div>
    );
};
