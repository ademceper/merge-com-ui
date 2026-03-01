import { ReactNode, useMemo } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextValue } from './types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(
    () =>
      ({
        isUserLoaded: true,
        isOrganizationLoaded: true,
        currentUser: {
          _id: 'local-user',
          firstName: 'Local',
          lastName: 'User',
          email: 'local@novu.local',
          profilePicture: '',
          createdAt: new Date().toISOString(),
          showOnBoarding: false,
          showOnBoardingTour: 0,
          servicesHashes: {},
        },
        currentOrganization: {
          _id: 'local-org',
          name: 'Local Organization',
          createdAt: new Date().toISOString(),
          apiServiceLevel: 'free',
        },
      }) as AuthContextValue,
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
