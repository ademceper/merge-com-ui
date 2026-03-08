import { createFileRoute } from "@tanstack/react-router";

// This route exists for the route tree but the parent page (client-details)
// renders the AuthorizationScopes component directly with the required props.
export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/scope/",
)({
    component: () => null,
});
