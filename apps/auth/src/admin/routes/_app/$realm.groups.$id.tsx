import { createFileRoute } from "@tanstack/react-router";

// This route exists for the route tree but the parent page (groups-section)
// renders the GroupTable component directly with the required props.
export const Route = createFileRoute("/_app/$realm/groups/$id")({
    component: () => null,
});
