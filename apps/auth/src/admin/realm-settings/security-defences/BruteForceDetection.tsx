import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    HelpItem,
    NumberControl,
    SelectControl,
} from "../../../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@merge/ui/components/select";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { convertToFormValues } from "../../util";
import { Time } from "./Time";

type BruteForceDetectionProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

enum BruteForceMode {
    Disabled = "Disabled",
    PermanentLockout = "PermanentLockout",
    TemporaryLockout = "TemporaryLockout",
    PermanentAfterTemporaryLockout = "PermanentAfterTemporaryLockout",
}

const bruteForceModes = [
    BruteForceMode.Disabled,
    BruteForceMode.PermanentLockout,
    BruteForceMode.TemporaryLockout,
    BruteForceMode.PermanentAfterTemporaryLockout,
];

const bruteForceStrategyTypes = ["MULTIPLE", "LINEAR"];

export const BruteForceDetection = ({ realm, save }: BruteForceDetectionProps) => {
    const { t } = useTranslation();
    const form = useForm();
    const { setValue, handleSubmit, formState, getValues } = form;
    const [isBruteForceModeUpdated, setIsBruteForceModeUpdated] = useState(false);

    const setupForm = () => {
        convertToFormValues(realm, setValue);
        setIsBruteForceModeUpdated(false);
    };
    useEffect(setupForm, [realm]);

    const bruteForceMode = (() => {
        if (!getValues("bruteForceProtected")) {
            return BruteForceMode.Disabled;
        }
        if (!getValues("permanentLockout")) {
            return BruteForceMode.TemporaryLockout;
        }
        return getValues("maxTemporaryLockouts") == 0
            ? BruteForceMode.PermanentLockout
            : BruteForceMode.PermanentAfterTemporaryLockout;
    })();

    const handleModeChange = (value: BruteForceMode) => {
        switch (value) {
            case BruteForceMode.Disabled:
                form.setValue("bruteForceProtected", false);
                form.setValue("permanentLockout", false);
                form.setValue("maxTemporaryLockouts", 0);
                break;
            case BruteForceMode.TemporaryLockout:
                form.setValue("bruteForceProtected", true);
                form.setValue("permanentLockout", false);
                form.setValue("maxTemporaryLockouts", 0);
                break;
            case BruteForceMode.PermanentLockout:
                form.setValue("bruteForceProtected", true);
                form.setValue("permanentLockout", true);
                form.setValue("maxTemporaryLockouts", 0);
                break;
            case BruteForceMode.PermanentAfterTemporaryLockout:
                form.setValue("bruteForceProtected", true);
                form.setValue("permanentLockout", true);
                form.setValue("maxTemporaryLockouts", 1);
                break;
        }
        setIsBruteForceModeUpdated(true);
    };

    return (
        <FormProvider {...form}>
            <FormAccess
                role="manage-realm"
                isHorizontal
                className="mt-6 space-y-6"
                onSubmit={handleSubmit(save)}
            >
                <FormPanel title={t("bruteForceDetection")} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Label htmlFor="kc-brute-force-mode">
                                    {t("bruteForceMode")}
                                </Label>
                                <HelpItem
                                    helpText={t("bruteForceModeHelpText")}
                                    fieldLabelId="bruteForceMode"
                                />
                            </div>
                            <Select
                                value={bruteForceMode}
                                onValueChange={(v) =>
                                    handleModeChange(v as BruteForceMode)
                                }
                            >
                                <SelectTrigger
                                    id="kc-brute-force-mode"
                                    data-testid="select-brute-force-mode"
                                    aria-label={t("selectUnmanagedAttributePolicy")}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {bruteForceModes.map((mode) => (
                                        <SelectItem key={mode} value={mode}>
                                            {t(`bruteForceMode.${mode}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {bruteForceMode !== BruteForceMode.Disabled && (
                            <>
                                <NumberControl
                                    name="failureFactor"
                                    label={t("failureFactor")}
                                    labelIcon={t("failureFactorHelp")}
                                    controller={{
                                        defaultValue: 0,
                                        rules: {
                                            required: t("required"),
                                            min: 0,
                                        },
                                    }}
                                />
                                {bruteForceMode ===
                                    BruteForceMode.PermanentAfterTemporaryLockout && (
                                    <NumberControl
                                        name="maxTemporaryLockouts"
                                        label={t("maxTemporaryLockouts")}
                                        labelIcon={t("maxTemporaryLockoutsHelp")}
                                        controller={{
                                            defaultValue: 0,
                                            rules: { min: 0 },
                                        }}
                                    />
                                )}
                                {(bruteForceMode ===
                                    BruteForceMode.TemporaryLockout ||
                                    bruteForceMode ===
                                        BruteForceMode.PermanentAfterTemporaryLockout) && (
                                    <>
                                        <SelectControl
                                            name="bruteForceStrategy"
                                            label={t("bruteForceStrategy")}
                                            labelIcon={t("bruteForceStrategyHelp", {
                                                failureFactor:
                                                    getValues("failureFactor"),
                                            })}
                                            controller={{ defaultValue: "" }}
                                            options={bruteForceStrategyTypes.map(
                                                (key) => ({
                                                    key,
                                                    value: t(
                                                        `bruteForceStrategy.${key}`,
                                                    ),
                                                }),
                                            )}
                                        />
                                        <Time name="waitIncrementSeconds" min={0} />
                                        <Time name="maxFailureWaitSeconds" min={0} />
                                        <Time
                                            name="maxDeltaTimeSeconds"
                                            min={0}
                                        />
                                    </>
                                )}
                                <NumberControl
                                    name="quickLoginCheckMilliSeconds"
                                    label={t("quickLoginCheckMilliSeconds")}
                                    labelIcon={t(
                                        "quickLoginCheckMilliSecondsHelp",
                                    )}
                                    controller={{
                                        defaultValue: 0,
                                        rules: { min: 0 },
                                    }}
                                />
                                <Time
                                    name="minimumQuickLoginWaitSeconds"
                                    min={0}
                                />
                            </>
                        )}
                    </div>
                </FormPanel>
                <FixedButtonsGroup
                    name="bruteForce"
                    reset={setupForm}
                    isSubmit
                    isDisabled={
                        !formState.isDirty && !isBruteForceModeUpdated
                    }
                />
            </FormAccess>
        </FormProvider>
    );
};
