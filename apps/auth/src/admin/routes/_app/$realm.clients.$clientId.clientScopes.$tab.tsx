import { createFileRoute } from "@tanstack/react-router";

// This route exists for the route tree but the parent page (client-details)
// renders the ClientScopes component directly with the required props.
export const Route = createFileRoute(
    "/_app/$realm/clients/$clientId/clientScopes/$tab",
)({
    component: () => null,
});
