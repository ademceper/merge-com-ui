import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Button } from "@merge/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    HelpItem,
    SelectControl,
    SwitchControl,
    TextControl,
    useHelp
} from "../../../shared/keycloak-ui-shared";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { FormAccess } from "../../components/form/FormAccess";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";

import { useAdminClient } from "../../admin-client";

const SIGNATURE_ALGORITHMS = [
    "ES256",
    "ES384",
    "ES512",
    "RS256",
    "RS384",
    "RS512",
    "Ed25519",
    "RS1"
] as const;
const ATTESTATION_PREFERENCE = ["not specified", "none", "indirect", "direct"] as const;

const AUTHENTICATOR_ATTACHMENT = ["not specified", "platform", "cross-platform"] as const;

const RESIDENT_KEY_OPTIONS = ["not specified", "Yes", "No"] as const;

const USER_VERIFY = ["not specified", "required", "preferred", "discouraged"] as const;

type WeauthnSelectProps = {
    name: string;
    label: string;
    labelIcon?: string;
    options: readonly string[];
    labelPrefix?: string;
    isMultiSelect?: boolean;
};

const WebauthnSelect = ({
    name,
    label,
    labelIcon,
    options,
    labelPrefix,
    isMultiSelect = false
}: WeauthnSelectProps) => {
    const { t } = useTranslation();
    return (
        <SelectControl
            name={name}
            label={label}
            labelIcon={labelIcon}
            variant={isMultiSelect ? "typeaheadMulti" : "single"}
            controller={{ defaultValue: options[0] }}
            options={options.map(option => ({
                key: option,
                value: labelPrefix ? t(`${labelPrefix}.${option}`) : option
            }))}
        />
    );
};

type WebauthnPolicyProps = {
    realm: RealmRepresentation;
    realmUpdated: (realm: RealmRepresentation) => void;
    isPasswordLess?: boolean;
};

export const WebauthnPolicy = ({
    realm,
    realmUpdated,
    isPasswordLess = false
}: WebauthnPolicyProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const { realm: realmName } = useRealm();
    const { enabled } = useHelp();
    const form = useForm({ mode: "onChange" });
    const {
        setValue,
        handleSubmit,
        formState: { isDirty }
    } = form;

    const namePrefix = isPasswordLess ? "webAuthnPolicyPasswordless" : "webAuthnPolicy";

    const setupForm = (realm: RealmRepresentation) =>
        convertToFormValues(realm, setValue);

    useEffect(() => setupForm(realm), []);

    const onSubmit = async (realm: RealmRepresentation) => {
        const submittedRealm = convertFormValuesToObject(realm);
        try {
            await adminClient.realms.update({ realm: realmName }, submittedRealm);
            realmUpdated(submittedRealm);
            setupForm(submittedRealm);
            toast.success(t("webAuthnUpdateSuccess"));
        } catch (error) {
            toast.error(t("webAuthnUpdateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    const isFeatureEnabled = useIsFeatureEnabled();

    return (
        <div className="p-6">
            {enabled && (
                <Popover>
                    <PopoverTrigger asChild>
                        <p className="keycloak__section_intro__help cursor-pointer">
                            <Question className="size-4 inline" /> {t("webauthnIntro")}
                        </p>
                    </PopoverTrigger>
                    <PopoverContent>{t(`${namePrefix}FormHelp`)}</PopoverContent>
                </Popover>
            )}

            <FormAccess
                role="manage-realm"
                isHorizontal
                onSubmit={handleSubmit(onSubmit)}
                className="keycloak__webauthn_policies_authentication__form"
            >
                <FormProvider {...form}>
                    <TextControl
                        name={`${namePrefix}RpEntityName`}
                        label={t("webAuthnPolicyRpEntityName")}
                        labelIcon={t("webAuthnPolicyRpEntityNameHelp")}
                        rules={{ required: t("required") }}
                    />
                    <WebauthnSelect
                        name={`${namePrefix}SignatureAlgorithms`}
                        label={t("webAuthnPolicySignatureAlgorithms")}
                        labelIcon={t("webAuthnPolicySignatureAlgorithmsHelp")}
                        options={SIGNATURE_ALGORITHMS}
                        isMultiSelect
                    />
                    <TextControl
                        name={`${namePrefix}RpId`}
                        label={t("webAuthnPolicyRpId")}
                        labelIcon={t("webAuthnPolicyRpIdHelp")}
                    />
                    <WebauthnSelect
                        name={`${namePrefix}AttestationConveyancePreference`}
                        label={t("webAuthnPolicyAttestationConveyancePreference")}
                        labelIcon={t("webAuthnPolicyAttestationConveyancePreferenceHelp")}
                        options={ATTESTATION_PREFERENCE}
                        labelPrefix="attestationPreference"
                    />
                    <WebauthnSelect
                        name={`${namePrefix}AuthenticatorAttachment`}
                        label={t("webAuthnPolicyAuthenticatorAttachment")}
                        labelIcon={t("webAuthnPolicyAuthenticatorAttachmentHelp")}
                        options={AUTHENTICATOR_ATTACHMENT}
                        labelPrefix="authenticatorAttachment"
                    />
                    <WebauthnSelect
                        name={`${namePrefix}RequireResidentKey`}
                        label={t("webAuthnPolicyRequireResidentKey")}
                        labelIcon={t("webAuthnPolicyRequireResidentKeyHelp")}
                        options={RESIDENT_KEY_OPTIONS}
                        labelPrefix="residentKey"
                    />
                    <WebauthnSelect
                        name={`${namePrefix}UserVerificationRequirement`}
                        label={t("webAuthnPolicyUserVerificationRequirement")}
                        labelIcon={t("webAuthnPolicyUserVerificationRequirementHelp")}
                        options={USER_VERIFY}
                        labelPrefix="userVerify"
                    />
                    <TimeSelectorControl
                        name={`${namePrefix}CreateTimeout`}
                        label={t("webAuthnPolicyCreateTimeout")}
                        labelIcon={t("webAuthnPolicyCreateTimeoutHelp")}
                        units={["second", "minute", "hour"]}
                        controller={{
                            defaultValue: 0,
                            rules: {
                                min: 0,
                                max: {
                                    value: 31536,
                                    message: t("webAuthnPolicyCreateTimeoutHint")
                                }
                            }
                        }}
                    />
                    <SwitchControl
                        name={`${namePrefix}AvoidSameAuthenticatorRegister`}
                        label={t("webAuthnPolicyAvoidSameAuthenticatorRegister")}
                        labelIcon={t("webAuthnPolicyAvoidSameAuthenticatorRegisterHelp")}
                        labelOn={t("on")}
                        labelOff={t("off")}
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="webAuthnPolicyAcceptableAaguids">{t("webAuthnPolicyAcceptableAaguids")}</label>
                            <HelpItem
                                helpText={t("webAuthnPolicyAcceptableAaguidsHelp")}
                                fieldLabelId="webAuthnPolicyAcceptableAaguids"
                            />
                        </div>
                        <MultiLineInput
                            name={`${namePrefix}AcceptableAaguids`}
                            aria-label={t("webAuthnPolicyAcceptableAaguids")}
                            addButtonLabel="addAaguids"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label htmlFor="webAuthnPolicyExtraOrigins">{t("webAuthnPolicyExtraOrigins")}</label>
                            <HelpItem
                                helpText={t("webAuthnPolicyExtraOriginsHelp")}
                                fieldLabelId="webAuthnPolicyExtraOrigins"
                            />
                        </div>
                        <MultiLineInput
                            name={`${namePrefix}ExtraOrigins`}
                            aria-label={t("webAuthnPolicyExtraOrigins")}
                            addButtonLabel="addOrigins"
                        />
                    </div>
                    {isPasswordLess && isFeatureEnabled(Feature.Passkeys) && (
                        <SwitchControl
                            name={`${namePrefix}PasskeysEnabled`}
                            label={t("webAuthnPolicyPasskeysEnabled")}
                            labelIcon={t("webAuthnPolicyPasskeysEnabledHelp")}
                            labelOn={t("on")}
                            labelOff={t("off")}
                        />
                    )}
                </FormProvider>

                <div className="flex gap-2">
                    <Button
                        data-testid="save"
                        variant="default"
                        type="submit"
                        disabled={!isDirty}
                    >
                        {t("save")}
                    </Button>
                    <Button
                        data-testid="reload"
                        variant="link"
                        onClick={() => setupForm(realm)}
                    >
                        {t("reload")}
                    </Button>
                </div>
            </FormAccess>
        </div>
    );
};
