import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Separator } from "@merge/ui/components/separator";
import { Card, CardContent } from "@merge/ui/components/card";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Badge } from "@merge/ui/components/badge";
import { AppWindowIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";

type AppItem = {
    client?: { clientId?: string; name?: string; description?: string };
    clientId?: string;
    clientName?: string;
    description?: string;
    effectiveUrl?: string;
    consent?: {
        grantedClientScopes?: string[];
        createdDate?: number;
        lastUpdatedDate?: number;
    };
};

export default function Applications(props: PageProps<Extract<KcContext, { pageId: "applications.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, applications, message } = kcContext;

    const { msg } = i18n;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{msg("applicationsTitle")}</h3>
                <p className="text-sm text-muted-foreground">{msg("applicationsDescription")}</p>
            </div>
            <Separator />

            {message && (
                <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.summary}</AlertDescription>
                </Alert>
            )}

            {applications?.applications && applications.applications.length > 0 ? (
                <div className="space-y-4">
                    {(applications.applications as AppItem[]).map((app) => {
                        const clientId = app.client?.clientId ?? app.clientId ?? "";
                        const displayName = app.client?.name ?? app.clientName ?? app.client?.clientId ?? app.clientId ?? "";
                        const description = app.client?.description ?? app.description;
                        return (
                        <div key={clientId} className="rounded-md border p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded bg-primary/10 shrink-0">
                                        <AppWindowIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <div className="text-base font-medium">{displayName}</div>
                                        {description && (
                                            <div className="text-sm text-muted-foreground">{description}</div>
                                        )}
                                        {app.effectiveUrl && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <ArrowSquareOutIcon className="h-4 w-4 shrink-0" />
                                                <a
                                                    href={app.effectiveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline truncate"
                                                >
                                                    {app.effectiveUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <form action={url.applicationsUrl} method="post" className="shrink-0">
                                    <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                    <input type="hidden" name="clientId" value={clientId} />
                                    <input type="hidden" name="action" value="revoke" />
                                    <Button type="submit" variant="destructive" size="sm">
                                        {msg("revokeAccess")}
                                    </Button>
                                </form>
                            </div>

                            <div className="space-y-3">
                                {app.consent && (
                                    <div className="pt-3 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            Granted Permissions:
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {(app.consent.grantedClientScopes ?? []).map((scope: string) => (
                                                <Badge key={scope} variant="secondary" className="text-xs">
                                                    {scope}
                                                </Badge>
                                            ))}
                                        </div>
                                        {app.consent.createdDate != null && (
                                            <div className="text-sm text-muted-foreground mt-3">
                                                Granted on: {new Date(app.consent.createdDate).toLocaleDateString()}
                                            </div>
                                        )}
                                        {app.consent.lastUpdatedDate != null && app.consent.lastUpdatedDate !== app.consent.createdDate && (
                                            <div className="text-sm text-muted-foreground">
                                                Last updated: {new Date(app.consent.lastUpdatedDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {msg("noApplications")}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

