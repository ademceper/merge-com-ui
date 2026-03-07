import type { AppRouteObject } from "../../app/routes";
import { AddRoleRoute } from "./routes/add-role";
import { RealmRoleRoute } from "./routes/realm-role";
import { RealmRolesRoute } from "./routes/realm-roles";

const routes: AppRouteObject[] = [RealmRolesRoute, AddRoleRoute, RealmRoleRoute];

export default routes;
