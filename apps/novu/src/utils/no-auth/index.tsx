import React, { type ReactNode } from 'react';

// No-auth stub for @clerk/clerk-react — all auth is bypassed

const MOCK_USER = {
  id: 'local-user',
  firstName: 'Local',
  lastName: 'User',
  fullName: 'Local User',
  primaryEmailAddress: { emailAddress: 'local@novu.local' },
  emailAddresses: [{ emailAddress: 'local@novu.local' }],
  imageUrl: '',
  publicMetadata: {},
  unsafeMetadata: { newDashboardOptInStatus: 'OPTED_IN', newDashboardFirstVisit: false },
  externalId: 'local-user',
  createdAt: new Date().toISOString(),
  update: async () => MOCK_USER,
};

const MOCK_ORG = {
  id: 'local-org',
  name: 'Local Organization',
  slug: 'local-org',
  imageUrl: '',
  membersCount: 1,
  createdAt: new Date().toISOString(),
  publicMetadata: {},
};

export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: MOCK_USER.id,
    orgId: MOCK_ORG.id,
    orgRole: 'org:admin',
    signOut: async () => {},
    getToken: async () => '',
    has: () => true,
  };
}

export function useUser() {
  return { isLoaded: true, isSignedIn: true, user: MOCK_USER };
}

export function useOrganization() {
  return { isLoaded: true, organization: MOCK_ORG, membership: { role: 'org:admin' } };
}

export function useOrganizationList() {
  return {
    isLoaded: true,
    organizationList: [{ organization: MOCK_ORG, membership: { role: 'org:admin' } }],
    setActive: async () => null,
    userMemberships: {
      isLoading: false,
      isFetching: false,
      data: [{ organization: MOCK_ORG, role: 'org:admin' }],
      hasNextPage: false,
      fetchNext: async () => {},
    },
  };
}

export function useClerk() {
  return {
    setActive: async () => {},
    session: { getToken: async () => '' },
  };
}

export function SignedIn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignedOut(_props: { children: ReactNode }) {
  return null;
}

export function RedirectToSignIn() {
  return null;
}

export function Protect({ children }: { children: ReactNode; [key: string]: any }) {
  return <>{children}</>;
}

export function SignIn() {
  return null;
}

export function SignUp() {
  return null;
}

export function OrganizationList() {
  return null;
}

export function OrganizationProfile() {
  return null;
}

export function OrganizationSwitcher() {
  return null;
}

export function UserButton() {
  return null;
}

export function UserProfile() {
  return null;
}

export const ClerkContext = React.createContext({});

// Stub window.Clerk for getToken() calls
(window as any).Clerk = {
  loggedIn: true,
  session: {
    getToken: async () => '',
  },
};
