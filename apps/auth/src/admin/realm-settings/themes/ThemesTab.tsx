import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import JSZip from "jszip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useRealm } from "../../context/realm-context/RealmContext";
import { toThemesTab } from "../routes/ThemesTab";
import type { ThemesTabType } from "../routes/ThemesTab";
import useIsFeatureEnabled, { Feature } from "../../utils/useIsFeatureEnabled";
import { LogoContext } from "./LogoContext";
import { ThemeColors } from "./ThemeColors";
import { ThemeSettingsTab } from "./ThemeSettings";

type ThemesTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
    subTab?: string;
};

export type ThemeRealmRepresentation = RealmRepresentation & {
    fileName?: string;
    favicon?: File;
    logo?: File;
    bgimage?: File;
};

export default function ThemesTab({ realm, save, subTab = "settings" }: ThemesTabProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm: realmName } = useRealm();
    const isFeatureEnabled = useIsFeatureEnabled();
    const currentTab: ThemesTabType =
        subTab === "lightColors" ? "lightColors" : subTab === "darkColors" ? "darkColors" : "settings";

    const saveTheme = async (realm: ThemeRealmRepresentation) => {
        const zip = new JSZip();

        const styles = JSON.parse(realm.attributes?.style ?? "{}");
        const { favicon, logo, bgimage, fileName } = realm;

        const logoName = "img/logo" + logo?.name?.substring(logo?.name?.lastIndexOf("."));
        const bgimageName =
            "img/bgimage" + bgimage?.name?.substring(bgimage?.name?.lastIndexOf("."));

        if (favicon) {
            zip.file(`theme/quick-theme/common/resources/img/favicon.ico`, favicon);
        }
        if (logo) {
            zip.file(`theme/quick-theme/common/resources/${logoName}`, logo);
        }
        if (bgimage) {
            zip.file(`theme/quick-theme/common/resources/${bgimageName}`, bgimage);
        }

        zip.file(
            "theme/quick-theme/admin/theme.properties",
            `
parent=keycloak.v2
import=common/quick-theme

${logo ? "logo=" + logoName : ""}
styles=css/theme-styles.css
`
        );

        zip.file(
            "theme/quick-theme/account/theme.properties",
            `
parent=keycloak.v3
import=common/quick-theme

${logo ? "logo=" + logoName : ""}
styles=css/theme-styles.css
`
        );

        zip.file(
            "theme/quick-theme/login/theme.properties",
            `
parent=keycloak.v2
import=common/quick-theme

styles=css/login.css css/theme-styles.css
`
        );

        zip.file(
            "META-INF/keycloak-themes.json",
            `{
  "themes": [{
      "name" : "quick-theme",
      "types": [ "login", "account", "admin", "common" ]
  }]
}`
        );

        zip.file(
            "theme-settings.json",
            JSON.stringify({
                ...styles,
                logo: logo ? `theme/quick-theme/common/resources/${logoName}` : "",
                bgimage: bgimage
                    ? `theme/quick-theme/common/resources/${bgimageName}`
                    : "",
                favicon: favicon
                    ? "theme/quick-theme/common/resources/img/favicon.ico"
                    : ""
            })
        );

        const toCss = (obj?: object) =>
            Object.entries(obj || {})
                .map(([key, value]) => `--pf-v5-global--${key}: ${value};`)
                .join("\n");

        const logoCss = "";
        zip.file("theme/quick-theme/common/resources/css/login.css", logoCss);

        zip.file(
            "theme/quick-theme/common/resources/css/theme-styles.css",
            `:root {
        --keycloak-bg-logo-url: url('../${bgimageName}');
        --keycloak-logo-url: url('../${logoName}');
        --keycloak-logo-height: 63px;
        --keycloak-logo-width: 300px;
        ${toCss(styles.light)}
      }
      .pf-v5-theme-dark {
        ${toCss(styles.dark)}
      }
      `
        );
        await zip.generateAsync({ type: "blob" }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || "quick-theme.jar";
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    if (!isFeatureEnabled(Feature.QuickTheme)) {
        return <ThemeSettingsTab realm={realm} save={save} />;
    }

    return (
        <Tabs
            value={currentTab}
            onValueChange={(value) =>
                navigate(toThemesTab({ realm: realmName!, tab: value as ThemesTabType }))
            }
        >
            <TabsList variant="line" className="mb-4">
                <TabsTrigger value="settings" data-testid="rs-themes-settings-tab">
                    {t("themes")}
                </TabsTrigger>
                <TabsTrigger value="lightColors" data-testid="rs-themes-light-tab">
                    {t("themeColorsLight")}
                </TabsTrigger>
                <TabsTrigger value="darkColors" data-testid="rs-themes-dark-tab">
                    {t("themeColorsDark")}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
                <ThemeSettingsTab realm={realm} save={save} />
            </TabsContent>
            <TabsContent value="lightColors">
                <LogoContext>
                    <ThemeColors realm={realm} save={saveTheme} theme="light" />
                </LogoContext>
            </TabsContent>
            <TabsContent value="darkColors">
                <LogoContext>
                    <ThemeColors realm={realm} save={saveTheme} theme="dark" />
                </LogoContext>
            </TabsContent>
        </Tabs>
    );
}
