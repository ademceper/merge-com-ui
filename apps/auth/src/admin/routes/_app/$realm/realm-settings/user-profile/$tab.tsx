import { createFileRoute } from "@tanstack/react-router";

// This route exists for the route tree but the parent page (realm-settings-tabs)
// renders the UserProfileTab component directly with the required props.
export const Route = createFileRoute("/_app/$realm/realm-settings/user-profile/$tab")({
    component: () => null
});
