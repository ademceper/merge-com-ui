import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { useTranslation } from "react-i18next";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import { CibaPolicy } from "./CibaPolicy";
import { OtpPolicy } from "./OtpPolicy";
import { PasswordPolicy } from "./PasswordPolicy";
import { WebauthnPolicy } from "./WebauthnPolicy";

export const Policies = () => {
    const { t } = useTranslation();
    const { realmRepresentation: realm, refresh } = useRealm();

    if (!realm) {
        return <KeycloakSpinner />;
    }

    return (
        <Tabs defaultValue="password">
            <div className="mb-4 w-full min-w-0 overflow-x-auto overflow-y-hidden">
                <TabsList variant="line" className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none">
                    <TabsTrigger value="password" data-testid="passwordPolicy">
                        {t("passwordPolicy")}
                    </TabsTrigger>
                    <TabsTrigger value="otp" data-testid="otpPolicy">
                        {t("otpPolicy")}
                    </TabsTrigger>
                    <TabsTrigger value="webauthn" data-testid="webauthnPolicy">
                        {t("webauthnPolicy")}
                    </TabsTrigger>
                    <TabsTrigger value="webauthnPasswordless" data-testid="webauthnPasswordlessPolicy">
                        {t("webauthnPasswordlessPolicy")}
                    </TabsTrigger>
                    <TabsTrigger value="ciba" data-testid="tab-ciba-policy">
                        {t("cibaPolicy")}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="password" className="mt-0 pt-0 outline-none">
                <PasswordPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="otp" className="mt-0 pt-0 outline-none">
                <OtpPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="webauthn" className="mt-0 pt-0 outline-none">
                <WebauthnPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
            <TabsContent value="webauthnPasswordless" className="mt-0 pt-0 outline-none">
                <WebauthnPolicy realm={realm} realmUpdated={refresh} isPasswordLess />
            </TabsContent>
            <TabsContent value="ciba" className="mt-0 pt-0 outline-none">
                <CibaPolicy realm={realm} realmUpdated={refresh} />
            </TabsContent>
        </Tabs>
    );
};
