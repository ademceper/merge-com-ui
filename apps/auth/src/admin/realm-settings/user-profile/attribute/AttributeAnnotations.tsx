/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/user-profile/attribute/AttributeAnnotations.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../../components/form/FormAccess";
import { KeyValueInput } from "../../../components/key-value-form/KeyValueInput";
import { KeySelect } from "./KeySelect";
import { ValueSelect } from "./ValueSelect";


export const AttributeAnnotations = () => {
    const { t } = useTranslation();
    const { register } = useFormContext();

    return (
        <FormAccess role="manage-realm" isHorizontal>
            <div className="space-y-2">
                <Label htmlFor="kc-annotations">{t("annotations")}</Label>
                <div>
                    <div>
                        <KeyValueInput
                            name="annotations"
                            label={t("annotations")}
                            KeyComponent={props => (
                                <KeySelect
                                    {...props}
                                    selectItems={[
                                        {
                                            key: "inputType",
                                            value: t("inputType")
                                        },
                                        {
                                            key: "inputHelperTextBefore",
                                            value: t("inputHelperTextBefore")
                                        },
                                        {
                                            key: "inputHelperTextAfter",
                                            value: t("inputHelperTextAfter")
                                        },
                                        {
                                            key: "inputOptionLabelsI18nPrefix",
                                            value: t("inputOptionLabelsI18nPrefix")
                                        },
                                        {
                                            key: "inputTypePlaceholder",
                                            value: t("inputTypePlaceholder")
                                        },
                                        {
                                            key: "inputTypeSize",
                                            value: t("inputTypeSize")
                                        },
                                        {
                                            key: "inputTypeCols",
                                            value: t("inputTypeCols")
                                        },
                                        {
                                            key: "inputTypeRows",
                                            value: t("inputTypeRows")
                                        },
                                        {
                                            key: "inputTypeStep",
                                            value: t("inputTypeStep")
                                        },
                                        {
                                            key: "kcNumberFormat",
                                            value: t("kcNumberFormat")
                                        },
                                        {
                                            key: "kcNumberUnFormat",
                                            value: t("kcNumberUnFormat")
                                        }
                                    ]}
                                />
                            )}
                            ValueComponent={props =>
                                props.keyValue === "inputType" ? (
                                    <ValueSelect
                                        selectItems={[
                                            "text",
                                            "textarea",
                                            "select",
                                            "select-radiobuttons",
                                            "multiselect",
                                            "multiselect-checkboxes",
                                            "html5-email",
                                            "html5-tel",
                                            "html5-url",
                                            "html5-number",
                                            "html5-range",
                                            "html5-datetime-local",
                                            "html5-date",
                                            "html5-month",
                                            "html5-week",
                                            "html5-time"
                                        ]}
                                        {...props}
                                    />
                                ) : (
                                    <Input
                                        aria-label={t("customValue")}
                                        data-testid={props.name}
                                        {...props}
                                        {...register(props.name)}
                                    />
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </FormAccess>
    );
};
