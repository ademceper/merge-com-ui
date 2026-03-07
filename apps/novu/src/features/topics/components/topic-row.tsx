import { PermissionsEnum } from '@novu/shared';
import { useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';

import { Link } from 'react-router-dom';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { CompactButton } from '@/components/primitives/button-compact';
import { CopyButton } from '@/components/primitives/copy-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@merge-rd/ui/components/dropdown-menu';
import { Skeleton } from '@merge-rd/ui/components/skeleton';
import { TableCell, TableRow } from '@merge-rd/ui/components/table';
import { TimeDisplayHoverCard } from '@/components/time-display-hover-card';
import { formatDateSimple } from '@/utils/format-date';
import { Protect } from '@/utils/protect';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '../../context/environment/hooks';
import { buildRoute, ROUTES } from '../../utils/routes';
import { cn } from '@merge-rd/ui/lib/utils';
import { showErrorToast } from '../primitives/sonner-helpers';
import { useDeleteTopic } from './hooks/use-delete-topic';
import { useTopicsNavigate } from './hooks/use-topics-navigate';
import { Topic } from './types';
import {
  Copy,
  DotsThree,
  Pulse,
  Trash,
} from '@phosphor-icons/react';

type TopicRowProps = {
  topic: Topic;
};

type TopicTableCellProps = ComponentProps<typeof TableCell>;

const TopicTableCell = (props: TopicTableCellProps) => {
  const { children, className, ...rest } = props;

  return (
    <TableCell className={cn('group-hover:bg-neutral-alpha-50 text-text-sub relative', className)} {...rest}>
      {children}
      <span className="sr-only">Edit topic</span>
    </TableCell>
  );
};

export const TopicRow = ({ topic }: TopicRowProps) => {
  const { currentEnvironment } = useEnvironment();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteTopic, isDeleting } = useDeleteTopic();
  const queryClient = useQueryClient();
  const { navigateToEditTopicPage } = useTopicsNavigate();

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeletion = async () => {
    try {
      await deleteTopic(topic.key);

      setIsDeleteModalOpen(false);

      queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchTopics],
        exact: false,
        refetchType: 'all',
      });
    } catch (error) {
      // Error is already handled by the useDeleteTopic hook
      showErrorToast('Failed to delete topic');
    }
  };

  return (
    <>
      <TableRow
        className="group relative isolate cursor-pointer"
        onClick={() => {
          navigateToEditTopicPage(topic.key);
        }}
      >
        <TopicTableCell>
          <div className="flex items-center">
            <span className="max-w-[300px] truncate font-medium">{topic.name}</span>
          </div>
        </TopicTableCell>
        <TopicTableCell>
          <div className="flex items-center gap-1">
            <div className="font-code text-text-soft max-w-[300px] truncate">{topic.key}</div>
            <CopyButton
              className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
              valueToCopy={topic.key}
              size="2xs"
            />
          </div>
        </TopicTableCell>
        <TopicTableCell>
          {topic.createdAt && (
            <TimeDisplayHoverCard date={topic.createdAt}>{formatDateSimple(topic.createdAt)}</TimeDisplayHoverCard>
          )}
        </TopicTableCell>
        <TopicTableCell>
          {topic.updatedAt && (
            <TimeDisplayHoverCard date={topic.updatedAt}>{formatDateSimple(topic.updatedAt)}</TimeDisplayHoverCard>
          )}
        </TopicTableCell>
        <TopicTableCell className="w-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CompactButton icon={DotsThree} variant="ghost" className="z-10 h-8 w-8 p-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" onClick={stopPropagation}>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(topic.key);
                  }}
                >
                  <Copy />
                  Copy identifier
                </DropdownMenuItem>
                <Protect permission={PermissionsEnum.NOTIFICATION_READ}>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      to={
                        buildRoute(ROUTES.ACTIVITY_FEED, {
                          environmentSlug: currentEnvironment?.slug ?? '',
                        }) +
                        '?' +
                        new URLSearchParams({ topicKey: topic.key }).toString()
                      }
                    >
                      <Pulse weight="fill" />
                      View activity
                    </Link>
                  </DropdownMenuItem>
                </Protect>
                <Protect permission={PermissionsEnum.TOPIC_WRITE}>
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => {
                      setTimeout(() => setIsDeleteModalOpen(true), 0);
                    }}
                  >
                    <Trash />
                    Delete topic
                  </DropdownMenuItem>
                </Protect>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </TopicTableCell>
      </TableRow>
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeletion}
        title={`Delete topic`}
        description={
          <span>
            Are you sure you want to delete topic <span className="font-bold">{topic.name}</span>? This action cannot be
            undone.
          </span>
        }
        confirmButtonText="Delete topic"
        isLoading={isDeleting}
      />
    </>
  );
};

export const TopicRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-6 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-32" />
      </TableCell>
      <TableCell className="w-1">
        <DotsThree weight="fill" className="size-4 opacity-50" />
      </TableCell>
    </TableRow>
  );
};
