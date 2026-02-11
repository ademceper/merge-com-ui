import type IdentityProviderMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperRepresentation";
import type { IdentityProviderMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/identityProviderMapperTypeRepresentation";
import { FormLabel, HelpItem, TextControl } from "../../../shared/keycloak-ui-shared";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Label } from "@merge/ui/components/label";
import { get } from "lodash-es";
import { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { IdPMapperRepresentationWithAttributes } from "./AddMapper";

type AddMapperFormProps = {
    mapperTypes: IdentityProviderMapperRepresentation[];
    mapperType: IdentityProviderMapperTypeRepresentation;
    id: string;
    updateMapperType: (mapperType: IdentityProviderMapperTypeRepresentation) => void;
    form: UseFormReturn<IdPMapperRepresentationWithAttributes>;
};

export const AddMapperForm = ({
    mapperTypes,
    mapperType,
    form,
    id,
    updateMapperType
}: AddMapperFormProps) => {
    const { t } = useTranslation();

    const { control } = form;

    const [mapperTypeOpen, setMapperTypeOpen] = useState(false);

    const syncModes = ["inherit", "import", "legacy", "force"];

    return (
        <>
            <TextControl
                name="name"
                label={t("name")}
                labelIcon={t("addIdpMapperNameHelp")}
                readOnly={!!id}
                rules={{
                    required: t("required")
                }}
            />
            <FormLabel
                name="config.syncMode"
                label={t("syncModeOverride")}
                labelIcon={t("syncModeOverrideHelp")}
                error={get(form.formState.errors, "config.syncMode")}
            >
                <Controller
                    name="config.syncMode"
                    control={form.control}
                    defaultValue={syncModes[0].toUpperCase()}
                    render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger id="config.syncMode">
                                <SelectValue placeholder={t("syncModeOverride")} />
                            </SelectTrigger>
                            <SelectContent>
                                {syncModes.map((option) => (
                                    <SelectItem key={option} value={option.toUpperCase()}>
                                        {t(`syncModes.${option}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </FormLabel>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="identityProviderMapper">{t("mapperType")}</Label>
                    <HelpItem helpText={mapperType.helpText} fieldLabelId="mapperType" />
                </div>
                <Controller
                    name="identityProviderMapper"
                    defaultValue={mapperTypes[0].id}
                    control={control}
                    render={({ field }) => (
                        <Select
                            open={mapperTypeOpen}
                            onOpenChange={setMapperTypeOpen}
                            value={mapperType.name ?? mapperType.id ?? ""}
                            onValueChange={(v) => {
                                const selected = mapperTypes.find(
                                    m => (m.name ?? m.id) === v
                                );
                                if (selected) {
                                    updateMapperType(selected);
                                    field.onChange(selected.id);
                                }
                                setMapperTypeOpen(false);
                            }}
                            disabled={!!id}
                            aria-label={t("mapperType")}
                            data-testid="idp-mapper-select"
                        >
                            <SelectTrigger id="identityProviderMapper">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {mapperTypes.map(option => (
                                    <SelectItem
                                        data-testid={option.id}
                                        key={option.name}
                                        value={option.name ?? option.id ?? ""}
                                    >
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
        </>
    );
};
