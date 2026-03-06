import type { AppRouteObject } from "../routes";
import {
    DashboardRoute,
    DashboardRouteWithRealm,
    DashboardRouteWithTab
} from "./routes/dashboard";

const routes: AppRouteObject[] = [
    DashboardRoute,
    DashboardRouteWithRealm,
    DashboardRouteWithTab
];

export default routes;
