import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Input } from "@merge-rd/ui/components/input";
import { Switch } from "@merge-rd/ui/components/switch";
import { memo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../shared/ui/form/form-access";

type TokensTabRefreshSectionProps = {
    onSubmit: () => void;
};

export const TokensTabRefreshSection = memo(function TokensTabRefreshSection({
    onSubmit
}: TokensTabRefreshSectionProps) {
    const { t } = useTranslation();
    const { control } = useFormContext<RealmRepresentation>();

    const revokeRefreshToken = useWatch({
        control,
        name: "revokeRefreshToken",
        defaultValue: false
    });

    return (
        <FormAccess isHorizontal role="manage-realm" className="mt-4" onSubmit={onSubmit}>
            <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                    <label
                        htmlFor="kc-revoke-refresh-token"
                        className="text-sm font-medium"
                    >
                        {t("revokeRefreshToken")}
                    </label>
                    <HelpItem
                        helpText={t("revokeRefreshTokenHelp")}
                        fieldLabelId="revokeRefreshToken"
                    />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Controller
                        name="revokeRefreshToken"
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                            <>
                                <span className="text-sm text-muted-foreground">
                                    {field.value ? t("on") : t("off")}
                                </span>
                                <Switch
                                    id="kc-revoke-refresh-token"
                                    data-testid="revoke-refresh-token-switch"
                                    aria-label={t("revokeRefreshToken")}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </>
                        )}
                    />
                </div>
            </div>
            {revokeRefreshToken && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1">
                        <label htmlFor="refreshTokenMaxReuse">
                            {t("refreshTokenMaxReuse")}
                        </label>
                        <HelpItem
                            helpText={t("refreshTokenMaxReuseHelp")}
                            fieldLabelId="refreshTokenMaxReuse"
                        />
                    </div>
                    <Controller
                        name="refreshTokenMaxReuse"
                        defaultValue={0}
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="number"
                                id="refreshTokenMaxReuseMs"
                                value={field.value}
                                onChange={event =>
                                    field.onChange(
                                        Number((event.target as HTMLInputElement).value)
                                    )
                                }
                            />
                        )}
                    />
                </div>
            )}
        </FormAccess>
    );
});
