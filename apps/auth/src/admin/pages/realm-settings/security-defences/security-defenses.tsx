import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { BruteForceDetection } from "./brute-force-detection";
import { HeadersForm } from "./headers-form";

type SecurityDefensesProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const SecurityDefenses = ({ realm, save }: SecurityDefensesProps) => {
    const { t } = useTranslation();
    return (
        <Tabs defaultValue="headers">
            <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden mb-4">
                <TabsList
                    variant="line"
                    className="mb-0 w-max min-w-0 **:data-[slot=tabs-trigger]:flex-none"
                >
                    <TabsTrigger
                        value="headers"
                        data-testid="security-defenses-headers-tab"
                    >
                        {t("headers")}
                    </TabsTrigger>
                    <TabsTrigger
                        value="brute-force"
                        data-testid="security-defenses-brute-force-tab"
                    >
                        {t("bruteForceDetection")}
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="headers" className="mt-0 pt-0 outline-none">
                <HeadersForm realm={realm} save={save} />
            </TabsContent>
            <TabsContent value="brute-force" className="mt-0 pt-0 outline-none">
                <BruteForceDetection realm={realm} save={save} />
            </TabsContent>
        </Tabs>
    );
};
