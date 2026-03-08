import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import JSZip from "jszip";
import { type ChangeEvent, useRef } from "react";
import type { ThemeRealmRepresentation } from "./themes-tab";

const hiddenInputStyle = { display: "none" } as const;

type UploadJarProps = {
    onUpload: (theme: ThemeRealmRepresentation) => void;
};

export const UploadJar = ({ onUpload }: UploadJarProps) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleAcceptedFiles = async (files: ChangeEvent<HTMLInputElement>) => {
        const file = files.target.files?.[0];
        if (!file) {
            return;
        }

        const jsZip = new JSZip();
        const zipFile = await jsZip.loadAsync(file);
        const themeFile = await zipFile.file("theme-settings.json")?.async("string");

        const theme = JSON.parse(themeFile || "{}");
        theme.bgimage = await zipFile.file(theme.bgimage)?.async("blob");
        theme.favicon = await zipFile.file(theme.favicon)?.async("blob");
        theme.logo = await zipFile.file(theme.logo)?.async("blob");
        onUpload(theme);
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".jar"
                style={hiddenInputStyle}
                onChange={acceptedFiles => handleAcceptedFiles(acceptedFiles)}
            />
            <Button variant="outline" onClick={triggerUpload}>
                {t("uploadGeneratedThemeJar")}
            </Button>
        </>
    );
};
