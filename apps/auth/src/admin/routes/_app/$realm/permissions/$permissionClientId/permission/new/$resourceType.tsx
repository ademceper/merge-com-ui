import { createFileRoute } from "@tanstack/react-router";

// This is a dialog component rendered by the parent page (permissions-configuration-tab)
// with state-dependent props. It cannot be rendered as a standalone route component.
export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/permission/new/$resourceType",
)({
    component: () => null,
});
