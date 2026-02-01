import { ReactNode } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button, buttonVariants } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { cn } from "@/lib/utils";

interface AccountLayoutProps {
    kcContext: KcContext;
    i18n: I18n;
    children: ReactNode;
    currentPage: string;
}

export default function AccountLayout({ kcContext, i18n, children, currentPage }: AccountLayoutProps) {
    const { url } = kcContext;
    const { msg } = i18n;

    const sidebarNavItems = [
        {
            title: msg("personalInfo"),
            href: url.accountUrl,
            pageId: "account.ftl"
        },
        {
            title: msg("changePassword"),
            href: url.passwordUrl,
            pageId: "password.ftl"
        },
        {
            title: msg("authenticator"),
            href: url.totpUrl,
            pageId: "totp.ftl"
        },
        {
            title: msg("deviceActivity"),
            href: url.sessionsUrl,
            pageId: "sessions.ftl"
        },
        {
            title: msg("applicationsTitle"),
            href: url.applicationsUrl,
            pageId: "applications.ftl"
        },
        {
            title: msg("linkedAccounts"),
            href: url.socialUrl,
            pageId: "federatedIdentity.ftl",
            show: !!url.socialUrl
        },
        {
            title: msg("logTitle"),
            href: url.logUrl,
            pageId: "log.ftl",
            show: !!url.logUrl
        }
    ].filter(item => item.show !== false);

    return (
        <div className="container mx-auto p-4 md:p-10 pb-16 max-w-7xl">
            <div className="space-y-0.5 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{msg("accountManagementTitle")}</h2>
                <p className="text-muted-foreground">
                    {msg("accountSecurityDescription")}
                </p>
            </div>
            <Separator className="mb-6" />
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                <aside className="w-full lg:w-64 shrink-0">
                    <nav className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 lg:flex-col lg:overflow-visible">
                        {sidebarNavItems.map((item) => (
                            <a
                                key={item.pageId}
                                href={item.href}
                                className={cn(
                                    buttonVariants({ variant: "ghost" }),
                                    currentPage === item.pageId
                                        ? "bg-muted hover:bg-muted"
                                        : "hover:bg-transparent hover:underline",
                                    "justify-start whitespace-nowrap lg:whitespace-normal"
                                )}
                            >
                                {item.title}
                            </a>
                        ))}
                    </nav>
                    <Separator className="my-4" />
                    <div>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            asChild
                        >
                            <a href={url.getLogoutUrl()}>
                                {msg("doSignOut")}
                            </a>
                        </Button>
                    </div>
                </aside>
                <div className="flex-1 w-full lg:max-w-2xl">{children}</div>
            </div>
        </div>
    );
}

