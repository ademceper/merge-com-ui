import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddJWTAuthorizationGrantConnect = lazy(
    () =>
        import(
            "../../pages/identity-providers/add/add-jwt-authorization-grant"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/jwt-authorization-grant/add",
)({
    component: AddJWTAuthorizationGrantConnect,
});
