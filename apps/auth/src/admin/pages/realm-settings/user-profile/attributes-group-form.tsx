import type { UserProfileGroup } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Label } from "@merge-rd/ui/components/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    getErrorDescription,
    getErrorMessage,
    HelpItem,
    TextControl
} from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import {
    type EditAttributesGroupParams,
    toUserProfile
} from "@/admin/shared/lib/routes/realm-settings";
import { useParams } from "@/admin/shared/lib/use-params";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import type { KeyValueType } from "@/admin/shared/ui/key-value-form/key-value-convert";
import { KeyValueInput } from "@/admin/shared/ui/key-value-form/key-value-input";
import {
    saveTranslations,
    TranslatableField,
    type Translations
} from "./attribute/translatable-field";
import { useUserProfile } from "./user-profile-context";

function parseAnnotations(input: Record<string, unknown>): KeyValueType[] {
    return Object.entries(input).reduce((p, [key, value]) => {
        if (typeof value === "string") {
            return [...p, { key, value }];
        } else {
            return [...p];
        }
    }, [] as KeyValueType[]);
}

function transformAnnotations(input: KeyValueType[]): Record<string, unknown> {
    return Object.fromEntries(
        input
            .filter(annotation => annotation.key.length > 0)
            .map(annotation => [annotation.key, annotation.value] as const)
    );
}

type FormFields = Required<Omit<UserProfileGroup, "annotations">> &
    Translations & {
        annotations: KeyValueType[];
    };

const defaultValues: FormFields = {
    annotations: [],
    displayDescription: "",
    displayHeader: "",
    name: "",
    translation: { key: [] }
};

export function AttributesGroupForm() {
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const { config, save } = useUserProfile();
    const navigate = useNavigate();
    const params = useParams<EditAttributesGroupParams>();
    const form = useForm<FormFields>({ defaultValues });
    const editMode = !!params.name;

    const matchingGroup = useMemo(
        () => config?.groups?.find(({ name }) => name === params.name),
        [config?.groups, params.name]
    );

    useEffect(() => {
        if (!matchingGroup) {
            return;
        }

        const annotations = matchingGroup.annotations
            ? parseAnnotations(matchingGroup.annotations)
            : [];

        form.reset({ ...defaultValues, ...matchingGroup, annotations });
    }, [matchingGroup, form]);

    const onSubmit: SubmitHandler<FormFields> = async values => {
        if (!config) {
            return;
        }

        const groups = [...(config.groups ?? [])];
        const updateAt = matchingGroup ? groups.indexOf(matchingGroup) : -1;
        const { translation, ...groupValues } = values;
        const updatedGroup: UserProfileGroup = {
            ...groupValues,
            annotations: transformAnnotations(values.annotations)
        };

        if (updateAt === -1) {
            groups.push(updatedGroup);
        } else {
            groups[updateAt] = updatedGroup;
        }

        const success = await save({ ...config, groups });

        if (success) {
            if (realm?.internationalizationEnabled) {
                try {
                    await saveTranslations({
                        realmName,
                        translationsData: { translation }
                    });
                } catch (error) {
                    toast.error(
                        t("errorSavingTranslations", { error: getErrorMessage(error) }),
                        { description: getErrorDescription(error) }
                    );
                }
            }
            navigate({
                to: toUserProfile({ realm: realmName, tab: "attributes-group" }) as string
            });
        }
    };

    return (
        <FormProvider {...form}>
            <div className="p-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FormAccess isHorizontal role="manage-realm">
                    <TextControl
                        name="name"
                        label={t("nameField")}
                        labelIcon={t("nameHintHelp")}
                        isDisabled={!!matchingGroup || editMode}
                        rules={{
                            required: t("required")
                        }}
                    />
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="kc-attributes-group-display-header">
                                {t("displayHeader")}
                            </Label>
                            <HelpItem
                                helpText={t("displayHeaderHintHelp")}
                                fieldLabelId="displayHeader"
                            />
                        </div>
                        <TranslatableField
                            fieldName="displayHeader"
                            attributeName="name"
                            prefix="profile.attribute-group"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label htmlFor="kc-attributes-group-display-description">
                                {t("displayDescription")}
                            </Label>
                            <HelpItem
                                helpText={t("displayDescriptionHintHelp")}
                                fieldLabelId="displayDescription"
                            />
                        </div>
                        <TranslatableField
                            fieldName="displayDescription"
                            attributeName="name"
                            prefix="profile.attribute-group-description"
                        />
                    </div>
                    <h2 className="text-lg font-medium">{t("annotationsText")}</h2>
                    <div className="space-y-2">
                        <Label htmlFor="kc-annotations">{t("annotationsText")}</Label>
                        <KeyValueInput label={t("annotationsText")} name="annotations" />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" data-testid="saveGroupBtn">
                            {t("save")}
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link
                                to={
                                    toUserProfile({
                                        realm: realmName,
                                        tab: "attributes-group"
                                    }) as string
                                }
                            >
                                {t("cancel")}
                            </Link>
                        </Button>
                    </div>
                </FormAccess>
            </div>
        </FormProvider>
    );
}
