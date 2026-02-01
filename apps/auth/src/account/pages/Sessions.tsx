import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AccountLayout from "../components/AccountLayout";
import { Separator } from "@merge/ui/components/separator";
import { Card, CardContent } from "@merge/ui/components/card";
import { Button } from "@merge/ui/components/button";
import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Badge } from "@merge/ui/components/badge";
import { Monitor, Smartphone as SmartphoneIcon, Globe } from "lucide-react";

export default function Sessions(props: PageProps<Extract<KcContext, { pageId: "sessions.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, sessions, message } = kcContext;

    const { msg, msgStr } = i18n;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <AccountLayout kcContext={kcContext} i18n={i18n} currentPage="sessions.ftl">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">{msg("sessionsTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{msg("sessionsDescription")}</p>
                    </div>
                    <form action={url.sessionsLogoutUrl} method="post">
                        <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                        <Button type="submit" variant="destructive" size="sm">
                            {msg("signOutAll")}
                        </Button>
                    </form>
                </div>
                <Separator />

                {message && (
                    <Alert variant={message.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>{message.summary}</AlertDescription>
                    </Alert>
                )}

                {/* Sessions List */}
                {sessions?.sessions && sessions.sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.sessions.map((session) => (
                            <div key={session.id} className="rounded-md border p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded bg-primary/10">
                                            {session.current ? (
                                                <Monitor className="h-5 w-5 text-primary" />
                                            ) : (
                                                <SmartphoneIcon className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-base font-medium flex items-center gap-2">
                                                {session.browser}
                                                {session.current && (
                                                    <Badge variant="default" className="text-xs">
                                                        {msg("currentSession")}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                <Globe className="h-3 w-3" />
                                                {session.ipAddress}
                                            </div>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <form action={url.sessionsLogoutUrl} method="post">
                                            <input type="hidden" name="stateChecker" value={kcContext.stateChecker} />
                                            <input type="hidden" name="session" value={session.id} />
                                            <Button type="submit" variant="outline" size="sm">
                                                {msgStr("doSignOut")}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">{msg("started")}</div>
                                        <div className="font-medium">{formatDate(session.started)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">{msg("lastAccess")}</div>
                                        <div className="font-medium">{formatDate(session.lastAccess)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">{msg("expires")}</div>
                                        <div className="font-medium">{formatDate(session.expires)}</div>
                                    </div>
                                </div>
                                
                                {session.clients && session.clients.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">{msg("clients")}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {session.clients.map((client) => (
                                                <Badge key={client} variant="secondary" className="text-xs">
                                                    {client}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No active sessions found
                        </CardContent>
                    </Card>
                )}
            </div>
        </AccountLayout>
    );
}

