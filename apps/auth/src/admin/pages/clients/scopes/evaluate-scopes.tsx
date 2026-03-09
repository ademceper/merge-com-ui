import type ClientScopeRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientScopeRepresentation";
import type ProtocolMapperRepresentation from "@keycloak/keycloak-admin-client/lib/defs/protocolMapperRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import type { ProtocolMapperTypeRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";
import { Popover, PopoverContent, PopoverTrigger } from "@merge-rd/ui/components/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge-rd/ui/components/tabs";
import { Question } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type ColumnDef, DataTable } from "@/admin/shared/ui/data-table";
import { HelpItem, SelectVariant, useHelp } from "@/shared/keycloak-ui-shared";
import {
    evaluatePermission,
    evaluateListProtocolMapper,
    evaluateGenerateAccessToken,
    evaluateGenerateUserInfo,
    evaluateGenerateIdToken
} from "@/admin/api/clients";
import { useAccess } from "@/admin/app/providers/access/access";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useServerInfo } from "@/admin/app/providers/server-info/server-info-provider";
import { prettyPrintJSON } from "@/admin/shared/lib/util";
import { ClientSelect } from "@/admin/shared/ui/client/client-select";
import { UserSelect } from "@/admin/shared/ui/users/user-select";
import { useClientAssignedScopes } from "../hooks/use-client-assigned-scopes";
import { GeneratedCodeTab } from "./generated-code-tab";

type EvaluateScopesProps = {
    clientId: string;
    protocol: string;
};

const ProtocolMappers = ({
    protocolMappers
}: {
    protocolMappers: ProtocolMapperRepresentation[];
}) => {
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    useEffect(() => {
        setKey(key + 1);
    }, [protocolMappers]);

    const columns: ColumnDef<ProtocolMapperRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "mapperName",
                header: t("name"),
                cell: ({ row }) =>
                    ((row.original as Record<string, unknown>).mapperName as string) ||
                    "-"
            },
            {
                accessorKey: "containerName",
                header: t("parentClientScope"),
                cell: ({ row }) =>
                    ((row.original as Record<string, unknown>).containerName as string) ||
                    "-"
            },
            {
                id: "category",
                header: t("category"),
                cell: ({ row }) =>
                    (
                        row.original as Record<string, unknown> & {
                            type?: { category?: string };
                        }
                    ).type?.category || "-"
            },
            {
                id: "priority",
                header: t("priority"),
                cell: ({ row }) =>
                    (
                        row.original as Record<string, unknown> & {
                            type?: { priority?: string };
                        }
                    ).type?.priority || "-"
            }
        ],
        [t]
    );

    return (
        <DataTable
            key={key}
            columns={columns}
            data={protocolMappers}
            searchColumnId="mapperName"
            searchPlaceholder={t("searchForProtocol")}
            emptyMessage={t("noProtocolMappers")}
        />
    );
};

const EffectiveRoles = ({ effectiveRoles }: { effectiveRoles: RoleRepresentation[] }) => {
    const { t } = useTranslation();
    const [key, setKey] = useState(0);
    useEffect(() => {
        setKey(key + 1);
    }, [effectiveRoles]);

    const columns: ColumnDef<RoleRepresentation>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: t("role"),
                cell: ({ row }) => row.original.name || "-"
            },
            {
                accessorKey: "containerId",
                header: t("origin"),
                cell: ({ row }) => row.original.containerId || "-"
            }
        ],
        [t]
    );

    return (
        <DataTable
            key={key}
            columns={columns}
            data={effectiveRoles}
            searchColumnId="name"
            searchPlaceholder={t("searchForRole")}
            emptyMessage={t("noRoles")}
        />
    );
};

export const EvaluateScopes = ({ clientId, protocol }: EvaluateScopesProps) => {

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

    const { data: optionalScopesData } = useClientAssignedScopes(clientId);
    useEffect(() => {
        if (optionalScopesData?.optionalClientScopes) {
            setSelectableScopes(optionalScopesData.optionalClientScopes);
        }
    }, [optionalScopesData]);

    const scopeStr = selected.join(" ");
    const { data: evalData } = useQuery({
        queryKey: ["clientEvaluate", clientId, scopeStr],
        queryFn: async () => {
            const effectiveRoles = await evaluatePermission(
                clientId,
                realm,
                scopeStr
            );
            const mapperList = (await evaluateListProtocolMapper(
                clientId,
                scopeStr
            )) as ({
                type: ProtocolMapperTypeRepresentation;
            } & ProtocolMapperRepresentation)[];
            return { mapperList, effectiveRoles };
        }
    });

    useEffect(() => {
        if (!evalData) return;
        setEffectiveRoles(evalData.effectiveRoles);
        const mapped = evalData.mapperList.map(mapper => ({
            ...mapper,
            type: mapperTypes.find(type => type.id === mapper.protocolMapper)!
        }));
        setProtocolMappers(mapped);
    }, [evalData, mapperTypes]);

    const userValue = form.getValues("user");
    const audienceStr = selectedAudience?.join(" ") ?? "";
    const { data: tokenData } = useQuery({
        queryKey: ["clientEvaluateTokens", clientId, scopeStr, userValue, audienceStr],
        queryFn: async () => {
            if (!userValue || userValue.length === 0) return null;
            const [at, ui, it] = await Promise.all([
                evaluateGenerateAccessToken(
                    clientId,
                    userValue[0],
                    scopeStr,
                    audienceStr
                ),
                evaluateGenerateUserInfo(
                    clientId,
                    userValue[0],
                    scopeStr
                ),
                evaluateGenerateIdToken(
                    clientId,
                    userValue[0],
                    scopeStr
                )
            ]);
            return { accessToken: at, userInfo: ui, idToken: it };
        },
        enabled: !!userValue && userValue.length > 0
    });

    useEffect(() => {
        if (!tokenData) return;
        setAccessToken(prettyPrintJSON(tokenData.accessToken));
        setUserInfo(prettyPrintJSON(tokenData.userInfo));
        setIdToken(prettyPrintJSON(tokenData.idToken));
    }, [tokenData]);

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
                        <Label
                            htmlFor="scopeParameter"
                            className="flex items-center gap-1"
                        >
                            {t("scopeParameter")}
                            <HelpItem
                                helpText={t("scopeParameterHelp")}
                                fieldLabelId="scopeParameter"
                            />
                        </Label>
                        <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <Popover open={isScopeOpen} onOpenChange={setIsScopeOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="scopeParameter"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isScopeOpen}
                                            aria-labelledby={t("scopeParameter")}
                                            className="min-h-9 w-full justify-between font-normal"
                                        >
                                            <span className="truncate">
                                                {selected.length > 0
                                                    ? selected.join(", ")
                                                    : t("scopeParameterPlaceholder")}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-(--radix-popover-trigger-width) p-0"
                                        align="start"
                                    >
                                        <ul className="max-h-64 overflow-auto py-1">
                                            {selectableScopes.map(scope => {
                                                const option = scope.name ?? "";
                                                const isSelected =
                                                    selected.includes(option);
                                                return (
                                                    <li
                                                        key={option}
                                                        aria-selected={isSelected}
                                                        className="hover:bg-accent cursor-pointer px-2 py-1.5 text-sm"
                                                        onMouseDown={e =>
                                                            e.preventDefault()
                                                        }
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                if (option !== prefix) {
                                                                    setSelected(
                                                                        selected.filter(
                                                                            item =>
                                                                                item !==
                                                                                option
                                                                        )
                                                                    );
                                                                }
                                                            } else {
                                                                setSelected([
                                                                    ...selected,
                                                                    option
                                                                ]);
                                                            }
                                                        }}
                                                    >
                                                        {option}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        {selected.length > 0 && (
                                            <div className="border-t px-2 py-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-full justify-center"
                                                    onClick={() => setSelected([])}
                                                >
                                                    {t("clear")}
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
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
                    <Tabs
                        value={String(activeTab)}
                        onValueChange={v => setActiveTab(Number(v))}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger
                                value="0"
                                data-testid="effective-protocol-mappers-tab"
                            >
                                {t("effectiveProtocolMappers")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="1"
                                data-testid="effective-role-scope-mappings-tab"
                            >
                                {t("effectiveRoleScopeMappings")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="2"
                                data-testid="generated-access-token-tab"
                            >
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
