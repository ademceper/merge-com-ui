import type { AppRouteObject } from "../../app/routes";
import { GroupsRoute, GroupsWithIdRoute } from "./routes/groups";

const routes: AppRouteObject[] = [GroupsRoute, GroupsWithIdRoute];

export default routes;
