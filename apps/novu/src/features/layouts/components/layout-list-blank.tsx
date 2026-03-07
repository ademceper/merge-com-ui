import { ApiServiceLevelEnum } from '@novu/shared';

import { Link } from 'react-router-dom';
import { useFetchSubscription } from '@/hooks/use-fetch-subscription';
import { ROUTES } from '@/utils/routes';
import { CreateLayoutButton } from './create-layout-btn';
import { EmptyLayoutsIllustration } from './empty-layouts-illustration';
import { Info, PlusCircle } from '@phosphor-icons/react';

export const LayoutListBlank = () => {
  const { subscription } = useFetchSubscription();
  const tier = subscription?.apiServiceLevel || ApiServiceLevelEnum.FREE;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <EmptyLayoutsIllustration />

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-text-sub text-label-md block font-medium">
          No layouts. Your emails deserve better than copy-paste
        </span>
        <p className="text-text-soft text-paragraph-sm max-w-[48ch]">
          Layouts let you reuse structure, stay consistent, and ship faster. Create once, plug anywhere — your emails
          (and teammates) will love you for it.{' '}
          <Link
            to="https://docs.novu.co/platform/workflow/layouts"
            className="underline"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Learn more about layouts"
          >
            Learn more ↗
          </Link>
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <CreateLayoutButton text="Create your first layout" icon={PlusCircle} />
        {tier === ApiServiceLevelEnum.FREE && (
          <p className="text-text-soft text-paragraph-xs mt-2 flex items-center gap-1">
            <Info />
            One layout is included in your plan,{' '}
            <Link relative={'route'} to={ROUTES.SETTINGS_BILLING} className="text-text-sub underline">
              upgrade now
            </Link>{' '}
            to create more.
          </p>
        )}
      </div>
    </div>
  );
};
