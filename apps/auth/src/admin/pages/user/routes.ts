import type { AppRouteObject } from "../../app/routes";
import { AddUserRoute } from "./routes/add-user";
import { UserRoute } from "./routes/user";
import { UsersRoute, UsersRouteWithTab } from "./routes/users";

const routes: AppRouteObject[] = [AddUserRoute, UsersRoute, UsersRouteWithTab, UserRoute];

export default routes;
