import type { User, UserState } from "../types";
import { useDecodedToken } from "./helpers";

export function useUser(): UserState {
  const { sub, givenName, familyName, email, picture } = useDecodedToken();

  const user: User = {
    id: sub,
    firstName: givenName,
    lastName: familyName,
    fullName: `${givenName} ${familyName}`.trim(),
    primaryEmailAddress: { emailAddress: email },
    emailAddresses: [{ emailAddress: email }],
    imageUrl: picture,
    publicMetadata: {},
    unsafeMetadata: { newDashboardOptInStatus: "OPTED_IN", newDashboardFirstVisit: false },
    externalId: sub,
    createdAt: new Date().toISOString(),
    update: async () => user,
    reload: async () => {},
  };

  return { isLoaded: true, isSignedIn: true, user };
}
