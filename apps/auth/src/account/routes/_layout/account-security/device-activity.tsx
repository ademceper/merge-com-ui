import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DeviceActivity = lazy(() => import("../../../pages/account-security/device-activity"));

export const Route = createFileRoute("/_layout/account-security/device-activity")({
    component: DeviceActivity,
});
