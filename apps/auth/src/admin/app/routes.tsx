// Re-export from the dedicated route access config file
export type { AppRouteObject, AppRouteObjectHandle } from "./route-access-config";
export { routeAccessConfig as routes } from "./route-access-config";

import { routeAccessConfig } from "./route-access-config";

export const RootRoute = {
    path: "/",
    children: routeAccessConfig
};
