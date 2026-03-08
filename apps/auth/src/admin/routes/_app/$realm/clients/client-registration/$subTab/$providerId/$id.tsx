import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DetailProvider = lazy(
    () => import("../../../../../../../pages/clients/registration/detail-provider"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/client-registration/$subTab/$providerId/$id",
)({
    component: DetailProvider,
});
