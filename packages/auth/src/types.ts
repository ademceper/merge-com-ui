export type * from "oidc-spa/react-spa";

type LogoutParams =
  | { redirectTo: "home" | "current page" }
  | { redirectTo: "specific url"; url: string };

export type AuthState = {
  isLoaded: true;
  isSignedIn: true;
  userId: string;
  orgId: string;
  orgRole: string;
  signOut: (params: LogoutParams) => Promise<never>;
  getToken: () => Promise<string>;
  has: () => boolean;
};

export type EmailAddress = {
  emailAddress: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  primaryEmailAddress: EmailAddress;
  emailAddresses: EmailAddress[];
  imageUrl: string;
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
  externalId: string;
  createdAt: string;
  update: () => Promise<User>;
  reload: () => Promise<void>;
};

export type UserState = {
  isLoaded: true;
  isSignedIn: true;
  user: User;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  membersCount: number;
  createdAt: string;
  publicMetadata: Record<string, unknown>;
  reload: () => Promise<void>;
};

export type Membership = {
  role: string;
};

export type OrganizationState = {
  isLoaded: true;
  organization: Organization;
  membership: Membership;
};

export type OrganizationListItem = {
  organization: Omit<Organization, "reload">;
  membership: Membership;
};

export type UserMemberships = {
  isLoading: false;
  isFetching: false;
  data: { organization: Omit<Organization, "reload">; role: string }[];
  hasNextPage: false;
  fetchNext: () => Promise<void>;
};

export type OrganizationListState = {
  isLoaded: true;
  organizationList: OrganizationListItem[];
  setActive: () => Promise<null>;
  userMemberships: UserMemberships;
};
