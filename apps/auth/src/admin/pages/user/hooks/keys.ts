import type {
    UserProfileMetadata
} from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import type { UIUserRepresentation } from "../form-state";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    detail: (id: string) => [...userKeys.all, "detail", id] as const,
    sessions: (id: string) => [...userKeys.all, "sessions", id] as const,
    groups: (id: string, filters?: Record<string, unknown>) =>
        [...userKeys.all, "groups", id, filters] as const,
    consents: (id: string) => [...userKeys.all, "consents", id] as const,
    credentials: (id: string) => [...userKeys.all, "credentials", id] as const,
    organizations: (id: string, filters?: Record<string, unknown>) =>
        [...userKeys.all, "organizations", id, filters] as const,
    federatedIdentities: (id: string) =>
        [...userKeys.all, "federatedIdentities", id] as const,
    availableIdPs: () => [...userKeys.all, "availableIdPs"] as const,
    linkedIdPs: (id: string) => [...userKeys.all, "linkedIdPs", id] as const,
    profileMetadata: (realm: string) =>
        [...userKeys.all, "profileMetadata", realm] as const,
    federationComponent: (federationLink: string) =>
        [...userKeys.all, "federationComponent", federationLink] as const,
    requiredActions: () => [...userKeys.all, "requiredActions"] as const
};

export type UserDetailData = {
    user: UIUserRepresentation;
    userProfileMetadata?: UserProfileMetadata;
    bruteForced: { isBruteForceProtected?: boolean; isLocked?: boolean };
    isUnmanagedAttributesEnabled: boolean;
    upConfig?: import("@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata").UserProfileConfig;
    realmHasOrganizations: boolean;
};
