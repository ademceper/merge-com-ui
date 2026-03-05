import type { OrganizationState } from "../types";
import { useDecodedToken } from "./helpers";

export function useOrganization(): OrganizationState {
  const { orgId, orgName } = useDecodedToken();

  return {
    isLoaded: true,
    organization: {
      id: orgId,
      name: orgName,
      slug: orgId,
      imageUrl: "",
      membersCount: 1,
      createdAt: new Date().toISOString(),
      publicMetadata: {},
      reload: async () => {},
    },
    membership: { role: "org:admin" },
  };
}
