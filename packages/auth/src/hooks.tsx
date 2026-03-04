import { useOidc } from "./keycloak";

/**
 * Auth compatibility hooks — maps Keycloak OIDC token data
 * to the interface shapes expected by existing components.
 */

export function useAuth() {
  const { decodedIdToken, logout } = useOidc();
  const token = decodedIdToken as Record<string, unknown>;

  return {
    isLoaded: true,
    isSignedIn: true,
    userId: (token.sub as string) ?? 'unknown',
    orgId: (token.org_id as string) ?? 'default-org',
    orgRole: 'org:admin',
    signOut: logout,
    getToken: async () => '',
    has: () => true,
  };
}

export function useUser() {
  const { decodedIdToken } = useOidc();
  const token = decodedIdToken as Record<string, unknown>;

  const user = {
    id: (token.sub as string) ?? 'unknown',
    firstName: (token.given_name as string) ?? (token.preferred_username as string) ?? '',
    lastName: (token.family_name as string) ?? '',
    fullName: `${(token.given_name as string) ?? ''} ${(token.family_name as string) ?? ''}`.trim(),
    primaryEmailAddress: { emailAddress: (token.email as string) ?? '' },
    emailAddresses: [{ emailAddress: (token.email as string) ?? '' }],
    imageUrl: (token.picture as string) ?? '',
    publicMetadata: {},
    unsafeMetadata: { newDashboardOptInStatus: 'OPTED_IN', newDashboardFirstVisit: false },
    externalId: (token.sub as string) ?? 'unknown',
    createdAt: new Date().toISOString(),
    update: async () => user,
    reload: async () => {},
  };

  return { isLoaded: true, isSignedIn: true, user };
}

export function useOrganization() {
  const { decodedIdToken } = useOidc();
  const token = decodedIdToken as Record<string, unknown>;

  const organization = {
    id: (token.org_id as string) ?? 'default-org',
    name: (token.org_name as string) ?? 'Organization',
    slug: (token.org_id as string) ?? 'default-org',
    imageUrl: '',
    membersCount: 1,
    createdAt: new Date().toISOString(),
    publicMetadata: {},
    reload: async () => {},
  };

  return { isLoaded: true, organization, membership: { role: 'org:admin' } };
}

export function useOrganizationList(_opts?: unknown) {
  const { decodedIdToken } = useOidc();
  const token = decodedIdToken as Record<string, unknown>;

  const org = {
    id: (token.org_id as string) ?? 'default-org',
    name: (token.org_name as string) ?? 'Organization',
    slug: (token.org_id as string) ?? 'default-org',
    imageUrl: '',
    membersCount: 1,
    createdAt: new Date().toISOString(),
    publicMetadata: {},
  };

  return {
    isLoaded: true,
    organizationList: [{ organization: org, membership: { role: 'org:admin' } }],
    setActive: async () => null,
    userMemberships: {
      isLoading: false,
      isFetching: false,
      data: [{ organization: org, role: 'org:admin' }],
      hasNextPage: false,
      fetchNext: async () => {},
    },
  };
}
