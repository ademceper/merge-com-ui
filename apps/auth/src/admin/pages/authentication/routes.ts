import type { AppRouteObject } from "../../app/routes";
import { AuthenticationRoute, AuthenticationRouteWithTab } from "./routes/authentication";
import { CreateFlowRoute } from "./routes/create-flow";
import { FlowRoute, FlowWithBuiltInRoute } from "./routes/flow";

const routes: AppRouteObject[] = [
    AuthenticationRoute,
    AuthenticationRouteWithTab,
    CreateFlowRoute,
    FlowRoute,
    FlowWithBuiltInRoute
];

export default routes;
