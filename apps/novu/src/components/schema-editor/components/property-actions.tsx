import { useState } from 'react';

import { Button } from '@merge-rd/ui/components/button';
import { Popover, PopoverTrigger } from '@/components/primitives/popover';
import { cn } from '@merge-rd/ui/lib/utils';
import { SchemaPropertySettingsPopover } from '../schema-property-settings-popover';
import type { VariableUsageInfo } from '../utils/check-variable-usage';
import { Gear, Trash } from '@phosphor-icons/react';

type PropertyActionsProps = {
  definitionPath: string;
  propertyKeyForDisplay: string;
  isRequiredPath: string;
  isNullablePath: string;
  onDeleteProperty: () => void;
  isDisabled?: boolean;
  variableUsageInfo?: VariableUsageInfo;
};

export function PropertyActions({
  definitionPath,
  propertyKeyForDisplay,
  isRequiredPath,
  isNullablePath,
  onDeleteProperty,
  isDisabled = false,
  variableUsageInfo,
}: PropertyActionsProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            mode="ghost"
            size="2xs"
            className={cn('border ml-0! h-7 w-7 border-neutral-200')}
            leadingIcon={Gear}
            disabled={isDisabled || !propertyKeyForDisplay || propertyKeyForDisplay.trim() === ''}
            aria-label="Property settings"
          />
        </PopoverTrigger>
        <SchemaPropertySettingsPopover
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          definitionPath={definitionPath}
          propertyKeyForDisplay={propertyKeyForDisplay}
          isRequiredPath={isRequiredPath}
          isNullablePath={isNullablePath}
          onDeleteProperty={onDeleteProperty}
          variableUsageInfo={variableUsageInfo}
        />
      </Popover>
      <Button
        variant="error"
        mode="ghost"
        size="2xs"
        leadingIcon={Trash}
        onClick={isDisabled ? undefined : onDeleteProperty}
        aria-label="Delete property"
        className={cn('border ml-0! h-7 w-7 border-neutral-200')}
        disabled={isDisabled}
      />
    </>
  );
}
