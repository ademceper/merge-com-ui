import type { AppRouteObject } from "../routes";
import { WorkflowsRoute } from "./routes/workflows";
import { WorkflowDetailRoute } from "./routes/workflow-detail";

const routes: AppRouteObject[] = [WorkflowsRoute, WorkflowDetailRoute];

export default routes;
