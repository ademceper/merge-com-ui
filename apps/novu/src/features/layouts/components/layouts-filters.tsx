import { HTMLAttributes, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { defaultLayoutsFilter, LayoutsFilter } from '@/components/layouts/hooks/use-layouts-url-state';
import { Button } from '@merge-rd/ui/components/button';
import { FacetedFormFilter } from '@merge-rd/ui/components/faceted-filter/faceted-form-filter';
import { Form, FormField, FormItem, FormRoot } from '@/components/primitives/form/form';
import { cn } from '@merge-rd/ui/lib/utils';
import { SpinnerGap } from '@phosphor-icons/react';

export type LayoutsFiltersProps = HTMLAttributes<HTMLFormElement> & {
  onFiltersChange: (filter: LayoutsFilter) => void;
  filterValues: LayoutsFilter;
  onReset?: () => void;
  isFetching?: boolean;
};

export function LayoutsFilters(props: LayoutsFiltersProps) {
  const { onFiltersChange, filterValues, onReset, className, isFetching, ...rest } = props;

  const form = useForm<LayoutsFilter>({
    values: filterValues,
    defaultValues: {
      ...filterValues,
    },
  });
  const { formState, watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      onFiltersChange(value as LayoutsFilter);
    });

    return () => subscription.unsubscribe();
  }, [watch, onFiltersChange]);

  const handleReset = () => {
    form.reset(defaultLayoutsFilter);
    onFiltersChange(defaultLayoutsFilter);
    onReset?.();
  };

  const isResetButtonVisible = formState.isDirty || filterValues.query !== '';

  return (
    <Form {...form}>
      <FormRoot className={cn('flex items-center gap-2', className)} {...rest}>
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Search"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search layouts..."
              />
            </FormItem>
          )}
        />

        {isResetButtonVisible && (
          <div className="flex items-center gap-1">
            <Button variant="secondary" mode="ghost" size="2xs" onClick={handleReset}>
              Reset
            </Button>
            {isFetching && <SpinnerGap className="h-3 w-3 animate-spin text-neutral-400" />}
          </div>
        )}
      </FormRoot>
    </Form>
  );
}
