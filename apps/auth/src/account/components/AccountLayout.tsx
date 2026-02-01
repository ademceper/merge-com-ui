import { ReactNode } from "react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Link } from "@merge/ui/components/link";

const logoUrl = `${import.meta.env.BASE_URL}merge-black-text.svg`;
import { buttonVariants } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { cn } from "@merge/ui/lib/utils";

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
        { title: msg("personalInfo"), href: url.accountUrl, pageId: "account.ftl" },
        { title: msg("changePassword"), href: url.passwordUrl, pageId: "password.ftl" },
        { title: msg("authenticator"), href: url.totpUrl, pageId: "totp.ftl" },
        { title: msg("deviceActivity"), href: url.sessionsUrl, pageId: "sessions.ftl" },
        { title: msg("applicationsTitle"), href: url.applicationsUrl, pageId: "applications.ftl" },
        { title: msg("linkedAccounts"), href: url.socialUrl, pageId: "federatedIdentity.ftl", show: !!url.socialUrl },
        { title: msg("logTitle"), href: url.logUrl, pageId: "log.ftl", show: !!url.logUrl },
    ].filter(item => item.show !== false);

    return (
        <div className="container mx-auto p-4 md:p-10 pb-16 max-w-7xl">
            <div className="w-full lg:max-w-[58rem]">
                <header className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] lg:gap-x-12 items-center mb-6 gap-y-4">
                    <div className="flex items-center justify-start">
                        <img src={logoUrl} alt="Merge" className="h-11 w-auto max-w-[13rem] object-contain" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-bold tracking-tight">{msg("accountManagementTitle")}</h2>
                            <p className="text-muted-foreground">{msg("accountSecurityDescription")}</p>
                        </div>
                        <Link href={url.getLogoutUrl()} className="text-foreground hover:text-destructive shrink-0 text-sm font-medium self-start sm:self-center">
                            {msg("doSignOut")}
                        </Link>
                    </div>
                </header>
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
                                        "min-h-11 justify-start whitespace-nowrap lg:whitespace-normal",
                                        currentPage === item.pageId
                                            ? "bg-muted hover:bg-muted hover:text-foreground"
                                            : "hover:bg-muted/60 hover:text-foreground"
                                    )}
                                >
                                    {item.title}
                                </a>
                            ))}
                        </nav>
                    </aside>
                    <div className="flex-1 w-full min-w-0 lg:max-w-2xl">{children}</div>
                </div>
            </div>
        </div>
    );
}
