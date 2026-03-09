import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import { Label } from "@merge-rd/ui/components/label";
import type React from "react";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { TextControl } from "@/shared/keycloak-ui-shared";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { FixedButtonsGroup } from "@/admin/shared/ui/form/fixed-button-group";
import { FormAccess } from "@/admin/shared/ui/form/form-access";
import { FileNameDialog } from "./file-name-dialog";
import { ImageUpload } from "./image-upload";
import { usePreviewLogo } from "./logo-context";
import { darkTheme, lightTheme } from "./patternfly-vars";
import { PreviewWindow } from "./preview-window";
import type { ThemeRealmRepresentation } from "./themes-tab";
import { UploadJar } from "./upload-jar";

type ThemeType = "light" | "dark";

type ColorControlProps = React.InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    color: string;
};

const ColorControl = ({ name, color, label, ...props }: ColorControlProps) => {
    const { t } = useTranslation();
    const { control, setValue } = useFormContext();
    const currentValue = useWatch({
        control,
        name
    });
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <TextControl {...props} name={name} label={t(label)} />
            </div>
            <input
                type="color"
                value={currentValue || color}
                onChange={e => setValue(name, e.target.value)}
            />
        </div>
    );
};

const switchTheme = (theme: ThemeType) => {
    if (theme === "light") {
        document
            .querySelector('meta[name="color-scheme"]')!
            .setAttribute("content", "light");
        document.documentElement.classList.remove("pf-v5-theme-dark");
    } else {
        document.documentElement.classList.add("pf-v5-theme-dark");
    }
};

type ThemeColorsProps = {
    realm: RealmRepresentation;
    save: (realm: ThemeRealmRepresentation) => void;
    theme: "light" | "dark";
};

export const ThemeColors = ({ realm, save, theme }: ThemeColorsProps) => {
    const { t } = useTranslation();
    const form = useForm();
    const { handleSubmit, watch } = form;
    const style = watch();
    const contextLogo = usePreviewLogo();
    const [open, toggle, setOpen] = useToggle();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const mapping = useMemo(() => (theme === "light" ? lightTheme() : darkTheme()), []);

    const reset = () => {
        form.reset({
            [theme]: mapping.reduce(
                (acc, m) => ({
                    ...acc,
                    [m.variable!]: m.defaultValue
                }),
                {}
            )
        });
    };

    const setupForm = () => {
        reset();
    };

    const upload = (values: ThemeRealmRepresentation) => {
        form.setValue("bgimage", values.bgimage);
        form.setValue("favicon", values.favicon);
        form.setValue("logo", values.logo);
        form.reset(values);
    };

    const convert = (values: Record<string, File | string>) => {
        const styles = JSON.parse(realm.attributes?.style || "{}");
        save({
            ...realm,
            favicon: values.favicon as File,
            logo: values.logo as File,
            bgimage: values.bgimage as File,
            fileName: values.name as string,
            attributes: {
                ...realm.attributes,
                style: JSON.stringify({
                    ...styles,
                    ...values
                })
            }
        });
    };

    useEffect(() => {
        setupForm();
        switchTheme(theme);
        return () => {
            switchTheme(mediaQuery.matches ? "dark" : "light");
        };
    }, [realm]);

    return (
        <>
            {open && (
                <FileNameDialog
                    onSave={async name => {
                        await handleSubmit(data => convert({ ...data, name }))();
                        setOpen(false);
                    }}
                    onClose={toggle}
                />
            )}
            <div className="px-4 pt-0">
                <p className="mb-6 text-sm text-muted-foreground">
                    {t("themeColorInfo")}
                </p>
                {mediaQuery.matches && theme === "light" && (
                    <Alert>
                        <AlertTitle>{t("themePreviewInfo")}</AlertTitle>
                    </Alert>
                )}
                <div className="flex gap-6 pt-4">
                    <div>
                        <FormAccess isHorizontal role="manage-realm">
                            <FormProvider {...form}>
                                <div className="space-y-2">
                                    <Label>{t("favicon")}</Label>
                                    <ImageUpload name="favicon" />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("logo")}</Label>
                                    <ImageUpload
                                        name="logo"
                                        onChange={logo => contextLogo?.setLogo(logo)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("backgroundImage")}</Label>
                                    <ImageUpload name="bgimage" />
                                </div>
                                {mapping.map(m => (
                                    <ColorControl
                                        key={m.name}
                                        color={m.defaultValue!}
                                        name={`${theme}.${m.variable!}`}
                                        label={m.name}
                                    />
                                ))}
                            </FormProvider>
                        </FormAccess>
                    </div>
                    <div className="flex-1" style={{ zIndex: 0 }}>
                        <PreviewWindow cssVars={style?.[theme] || {}} />
                    </div>
                </div>
                <FixedButtonsGroup
                    name="colors"
                    saveText={t("downloadThemeJar")}
                    save={toggle}
                    reset={setupForm}
                >
                    <UploadJar onUpload={upload} />
                </FixedButtonsGroup>
            </div>
        </>
    );
};
