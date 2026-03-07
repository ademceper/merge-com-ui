import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormAccess } from "../../../../shared/ui/form/form-access";
import { KeyValueInput } from "../../../../shared/ui/key-value-form/key-value-input";
import { KeySelect } from "./key-select";
import { ValueSelect } from "./value-select";

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
