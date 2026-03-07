import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CatchAllRoute = lazy(() =>
    import("../../pages/catch-all-route").then((m) => ({
        default: m.CatchAllRoute,
    })),
);

export const Route = createFileRoute("/_app/$")({
    component: CatchAllRoute,
});
