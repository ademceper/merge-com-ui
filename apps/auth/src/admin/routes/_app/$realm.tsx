import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm")({
    component: () => <Outlet />
});
