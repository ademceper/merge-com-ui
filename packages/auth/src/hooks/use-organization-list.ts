import type { OrganizationListState } from "../types";
import { useDecodedToken } from "./helpers";

export function useOrganizationList(_opts?: unknown): OrganizationListState {
  const { orgId, orgName } = useDecodedToken();

  const org = {
    id: orgId,
    name: orgName,
    slug: orgId,
    imageUrl: "",
    membersCount: 1,
    createdAt: new Date().toISOString(),
    publicMetadata: {},
  };

  return {
    isLoaded: true,
    organizationList: [{ organization: org, membership: { role: "org:admin" } }],
    setActive: async () => null,
    userMemberships: {
      isLoading: false,
      isFetching: false,
      data: [{ organization: org, role: "org:admin" }],
      hasNextPage: false,
      fetchNext: async () => {},
    },
  };
}
