import { IEnvironment } from '@novu/shared';

import { Button } from '@merge-rd/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@merge-rd/ui/components/dialog';
import { Warning, X } from '@phosphor-icons/react';

interface DeleteEnvironmentDialogProps {
  environment?: IEnvironment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteEnvironmentDialog = ({
  environment,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteEnvironmentDialogProps) => {
  if (!environment) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete Environment</DialogTitle>
          <DialogDescription>
            Deleting <span className="font-bold">{environment.name}</span> will permanently remove this environment and
            all the data associated with it. Including integrations, workflows, and notifications. This action cannot be
            undone. Are you sure you want to proceed?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" mode="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="error" mode="gradient" onClick={onConfirm} isLoading={isLoading}>
            Delete {environment.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
