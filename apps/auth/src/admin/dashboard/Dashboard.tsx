const baseUrl = import.meta.env.BASE_URL;
import FeatureRepresentation, {
    FeatureType
} from "@keycloak/keycloak-admin-client/lib/defs/featureRepresentation";
import { HelpItem, label } from "../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Card, CardContent, CardTitle } from "@merge/ui/components/card";
import { Badge } from "@merge/ui/components/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@merge/ui/components/empty";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { KeycloakSpinner } from "../../shared/keycloak-ui-shared";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import helpUrls from "../help-urls";
import useLocaleSort, { mapByKey } from "../utils/useLocaleSort";
import { ProviderInfo } from "./ProviderInfo";

const EmptyDashboard = () => {
    const { t } = useTranslation();
    const { realm, realmRepresentation: realmInfo } = useRealm();

    const realmDisplayInfo = label(t, realmInfo?.displayName, realm);

    return (
        <section className="py-6">
            <Empty className="keycloak__dashboard_empty min-h-[280px]">
                <div className="keycloak__dashboard_icon flex items-center justify-center gap-0">
                    <img
                        src={`${baseUrl}merge-black-text.svg`}
                        alt=""
                        className="h-8 w-auto object-contain dark:hidden"
                    />
                    <img
                        src={`${baseUrl}merge-white-text.svg`}
                        alt=""
                        className="hidden h-8 w-auto object-contain dark:block"
                    />
                </div>
                <EmptyHeader>
                    <EmptyTitle className="text-2xl">{t("welcome")}</EmptyTitle>
                    <EmptyTitle className="text-3xl font-semibold">{realmDisplayInfo}</EmptyTitle>
                </EmptyHeader>
                <EmptyDescription>{t("introduction")}</EmptyDescription>
            </Empty>
        </section>
    );
};

type FeatureItemProps = {
    feature: FeatureRepresentation;
};

const FeatureItem = ({ feature }: FeatureItemProps) => {
    const { t } = useTranslation();
    const badgeVariant = feature.type === FeatureType.Experimental ? "secondary" : feature.type === FeatureType.Preview || feature.type === FeatureType.PreviewDisabledByDefault ? "default" : feature.type === FeatureType.Deprecated ? "outline" : "default";
    const badgeClass = feature.type === FeatureType.Experimental ? "bg-orange-500/20 text-orange-700 dark:text-orange-300" : feature.type === FeatureType.Preview || feature.type === FeatureType.PreviewDisabledByDefault ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : feature.type === FeatureType.Default || feature.type === FeatureType.DisabledByDefault ? "bg-green-500/20 text-green-700 dark:text-green-300" : feature.type === FeatureType.Deprecated ? "bg-muted text-muted-foreground" : "";
    return (
        <li className="mb-1.5 inline-block mr-2">
            {feature.name}&nbsp;
            {(feature.type === FeatureType.Experimental || feature.type === FeatureType.Preview || feature.type === FeatureType.PreviewDisabledByDefault || feature.type === FeatureType.Default || feature.type === FeatureType.DisabledByDefault || feature.type === FeatureType.Deprecated) && (
                <Badge variant={badgeVariant} className={badgeClass}>
                    {feature.type === FeatureType.Experimental && t("experimental")}
                    {(feature.type === FeatureType.Preview || feature.type === FeatureType.PreviewDisabledByDefault) && t("preview")}
                    {(feature.type === FeatureType.Default || feature.type === FeatureType.DisabledByDefault) && t("supported")}
                    {feature.type === FeatureType.Deprecated && t("deprecated")}
                </Badge>
            )}
        </li>
    );
};

const Dashboard = () => {
    const { t } = useTranslation();
    const { realm, realmRepresentation: realmInfo } = useRealm();
    const serverInfo = useServerInfo();
    const localeSort = useLocaleSort();
    const { tab } = useParams<{ tab?: string }>();

    const sortedFeatures = useMemo(
        () => localeSort(serverInfo.features ?? [], mapByKey("name")),
        [serverInfo.features]
    );

    const disabledFeatures = useMemo(
        () => sortedFeatures.filter(f => !f.enabled) || [],
        [serverInfo.features]
    );

    const enabledFeatures = useMemo(
        () => sortedFeatures.filter(f => f.enabled) || [],
        [serverInfo.features]
    );

    const realmDisplayInfo = label(t, realmInfo?.displayName, realm);

    if (Object.keys(serverInfo).length === 0) {
        return <KeycloakSpinner />;
    }

    const renderContent = () => {
        switch (tab) {
            case "info":
                return (
                    <section className="py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-2">
                                <Card className="keycloak__dashboard_card">
                                    <CardTitle>{t("serverInfo")}</CardTitle>
                                    <CardContent>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="font-medium">{t("version")}</dt>
                                                <dd className="text-muted-foreground">{serverInfo.systemInfo?.version}</dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                    <CardTitle>{t("cpu")}</CardTitle>
                                    <CardContent>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="font-medium">{t("processorCount")}</dt>
                                                <dd className="text-muted-foreground">{serverInfo.cpuInfo?.processorCount}</dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                    <CardTitle>{t("memory")}</CardTitle>
                                    <CardContent>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="font-medium">{t("totalMemory")}</dt>
                                                <dd className="text-muted-foreground">{serverInfo.memoryInfo?.totalFormated}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium">{t("freeMemory")}</dt>
                                                <dd className="text-muted-foreground">{serverInfo.memoryInfo?.freeFormated}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium">{t("usedMemory")}</dt>
                                                <dd className="text-muted-foreground">{serverInfo.memoryInfo?.usedFormated}</dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="lg:col-span-10">
                                <Card className="keycloak__dashboard_card">
                                    <CardTitle>{t("profile")}</CardTitle>
                                    <CardContent>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="font-medium flex items-center gap-1">
                                                    {t("enabledFeatures")}{" "}
                                                    <HelpItem
                                                        fieldLabelId="enabledFeatures"
                                                        helpText={t("infoEnabledFeatures")}
                                                    />
                                                </dt>
                                                <dd>
                                                    <ul className="flex flex-wrap list-none gap-x-2 p-0 m-0">
                                                        {enabledFeatures.map(feature => (
                                                            <FeatureItem key={feature.name} feature={feature} />
                                                        ))}
                                                    </ul>
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium flex items-center gap-1">
                                                    {t("disabledFeatures")}{" "}
                                                    <HelpItem
                                                        fieldLabelId="disabledFeatures"
                                                        helpText={t("infoDisabledFeatures")}
                                                    />
                                                </dt>
                                                <dd>
                                                    <ul className="flex flex-wrap list-none gap-x-2 p-0 m-0">
                                                        {disabledFeatures.map(feature => (
                                                            <FeatureItem key={feature.name} feature={feature} />
                                                        ))}
                                                    </ul>
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>
                );
            case "providers":
                return <ProviderInfo />;
            default:
                return (
                    <section className="py-6">
                        <div className="grid gap-4 ml-6">
                            <div className="col-span-12">
                                <h2
                                    data-testid="welcomeTitle"
                                    className="font-bold text-3xl"
                                >
                                    {t("welcomeTo", { realmDisplayInfo })}
                                </h2>
                            </div>
                            <div className="keycloak__dashboard_welcome_tab">
                                <h3 className="text-xl font-medium">{t("welcomeText")}</h3>
                            </div>
                            <div className="mt-4">
                                <Button asChild>
                                    <a href={helpUrls.documentation} target="_blank" rel="noreferrer">
                                        {t("viewDocumentation")}
                                    </a>
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Button variant="ghost" asChild>
                                    <a href={helpUrls.guides} target="_blank" rel="noreferrer">
                                        {t("viewGuides")}
                                    </a>
                                </Button>
                                <Button variant="ghost" asChild>
                                    <a href={helpUrls.community} target="_blank" rel="noreferrer">
                                        {t("joinCommunity")}
                                    </a>
                                </Button>
                                <Button variant="ghost" asChild>
                                    <a href={helpUrls.blog} target="_blank" rel="noreferrer">
                                        {t("readBlog")}
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </section>
                );
        }
    };

    return (
        <>
            <section className="py-6">
                <h1 className="text-2xl font-semibold">{t("realmNameTitle", { name: realm })}</h1>
            </section>
            <section className="py-0">
                {renderContent()}
            </section>
        </>
    );
};

export default function DashboardSection() {
    const { realm } = useRealm();
    const isMasterRealm = realm === "master";
    return (
        <>
            {!isMasterRealm && <EmptyDashboard />}
            {isMasterRealm && <Dashboard />}
        </>
    );
}
