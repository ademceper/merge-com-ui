import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AccountLayout from "../components/AccountLayout";
import { Separator } from "@merge/ui/components/separator";
import { Card, CardContent } from "@merge/ui/components/card";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Badge } from "@merge/ui/components/badge";
import { AppWindow, ExternalLink } from "lucide-react";

export default function Applications(props: PageProps<Extract<KcContext, { pageId: "applications.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, applications, message } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="applications.ftl">
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

                {/* Applications List */}
                {applications?.applications && applications.applications.length > 0 ? (
                    <div className="space-y-4">
                        {applications.applications.map((app) => (
                            <div key={app.clientId} className="rounded-md border p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-primary/10">
                                            <AppWindow className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-base font-medium">{app.clientName || app.clientId}</div>
                                            {app.description && (
                                                <div className="text-sm text-muted-foreground mt-1">{app.description}</div>
                                            )}
                                        </div>
                                    </div>
                                    <form action={url.applicationsUrl} method="post">
                                        <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                        <input type="hidden" name="clientId" value={app.clientId} />
                                        <input type="hidden" name="action" value="revoke" />
                                        <Button type="submit" variant="outline" size="sm">
                                            {msg("revokeAccess")}
                                        </Button>
                                    </form>
                                </div>
                                
                                <div className="space-y-3">
                                    {app.effectiveUrl && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <ExternalLink className="h-4 w-4" />
                                            <a 
                                                href={app.effectiveUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="hover:underline"
                                            >
                                                {app.effectiveUrl}
                                            </a>
                                        </div>
                                    )}
                                    {app.consent && (
                                        <div className="pt-3 border-t">
                                            <div className="text-sm text-muted-foreground mb-2">
                                                Granted Permissions:
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {app.consent.grantedClientScopes.map((scope) => (
                                                    <Badge key={scope} variant="secondary" className="text-xs">
                                                        {scope}
                                                    </Badge>
                                                ))}
                                            </div>
                                            {app.consent.createdDate && (
                                                <div className="text-sm text-muted-foreground mt-3">
                                                    Granted on: {new Date(app.consent.createdDate).toLocaleDateString()}
                                                </div>
                                            )}
                                            {app.consent.lastUpdatedDate && app.consent.lastUpdatedDate !== app.consent.createdDate && (
                                                <div className="text-sm text-muted-foreground">
                                                    Last updated: {new Date(app.consent.lastUpdatedDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            {msg("noApplications")}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AccountLayout>
    );
}

