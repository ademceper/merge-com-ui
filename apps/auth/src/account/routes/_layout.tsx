import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorPage } from "../../shared/keycloak-ui-shared";
import { Header } from "../widgets/header";
import { PageNav } from "../widgets/page-nav";
import { Separator } from "@merge-rd/ui/components/separator";

function AccountLayout() {
    return (
        <div className="container mx-auto p-4 md:p-10 pb-16 max-w-7xl">
            <div className="w-full lg:max-w-[58rem] mx-auto">
                <Header />
                <Separator className="mb-6" />
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                    <aside className="w-full lg:w-64 shrink-0">
                        <PageNav />
                    </aside>
                    <div className="flex-1 w-full min-w-0 lg:max-w-2xl">
                        <Suspense>
                            <Outlet />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute("/_layout")({
    component: AccountLayout,
    errorComponent: ErrorPage,
});
