/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/routes.tsx"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { IndexRouteObject, RouteObject } from "react-router-dom";
import { Organizations } from "../pages/organizations/organizations";
import { environment } from "./environment";

const DeviceActivity = lazy(() => import("../pages/account-security/device-activity"));
const LinkedAccounts = lazy(() => import("../pages/account-security/linked-accounts"));
const SigningIn = lazy(() => import("../pages/account-security/signing-in"));
const Applications = lazy(() => import("../pages/applications/applications"));
const Groups = lazy(() => import("../pages/groups/groups"));
const PersonalInfo = lazy(() => import("../pages/personal-info/personal-info"));
const Resources = lazy(() => import("../pages/resources/resources"));
const ContentComponent = lazy(() => import("../pages/content/content-component"));
const Oid4Vci = lazy(() => import("../pages/oid4vci/oid4-vci"));

const DeviceActivityRoute: RouteObject = {
    path: "account-security/device-activity",
    element: <DeviceActivity />
};

const LinkedAccountsRoute: RouteObject = {
    path: "account-security/linked-accounts",
    element: <LinkedAccounts />
};

const SigningInRoute: RouteObject = {
    path: "account-security/signing-in",
    element: <SigningIn />
};

const ApplicationsRoute: RouteObject = {
    path: "applications",
    element: <Applications />
};

const GroupsRoute: RouteObject = {
    path: "groups",
    element: <Groups />
};

const ResourcesRoute: RouteObject = {
    path: "resources",
    element: <Resources />
};

export type ContentComponentParams = {
    componentId: string;
};

const ContentRoute: RouteObject = {
    path: "content/:componentId",
    element: <ContentComponent />
};

const PersonalInfoRoute: IndexRouteObject = {
    index: true,
    element: <PersonalInfo />,
    path: ""
};

const OrganizationsRoute: RouteObject = {
    path: "organizations",
    element: <Organizations />
};

const Oid4VciRoute: RouteObject = {
    path: "oid4vci",
    element: <Oid4Vci />
};

export const routes: RouteObject[] = [
    PersonalInfoRoute,
    DeviceActivityRoute,
    LinkedAccountsRoute,
    SigningInRoute,
    ApplicationsRoute,
    GroupsRoute,
    OrganizationsRoute,
    PersonalInfoRoute,
    ResourcesRoute,
    ContentRoute,
    ...(environment.features.isOid4VciEnabled ? [Oid4VciRoute] : [])
];
