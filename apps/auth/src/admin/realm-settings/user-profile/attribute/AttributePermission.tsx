import { Checkbox } from "@merge/ui/components/checkbox";
import { Label } from "@merge/ui/components/label";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormAccess } from "../../../components/form/FormAccess";
import { HelpItem } from "../../../../shared/keycloak-ui-shared";

const Permissions = ({ name }: { name: string }) => {
    const { t } = useTranslation();
    const { control } = useFormContext();

    return (
        <div className="flex gap-4">
            <Controller
                name={`permissions.${name}`}
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                    <>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`user-${name}`}
                                data-testid={`user-${name}`}
                                checked={field.value.includes("user")}
                                onCheckedChange={() => {
                                    const option = "user";
                                    const changedValue = field.value.includes(option)
                                        ? field.value.filter(
                                              (item: string) => item !== option
                                          )
                                        : [...field.value, option];

                                    field.onChange(changedValue);
                                }}
                            />
                            <Label htmlFor={`user-${name}`}>{t("user")}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`admin-${name}`}
                                data-testid={`admin-${name}`}
                                checked={field.value.includes("admin")}
                                onCheckedChange={() => {
                                    const option = "admin";
                                    const changedValue = field.value.includes(option)
                                        ? field.value.filter(
                                              (item: string) => item !== option
                                          )
                                        : [...field.value, option];

                                    field.onChange(changedValue);
                                }}
                            />
                            <Label htmlFor={`admin-${name}`}>{t("admin")}</Label>
                        </div>
                    </>
                )}
            />
        </div>
    );
};

export const AttributePermission = () => {
    const { t } = useTranslation();

    return (
        <FormAccess role="manage-realm" isHorizontal>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label htmlFor="kc-who-can-edit">{t("whoCanEdit")}</Label>
                    <HelpItem helpText={t("whoCanEditHelp")} fieldLabelId="whoCanEdit" />
                </div>
                <Permissions name="edit" />
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label htmlFor="kc-who-can-view">{t("whoCanView")}</Label>
                    <HelpItem helpText={t("whoCanViewHelp")} fieldLabelId="whoCanView" />
                </div>
                <Permissions name="view" />
            </div>
        </FormAccess>
    );
};
