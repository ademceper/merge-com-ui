import { type IEnvironment, EnvironmentTypeEnum } from '@novu/shared';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/auth/hooks';
import { EnvironmentContext } from '@/context/environment/environment-context';
import { useFetchEnvironments } from '@/context/environment/hooks';
import { loadFromStorage, saveToStorage } from '@/utils/local-storage';
import { buildRoute, ROUTES } from '@/utils/routes';

const PRODUCTION_ENVIRONMENT = 'Production';
const DEVELOPMENT_ENVIRONMENT = 'Development';
const LAST_SELECTED_ENVIRONMENT_STORAGE_KEY = 'novu-last-selected-environment';

const MOCK_ENVIRONMENTS: IEnvironment[] = [
  {
    _id: 'env-dev',
    name: 'Development',
    _organizationId: 'local-org',
    identifier: 'development',
    slug: 'development',
    widget: { notificationCenterEncryption: false },
    color: '#00d084',
    type: EnvironmentTypeEnum.DEV,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'env-prod',
    name: 'Production',
    _organizationId: 'local-org',
    _parentId: 'env-dev',
    identifier: 'production',
    slug: 'production',
    widget: { notificationCenterEncryption: false },
    color: '#ff6900',
    type: EnvironmentTypeEnum.PROD,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function selectEnvironment(
  environments: IEnvironment[],
  selectedEnvironmentSlug?: string | null,
  organizationId?: string
) {
  let environment: IEnvironment | undefined;

  if (selectedEnvironmentSlug) {
    environment = environments.find((env) => env.slug === selectedEnvironmentSlug);
  }

  if (!environment && organizationId) {
    const lastSelectedSlug = loadFromStorage<string>(
      `${LAST_SELECTED_ENVIRONMENT_STORAGE_KEY}-${organizationId}`,
      'environmentSlug'
    );
    if (lastSelectedSlug) {
      environment = environments.find((env) => env.slug === lastSelectedSlug);
    }
  }

  if (!environment) {
    environment = environments.find((env) => env.name === DEVELOPMENT_ENVIRONMENT);
  }

  if (!environment) {
    throw new Error('Missing development environment');
  }

  return environment;
}

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const authResp = useAuth();
  const currentOrganization = authResp.currentOrganization;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { environmentSlug: paramsEnvironmentSlug } = useParams<{ environmentSlug?: string }>();
  const [currentEnvironment, setCurrentEnvironment] = useState<IEnvironment>();

  const switchEnvironmentInternal = useCallback(
    (allEnvironments: IEnvironment[], environmentSlug?: string | null) => {
      const selectedEnvironment = selectEnvironment(allEnvironments, environmentSlug, currentOrganization?._id);
      setCurrentEnvironment(selectedEnvironment);
      const newEnvironmentSlug = selectedEnvironment.slug;
      const isNewEnvironmentDifferent = paramsEnvironmentSlug !== selectedEnvironment.slug;

      if (currentOrganization?._id && newEnvironmentSlug) {
        saveToStorage(
          `${LAST_SELECTED_ENVIRONMENT_STORAGE_KEY}-${currentOrganization._id}`,
          newEnvironmentSlug,
          'environmentSlug'
        );
      }

      if (pathname === ROUTES.ROOT || pathname === ROUTES.ENV || pathname === `${ROUTES.ENV}/`) {
        navigate(buildRoute(ROUTES.WORKFLOWS, { environmentSlug: newEnvironmentSlug ?? '' }));
      } else if (pathname.includes(ROUTES.ENV) && isNewEnvironmentDifferent) {
        const newPath = pathname.replace(/\/env\/[^/]+(\/|$)/, `${ROUTES.ENV}/${newEnvironmentSlug}$1`);
        navigate(newPath);
      }
    },
    [navigate, pathname, paramsEnvironmentSlug, currentOrganization?._id]
  );

  const { environments: fetchedEnvironments, areEnvironmentsInitialLoading } = useFetchEnvironments({
    organizationId: currentOrganization?._id,
    showError: false,
  });

  // Fall back to mock environments when the API doesn't return data
  const environments = fetchedEnvironments ?? MOCK_ENVIRONMENTS;

  useLayoutEffect(() => {
    const environmentId = paramsEnvironmentSlug;
    switchEnvironmentInternal(environments, environmentId);
  }, [paramsEnvironmentSlug, environments, switchEnvironmentInternal]);

  const switchEnvironment = useCallback(
    (newEnvironmentSlug?: string) => {
      switchEnvironmentInternal(environments, newEnvironmentSlug);
    },
    [switchEnvironmentInternal, environments]
  );

  const setBridgeUrl = useCallback(
    (url: string) => {
      if (!currentEnvironment) {
        return;
      }

      setCurrentEnvironment({ ...currentEnvironment, bridge: { url } });
    },
    [currentEnvironment]
  );

  const oppositeEnvironment = useMemo((): IEnvironment | null => {
    if (!currentEnvironment) {
      return null;
    }

    const oppositeEnvironmentName =
      currentEnvironment.name === PRODUCTION_ENVIRONMENT ? DEVELOPMENT_ENVIRONMENT : PRODUCTION_ENVIRONMENT;

    return environments.find((env) => env.name === oppositeEnvironmentName) || null;
  }, [currentEnvironment, environments]);

  const value = useMemo(
    () => ({
      currentEnvironment,
      environments,
      areEnvironmentsInitialLoading,
      readOnly: currentEnvironment?._parentId !== undefined,
      oppositeEnvironment,
      switchEnvironment,
      setBridgeUrl,
    }),
    [
      currentEnvironment,
      environments,
      areEnvironmentsInitialLoading,
      oppositeEnvironment,
      switchEnvironment,
      setBridgeUrl,
    ]
  );

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}
