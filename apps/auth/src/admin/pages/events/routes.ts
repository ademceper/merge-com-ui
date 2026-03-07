import type { AppRouteObject } from "../../app/routes";
import { EventsRoute, EventsRouteWithTab } from "./routes/events";

const routes: AppRouteObject[] = [EventsRoute, EventsRouteWithTab];

export default routes;
