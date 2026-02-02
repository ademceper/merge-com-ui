/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/scopes/EvaluateScopes.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import {
    HelpItem,
    KeycloakDataTable,
    KeycloakSelect,
    SelectVariant,
    useFetch,
    useHelp
} from "../../../shared/keycloak-ui-shared";
const SelectOption = ({ value, children, ...props }: any) => <option value={value} {...props}>{children}</option>;
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";
import { Question } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { ClientSelect } from "../../components/client/ClientSelect";
import { UserSelect } from "../../components/users/UserSelect";
import { useAccess } from "../../context/access/Access";
import { useRealm } from "../../context/realm-context/RealmContext";
import { useServerInfo } from "../../context/server-info/ServerInfoProvider";
import { prettyPrintJSON } from "../../util";
import { GeneratedCodeTab } from "./GeneratedCodeTab";


export type EvaluateScopesProps = {
    clientId: string;
    protocol: string;
};

const ProtocolMappers = ({
    protocolMappers
}: {
    protocolMappers: ProtocolMapperRepresentation[];
}) => {
    const [key, setKey] = useState(0);
    useEffect(() => {
        setKey(key + 1);
    }, [protocolMappers]);
    return (
        <KeycloakDataTable
            key={key}
            loader={() => Promise.resolve(protocolMappers)}
            ariaLabelKey="effectiveProtocolMappers"
            searchPlaceholderKey="searchForProtocol"
            data-testid="effective-protocol-mappers"
            columns={[
                {
                    name: "mapperName",
                    displayKey: "name"
                },
                {
                    name: "containerName",
                    displayKey: "parentClientScope"
                },
                {
                    name: "type.category",
                    displayKey: "category"
                },
                {
                    name: "type.priority",
                    displayKey: "priority"
                }
            ]}
        />
    );
};

const EffectiveRoles = ({ effectiveRoles }: { effectiveRoles: RoleRepresentation[] }) => {
    const [key, setKey] = useState(0);
    useEffect(() => {
        setKey(key + 1);
    }, [effectiveRoles]);

    return (
        <KeycloakDataTable
            key={key}
            loader={() => Promise.resolve(effectiveRoles)}
            ariaLabelKey="effectiveRoleScopeMappings"
            searchPlaceholderKey="searchForRole"
            data-testid="effective-role-scope-mappings"
            columns={[
                {
                    name: "name",
                    displayKey: "role"
                },
                {
                    name: "containerId",
                    displayKey: "origin"
                }
            ]}
        />
    );
};

export const EvaluateScopes = ({ clientId, protocol }: EvaluateScopesProps) => {
    const { adminClient } = useAdminClient();

    const prefix = "openid";
    const { t } = useTranslation();
    const { enabled } = useHelp();
    const { realm } = useRealm();
    const mapperTypes = useServerInfo().protocolMapperTypes![protocol];

    const [selectableScopes, setSelectableScopes] = useState<ClientScopeRepresentation[]>(
        []
    );
    const [isScopeOpen, setIsScopeOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([prefix]);
    const [activeTab, setActiveTab] = useState(0);

    const [key, setKey] = useState("");
    const refresh = () => setKey(`${new Date().getTime()}`);
    const [effectiveRoles, setEffectiveRoles] = useState<RoleRepresentation[]>([]);
    const [protocolMappers, setProtocolMappers] = useState<
        ProtocolMapperRepresentation[]
    >([]);
    const [accessToken, setAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [idToken, setIdToken] = useState("");

    const form = useForm();
    const { watch } = form;
    const selectedAudience: string[] = watch("targetAudience");

    const { hasAccess } = useAccess();
    const hasViewUsers = hasAccess("view-users");

    useFetch(
        () => adminClient.clients.listOptionalClientScopes({ id: clientId }),
        optionalClientScopes => setSelectableScopes(optionalClientScopes),
        []
    );

    useFetch(
        async () => {
            const scope = selected.join(" ");
            const effectiveRoles = await adminClient.clients.evaluatePermission({
                id: clientId,
                roleContainer: realm,
                scope,
                type: "granted"
            });

            const mapperList = (await adminClient.clients.evaluateListProtocolMapper({
                id: clientId,
                scope
            })) as ({
                type: ProtocolMapperTypeRepresentation;
            } & ProtocolMapperRepresentation)[];

            return {
                mapperList,
                effectiveRoles
            };
        },
        ({ mapperList, effectiveRoles }) => {
            setEffectiveRoles(effectiveRoles);
            mapperList.map(mapper => {
                mapper.type = mapperTypes.find(
                    type => type.id === mapper.protocolMapper
                )!;
            });

            setProtocolMappers(mapperList);
            refresh();
        },
        [selected]
    );

    useFetch(
        async () => {
            const scope = selected.join(" ");
            const user = form.getValues("user");
            if (user.length === 0) {
                return [];
            }
            const audience = selectedAudience.join(" ");

            return await Promise.all([
                adminClient.clients.evaluateGenerateAccessToken({
                    id: clientId,
                    userId: user[0],
                    scope,
                    audience
                }),
                adminClient.clients.evaluateGenerateUserInfo({
                    id: clientId,
                    userId: user[0],
                    scope
                }),
                adminClient.clients.evaluateGenerateIdToken({
                    id: clientId,
                    userId: user[0],
                    scope
                })
            ]);
        },
        ([accessToken, userInfo, idToken]) => {
            setAccessToken(prettyPrintJSON(accessToken));
            setUserInfo(prettyPrintJSON(userInfo));
            setIdToken(prettyPrintJSON(idToken));
        },
        [form.getValues("user"), selected, selectedAudience]
    );

    const copyScopeToClipboard = () => {
        void navigator.clipboard.writeText(selected.join(" "));
    };

    return (
        <>
            <div className="bg-muted/30 p-4">
                {enabled && (
                    <p className="keycloak__section_intro__help text-sm flex items-center gap-1">
                        <Question className="size-4" /> {t("evaluateExplain")}
                    </p>
                )}
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="scopeParameter" className="flex items-center gap-1">
                            {t("scopeParameter")}
                            <HelpItem
                                helpText={t("scopeParameterHelp")}
                                fieldLabelId="scopeParameter"
                            />
                        </Label>
                        <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <KeycloakSelect
                                    toggleId="scopeParameter"
                                    variant={SelectVariant.typeaheadMulti}
                                    typeAheadAriaLabel={t("scopeParameter")}
                                    onToggle={() => setIsScopeOpen(!isScopeOpen)}
                                    isOpen={isScopeOpen}
                                    selections={selected}
                                    onSelect={value => {
                                        const option = value as string;
                                        if (selected.includes(option)) {
                                            if (option !== prefix) {
                                                setSelected(
                                                    selected.filter(
                                                        item => item !== option
                                                    )
                                                );
                                            }
                                        } else {
                                            setSelected([...selected, option]);
                                        }
                                    }}
                                    aria-labelledby={t("scopeParameter")}
                                    placeholderText={t("scopeParameterPlaceholder")}
                                >
                                    {selectableScopes.map((option, index) => (
                                        <SelectOption key={index} value={option.name}>
                                            {option.name}
                                        </SelectOption>
                                    ))}
                                </KeycloakSelect>
                            </div>
                            <div className="flex gap-1 keycloak__scopes_evaluate__clipboard-copy">
                                <Input
                                    readOnly
                                    className="flex-1 min-w-[120px] font-mono text-sm"
                                    value={selected.join(" ")}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={copyScopeToClipboard}
                                    aria-label={t("copyToClipboard")}
                                >
                                    {t("copy")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    {hasViewUsers && (
                        <FormProvider {...form}>
                            <UserSelect
                                name="user"
                                label="users"
                                helpText={t("userHelp")}
                                defaultValue=""
                                variant={SelectVariant.typeahead}
                                isRequired
                            />
                        </FormProvider>
                    )}
                    <FormProvider {...form}>
                        <ClientSelect
                            name="targetAudience"
                            label={t("targetAudience")}
                            helpText={t("targetAudienceHelp")}
                            defaultValue={[]}
                            variant="typeaheadMulti"
                            placeholderText={t("targetAudiencePlaceHolder")}
                        />
                    </FormProvider>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 keycloak__scopes_evaluate__tabs">
                <div className="lg:col-span-2">
                    <Tabs value={String(activeTab)} onValueChange={v => setActiveTab(Number(v))} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="0" data-testid="effective-protocol-mappers-tab">
                                {t("effectiveProtocolMappers")}
                            </TabsTrigger>
                            <TabsTrigger value="1" data-testid="effective-role-scope-mappings-tab">
                                {t("effectiveRoleScopeMappings")}
                            </TabsTrigger>
                            <TabsTrigger value="2" data-testid="generated-access-token-tab">
                                {t("generatedAccessToken")}
                            </TabsTrigger>
                            <TabsTrigger value="3" data-testid="generated-id-token-tab">
                                {t("generatedIdToken")}
                            </TabsTrigger>
                            <TabsTrigger value="4" data-testid="generated-user-info-tab">
                                {t("generatedUserInfo")}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="0" id="effectiveProtocolMappers">
                            <ProtocolMappers protocolMappers={protocolMappers} />
                        </TabsContent>
                        <TabsContent value="1" id="effectiveRoleScopeMappings">
                            <EffectiveRoles effectiveRoles={effectiveRoles} />
                        </TabsContent>
                        <TabsContent value="2" id="tab-generated-access-token">
                            <GeneratedCodeTab
                                text={accessToken}
                                user={form.getValues("user")}
                                label="generatedAccessToken"
                            />
                        </TabsContent>
                        <TabsContent value="3" id="tab-generated-id-token">
                            <GeneratedCodeTab
                                text={idToken}
                                user={form.getValues("user")}
                                label="generatedIdToken"
                            />
                        </TabsContent>
                        <TabsContent value="4" id="tab-generated-user-info">
                            <GeneratedCodeTab
                                text={userInfo}
                                user={form.getValues("user")}
                                label="generatedUserInfo"
                            />
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="flex flex-col gap-2">
                    <HelpItem
                        fieldLabelId="effectiveProtocolMappers"
                        helpText={t("effectiveProtocolMappersHelp")}
                        noVerticalAlign={false}
                        unWrap
                    />
                    <HelpItem
                        fieldLabelId="effectiveRoleScopeMappings"
                        helpText={t("effectiveRoleScopeMappingsHelp")}
                        noVerticalAlign={false}
                        unWrap
                    />
                    <HelpItem
                        fieldLabelId="generatedAccessToken"
                        helpText={t("generatedAccessTokenHelp")}
                        noVerticalAlign={false}
                        unWrap
                    />
                    <HelpItem
                        fieldLabelId="generatedIdToken"
                        helpText={t("generatedIdTokenHelp")}
                        noVerticalAlign={false}
                        unWrap
                    />
                    <HelpItem
                        fieldLabelId="generatedUserInfo"
                        helpText={t("generatedUserInfoHelp")}
                        noVerticalAlign={false}
                        unWrap
                    />
                </div>
            </div>
        </>
    );
};
