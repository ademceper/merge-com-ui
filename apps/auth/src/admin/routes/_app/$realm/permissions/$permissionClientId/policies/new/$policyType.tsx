import { createFileRoute } from "@tanstack/react-router";

// This is a dialog component rendered by the parent page (assigned-policies)
// with state-dependent props. It cannot be rendered as a standalone route component.
export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/policies/new/$policyType",
)({
    component: () => null,
});
