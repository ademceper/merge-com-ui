import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";
import { Question } from "@phosphor-icons/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    SelectField,
    SwitchControl,
    TextControl,
    useHelp,
} from "../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useAdminClient } from "../../admin-client";
import { FormAccess } from "../../components/form/FormAccess";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
import { MultiLineInput } from "../../components/multi-line-input/MultiLineInput";
import { TimeSelectorControl } from "../../components/time-selector/TimeSelectorControl";
import { useRealm } from "../../context/realm-context/RealmContext";
import { convertFormValuesToObject, convertToFormValues } from "../../util";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";

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
        <SelectField
            name={name}
            label={label}
            labelIcon={labelIcon}
            defaultValue={options[0]}
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

    const panelTitle = isPasswordLess
        ? t("webauthnPasswordlessPolicy")
        : t("webauthnPolicy");

    return (
        <FormProvider {...form}>
            {enabled && (
                <Popover>
                    <PopoverTrigger asChild>
                        <p className="mb-4 cursor-pointer text-sm text-muted-foreground">
                            <Question className="inline size-4" /> {t("webauthnIntro")}
                        </p>
                    </PopoverTrigger>
                    <PopoverContent>{t(`${namePrefix}FormHelp`)}</PopoverContent>
                </Popover>
            )}
            <FormAccess
                role="manage-realm"
                isHorizontal
                className="space-y-4"
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormPanel title={panelTitle}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <TextControl
                                name={`${namePrefix}RpEntityName`}
                                label={t("webAuthnPolicyRpEntityName")}
                                labelIcon={t("webAuthnPolicyRpEntityNameHelp")}
                                rules={{ required: t("required") }}
                            />
                        </div>
                        <div className="space-y-2">
                            <WebauthnSelect
                                name={`${namePrefix}SignatureAlgorithms`}
                                label={t("webAuthnPolicySignatureAlgorithms")}
                                labelIcon={t("webAuthnPolicySignatureAlgorithmsHelp")}
                                options={SIGNATURE_ALGORITHMS}
                                isMultiSelect
                            />
                        </div>
                        <div className="space-y-2">
                            <TextControl
                                name={`${namePrefix}RpId`}
                                label={t("webAuthnPolicyRpId")}
                                labelIcon={t("webAuthnPolicyRpIdHelp")}
                            />
                        </div>
                        <div className="space-y-2">
                            <WebauthnSelect
                                name={`${namePrefix}AttestationConveyancePreference`}
                                label={t("webAuthnPolicyAttestationConveyancePreference")}
                                labelIcon={t("webAuthnPolicyAttestationConveyancePreferenceHelp")}
                                options={ATTESTATION_PREFERENCE}
                                labelPrefix="attestationPreference"
                            />
                        </div>
                        <div className="space-y-2">
                            <WebauthnSelect
                                name={`${namePrefix}AuthenticatorAttachment`}
                                label={t("webAuthnPolicyAuthenticatorAttachment")}
                                labelIcon={t("webAuthnPolicyAuthenticatorAttachmentHelp")}
                                options={AUTHENTICATOR_ATTACHMENT}
                                labelPrefix="authenticatorAttachment"
                            />
                        </div>
                        <div className="space-y-2">
                            <WebauthnSelect
                                name={`${namePrefix}RequireResidentKey`}
                                label={t("webAuthnPolicyRequireResidentKey")}
                                labelIcon={t("webAuthnPolicyRequireResidentKeyHelp")}
                                options={RESIDENT_KEY_OPTIONS}
                                labelPrefix="residentKey"
                            />
                        </div>
                        <div className="space-y-2">
                            <WebauthnSelect
                                name={`${namePrefix}UserVerificationRequirement`}
                                label={t("webAuthnPolicyUserVerificationRequirement")}
                                labelIcon={t("webAuthnPolicyUserVerificationRequirementHelp")}
                                options={USER_VERIFY}
                                labelPrefix="userVerify"
                            />
                        </div>
                        <div className="space-y-2">
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
                        </div>
                        <div className="space-y-2">
                            <SwitchControl
                                name={`${namePrefix}AvoidSameAuthenticatorRegister`}
                                label={t("webAuthnPolicyAvoidSameAuthenticatorRegister")}
                                labelIcon={t("webAuthnPolicyAvoidSameAuthenticatorRegisterHelp")}
                                labelOn={t("on")}
                                labelOff={t("off")}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="webAuthnPolicyAcceptableAaguids" className="text-sm font-medium">
                                    {t("webAuthnPolicyAcceptableAaguids")}
                                </label>
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
                                <label htmlFor="webAuthnPolicyExtraOrigins" className="text-sm font-medium">
                                    {t("webAuthnPolicyExtraOrigins")}
                                </label>
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
                            <div className="space-y-2">
                                <SwitchControl
                                    name={`${namePrefix}PasskeysEnabled`}
                                    label={t("webAuthnPolicyPasskeysEnabled")}
                                    labelIcon={t("webAuthnPolicyPasskeysEnabledHelp")}
                                    labelOn={t("on")}
                                    labelOff={t("off")}
                                />
                            </div>
                        )}
                    </div>
                </FormPanel>
                <FixedButtonsGroup
                    name="webauthnPolicy"
                    reset={() => setupForm(realm)}
                    resetText={t("reload")}
                    isSubmit
                    isDisabled={!isDirty}
                />
            </FormAccess>
        </FormProvider>
    );
};
