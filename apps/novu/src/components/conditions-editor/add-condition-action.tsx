
import { ActionWithRulesAndAddersProps } from 'react-querybuilder';

import { Button } from '@merge-rd/ui/components/button';
import { Plus } from '@phosphor-icons/react';

export const AddConditionAction = ({ label, title, rules, handleOnClick, context }: ActionWithRulesAndAddersProps) => {
  if (rules && rules.length >= 10) {
    return null;
  }

  return (
    <Button
      mode="outline"
      variant="secondary"
      size="2xs"
      className="bg-transparent"
      onClick={(e) => {
        handleOnClick(e);
        context?.saveForm();
      }}
      leadingIcon={Plus}
      title={title}
    >
      {label}
    </Button>
  );
};
