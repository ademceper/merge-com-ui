/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/themes/ThemeColors.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { TextControl } from "../../../shared/keycloak-ui-shared";
import {
    Alert,
    AlertDescription,
    AlertTitle
} from "@merge/ui/components/alert";
import { Label } from "@merge/ui/components/label";
import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { FormAccess } from "../../components/form/FormAccess";
import useToggle from "../../utils/useToggle";
import { FileNameDialog } from "./FileNameDialog";
import { ImageUpload } from "./ImageUpload";
import { usePreviewLogo } from "./LogoContext";
import { darkTheme, lightTheme } from "./PatternflyVars";
import { PreviewWindow } from "./PreviewWindow";
import { ThemeRealmRepresentation } from "./ThemesTab";
import { UploadJar } from "./UploadJar";

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
            <div className="p-6">
                <p className="mb-6 text-sm text-muted-foreground">{t("themeColorInfo")}</p>
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
