import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import {
    mainPageContentId,
    KeycloakSpinner,
    ErrorBoundaryFallback
} from "../../shared/keycloak-ui-shared";
import { ErrorRenderer } from "./error/ErrorRenderer";
import { AuthWall } from "../root/AuthWall";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />
            <div className="container mx-auto p-4 md:p-6 pb-16 max-w-7xl">
                <div className="space-y-0.5 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Identity Yönetim Konsolu
                    </h2>
                    <p className="text-muted-foreground">
                        Realm ve kullanıcı yönetimi
                    </p>
                </div>
                <hr className="mb-6 border-border" />
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                    <AdminSidebar />
                    <main
                        id={mainPageContentId}
                        className="flex-1 w-full min-w-0 lg:max-w-[calc(100%-20rem)] overflow-auto"
                    >
                        <ErrorBoundaryFallback fallback={ErrorRenderer}>
                            <Suspense fallback={<KeycloakSpinner />}>
                                <AuthWall>
                                    <Outlet />
                                </AuthWall>
                            </Suspense>
                        </ErrorBoundaryFallback>
                    </main>
                </div>
            </div>
        </div>
    );
}
