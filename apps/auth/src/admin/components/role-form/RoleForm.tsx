import type { ComponentType } from "react";
import { SubmitHandler, UseFormReturn, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, type LinkProps, type To } from "react-router-dom";

const RouterLink = Link as ComponentType<LinkProps>;
import { Button } from "@merge/ui/components/button";
import { TextAreaControl, TextControl } from "../../../shared/keycloak-ui-shared";

import { FormAccess } from "../form/FormAccess";
import { AttributeForm } from "../key-value-form/AttributeForm";
import { ViewHeader } from "../view-header/ViewHeader";

export type RoleFormProps = {
    form: UseFormReturn<AttributeForm>;
    onSubmit: SubmitHandler<AttributeForm>;
    cancelLink: To;
    role: "manage-realm" | "manage-clients";
    editMode: boolean;
};

export const RoleForm = ({
    form: { formState },
    onSubmit,
    cancelLink,
    role,
    editMode
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
            {!editMode && <ViewHeader titleKey={t("createRole")} />}
            <div className="p-6">
                <FormAccess
                    isHorizontal
                    onSubmit={handleSubmit(onSubmit)}
                    role={role}
                    className="pf-v5-u-mt-lg"
                    fineGrainedAccess={true}
                >
                    <TextControl
                        name="name"
                        label={t("roleName")}
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
                        rules={{
                            maxLength: {
                                value: 255,
                                message: t("maxLength", { length: 255 })
                            }
                        }}
                        isDisabled={roleName?.includes("default-roles") ?? false}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            data-testid="save"
                            disabled={formState.isLoading || formState.isValidating || formState.isSubmitting}
                        >
                            {t("save")}
                        </Button>
                        <RouterLink
                            to={cancelLink}
                            data-testid="cancel"
                            className="text-primary underline-offset-4 hover:underline"
                        >
                            {t("cancel")}
                        </RouterLink>
                    </div>
                </FormAccess>
            </div>
        </>
    );
};
