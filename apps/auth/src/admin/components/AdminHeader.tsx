"use client";

/* eslint-disable */
// @ts-nocheck

import { Separator } from "@merge/ui/components/separator";
import { SidebarTrigger } from "@merge/ui/components/sidebar";
import { ThemeToggleButton } from "@merge/ui/components/theme-toggle";
import { PageBreadCrumbs } from "./bread-crumb/PageBreadCrumbs";

export function AdminHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 h-4 data-[orientation=vertical]:h-4"
                />
                <PageBreadCrumbs />
            </div>
            <div className="flex-1 min-w-0" />
            <div className="flex items-center gap-2 px-4">
                <ThemeToggleButton />
            </div>
        </header>
    );
}
