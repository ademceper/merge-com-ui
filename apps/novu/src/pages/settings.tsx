import {
  ApiServiceLevelEnum,
  FeatureFlagsKeysEnum,
  FeatureNameEnum,
  GetSubscriptionDto,
  getFeatureForTierAsBoolean,
  PermissionsEnum,
} from '@novu/shared';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@merge/ui/components/card';
import { InlineToast } from '@/components/primitives/inline-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@merge/ui/components/tabs';
import { OrganizationSettings } from '@/components/settings/organization-settings';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useHasPermission } from '@/hooks/use-has-permission';
import { ROUTES } from '@/utils/routes';
import { Plan } from '../components/billing/plan';
import { DashboardLayout } from '../components/dashboard-layout';
import { useFetchSubscription } from '../hooks/use-fetch-subscription';

const FADE_ANIMATION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const;

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription } = useFetchSubscription();
  const isRbacEnabledFlag = useFeatureFlag(FeatureFlagsKeysEnum.IS_RBAC_ENABLED, false);
  const isRbacEnabled = checkRbacEnabled(subscription, isRbacEnabledFlag);
  const has = useHasPermission();
  const hasBillingPermission = has({ permission: PermissionsEnum.BILLING_WRITE });

  function checkRbacEnabled(subscription: GetSubscriptionDto | undefined, featureFlag: boolean) {
    const apiServiceLevel = subscription?.apiServiceLevel || ApiServiceLevelEnum.FREE;
    const rbacFeatureEnabled = getFeatureForTierAsBoolean(
      FeatureNameEnum.ACCOUNT_ROLE_BASED_ACCESS_CONTROL_BOOLEAN,
      apiServiceLevel
    );

    return rbacFeatureEnabled && featureFlag;
  }

  const canShowBilling = hasBillingPermission;

  const currentTab =
    location.pathname === ROUTES.SETTINGS ? 'account' : location.pathname.split('/settings/')[1] || 'account';

  useEffect(() => {
    if (currentTab === 'billing' && !canShowBilling) {
      navigate(ROUTES.SETTINGS_ACCOUNT, { replace: true });
    }
  }, [currentTab, canShowBilling, navigate]);

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'account':
        navigate(ROUTES.SETTINGS_ACCOUNT);
        break;
      case 'organization':
        navigate(ROUTES.SETTINGS_ORGANIZATION);
        break;
      case 'team':
        navigate(ROUTES.SETTINGS_TEAM);
        break;
      case 'billing':
        if (canShowBilling) {
          navigate(ROUTES.SETTINGS_BILLING);
        }
        break;
    }
  };

  return (
    <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Settings</h1>}>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="-mx-2 w-full">
        <TabsList align="center" variant="regular" className="border-t-transparent py-0!">
          <TabsTrigger variant="regular" value="account" size="xl">
            Account
          </TabsTrigger>
          <TabsTrigger variant="regular" value="organization" size="xl">
            Organization
          </TabsTrigger>
          <TabsTrigger variant="regular" value="team" size="xl">
            Team
          </TabsTrigger>
          {canShowBilling && (
            <TabsTrigger variant="regular" value="billing" size="xl">
              Billing
            </TabsTrigger>
          )}
        </TabsList>

        <div
          className={`mx-auto mt-1 px-1.5 ${currentTab === 'billing' && canShowBilling ? 'max-w-[1400px]' : 'max-w-[700px]'}`}
        >
          <TabsContent value="account" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="border-none shadow-none">
                <div className="pb-6 pt-4 flex flex-col">
                  <p className="text-muted-foreground">Account settings</p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="organization" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="border-none shadow-none">
                <div className="pb-6 pt-4 flex flex-col">
                  {subscription?.apiServiceLevel === ApiServiceLevelEnum.FREE && canShowBilling && (
                    <InlineToast
                      title="Tip:"
                      description="Hide Novu branding from your notification channels by upgrading to a paid plan."
                      ctaLabel="Upgrade Plan"
                      onCtaClick={() =>
                        navigate(ROUTES.SETTINGS_BILLING + '?utm_source=organization_settings_upgrade_prompt')
                      }
                      className="mb-4"
                      variant="tip"
                    />
                  )}
                  <OrganizationSettings />
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="team" className="rounded-lg">
            <motion.div {...FADE_ANIMATION}>
              <Card className="border-none shadow-none">
                <div
                  className={`pb-6 pt-4 flex flex-col ${isRbacEnabled ? 'show-role-column' : 'hide-role-column'}`}
                >
                  {isRbacEnabledFlag && !isRbacEnabled && canShowBilling && (
                    <InlineToast
                      title="Tip:"
                      description="Get role-based access control and add unlimited members by upgrading."
                      ctaLabel="Upgrade to Team"
                      onCtaClick={() => navigate(ROUTES.SETTINGS_BILLING + '?utm_source=team_members_upgrade_prompt')}
                      className="mb-4"
                      variant="tip"
                    />
                  )}
                  <p className="text-muted-foreground">Team management</p>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {canShowBilling && (
            <TabsContent value="billing" className="rounded-lg">
              <motion.div {...FADE_ANIMATION}>
                <Card className="border-none shadow-none">
                  <div className="pb-6 pt-4 flex flex-col">
                    <Plan />
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </DashboardLayout>
  );
}
