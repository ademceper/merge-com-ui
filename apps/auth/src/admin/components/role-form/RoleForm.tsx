import type { ComponentType } from "react";
import { SubmitHandler, UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, type LinkProps, type To } from "react-router-dom";

const RouterLink = Link as ComponentType<LinkProps>;
import { Button } from "@merge/ui/components/button";
import { TextAreaControl, TextControl } from "../../../shared/keycloak-ui-shared";

import { cn } from "@merge/ui/lib/utils";
import { FormAccess } from "../form/FormAccess";
import { AttributeForm } from "../key-value-form/AttributeForm";
import { ViewHeader } from "../view-header/ViewHeader";

export type RoleFormProps = {
    form: UseFormReturn<AttributeForm>;
    onSubmit: SubmitHandler<AttributeForm>;
    cancelLink?: To;
    role: "manage-realm" | "manage-clients";
    editMode: boolean;
    /** Dialog içinde kullanıldığında: başlık ve iptal linki gizlenir, form id verilir. */
    embedded?: boolean;
    formId?: string;
};

export const RoleForm = ({
    form: { formState },
    onSubmit,
    cancelLink,
    role,
    editMode,
    embedded,
    formId
}: RoleFormProps) => {
    const { t } = useTranslation();
    const { control, handleSubmit } = useFormContext<AttributeForm>();

    const roleName = useWatch({
        control,
        defaultValue: undefined,
        name: "name"
    });

    return (
        <>
            {!embedded && !editMode && <ViewHeader titleKey={t("createRole")} />}
            <div className={embedded ? "py-2" : "p-6"}>
                <FormAccess
                    id={formId}
                    isHorizontal
                    onSubmit={handleSubmit(onSubmit)}
                    role={role}
                    className={cn("pf-v5-u-mt-lg", embedded && "flex flex-col gap-5")}
                    fineGrainedAccess={true}
                >
                    <TextControl
                        name="name"
                        label={t("roleName")}
                        showLabel={embedded}
                        rules={{
                            required: !editMode ? t("required") : undefined,
                            validate(value) {
                                if (!value?.trim()) {
                                    return t("required");
                                }
                            }
                        }}
                        isDisabled={editMode}
                    />
                    <TextAreaControl
                        name="description"
                        label={t("description")}
                        showLabel={embedded}
                        rules={{
                            maxLength: {
                                value: 255,
                                message: t("maxLength", { length: 255 })
                            }
                        }}
                        isDisabled={roleName?.includes("default-roles") ?? false}
                    />
                    {!embedded && (
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                data-testid="save"
                                disabled={formState.isLoading || formState.isValidating || formState.isSubmitting}
                            >
                                {t("save")}
                            </Button>
                            {cancelLink && (
                                <RouterLink
                                    to={cancelLink}
                                    data-testid="cancel"
                                    className="text-primary underline-offset-4 hover:underline"
                                >
                                    {t("cancel")}
                                </RouterLink>
                            )}
                        </div>
                    )}
                </FormAccess>
            </div>
        </>
    );
};
