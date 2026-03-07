import { Button } from "@merge-rd/ui/components/button";
import {
	ChannelTypeEnum,
	providers as novuProviders,
	PermissionsEnum,
} from "@/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { showSuccessToast } from "@/shared/ui/primitives/sonner-helpers";
import { UnsavedChangesAlertDialog } from "@/shared/ui/unsaved-changes-alert-dialog";
import { useDeleteIntegration } from "@/pages/integrations/api/use-delete-integration";
import { useFetchIntegrations } from "@/pages/integrations/api/use-fetch-integrations";
import { useIntegrationPrimaryModal } from "@/pages/integrations/lib/use-integration-primary-modal";
import { useSetPrimaryIntegration } from "@/pages/integrations/lib/use-set-primary-integration";
import { useUpdateIntegration } from "@/pages/integrations/api/use-update-integration";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import { ROUTES } from "@/shared/lib/routes";
import { IntegrationSettings } from "./integration-settings";
import { IntegrationSheet } from "./integration-sheet";
import { DeleteIntegrationModal } from "./modals/delete-integration-modal";
import { SelectPrimaryIntegrationModal } from "./modals/select-primary-integration-modal";
import type { IntegrationFormData } from "./types";
import { handleIntegrationError } from "./utils/handle-integration-error";
import { isDemoIntegration } from "./utils/helpers";

type UpdateIntegrationSidebarProps = {
	isOpened: boolean;
};

export function UpdateIntegrationSidebar({
	isOpened,
}: UpdateIntegrationSidebarProps) {
	const has = useHasPermission();
	const navigate = useNavigate();
	const { integrationId } = useParams({ strict: false });
	const { integrations } = useFetchIntegrations();
	const integration = integrations?.find((i) => i._id === integrationId);
	const provider = novuProviders?.find((p) => p.id === integration?.providerId);

	const { deleteIntegration, isLoading: isDeleting } = useDeleteIntegration();
	const { mutateAsync: updateIntegration, isPending: isUpdating } =
		useUpdateIntegration();
	const { mutateAsync: setPrimaryIntegration, isPending: isSettingPrimary } =
		useSetPrimaryIntegration();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [formState, setFormState] = useState({
		isValid: true,
		errors: {} as Record<string, unknown>,
		isDirty: false,
	});
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(isOpened);

	const {
		isPrimaryModalOpen,
		setIsPrimaryModalOpen,
		pendingData,
		setPendingData,
		handleSubmitWithPrimaryCheck,
		handlePrimaryConfirm,
		existingPrimaryIntegration,
		isChannelSupportPrimary,
		hasOtherProviders,
		hasSameChannelActiveIntegration,
	} = useIntegrationPrimaryModal({
		onSubmit,
		integrations,
		integration,
		mode: "update",
		setPrimaryIntegration: setPrimaryIntegration,
	});

	const isReadOnly = !has({ permission: PermissionsEnum.INTEGRATION_WRITE });

	async function onSubmit(
		data: IntegrationFormData,
		skipPrimaryCheck?: boolean,
	) {
		if (!integration) return;

		/**
		 * We don't want to check the integration if it's a demo integration
		 * Since we don't have credentials for it
		 */
		if (
			integration?.providerId === "novu-email" ||
			integration?.providerId === "novu-sms"
		) {
			data.check = false;
		}

		// If the integration was primary and is being unmarked or deactivated
		if (
			!skipPrimaryCheck &&
			integration.primary &&
			((!data.primary && data.active) || !data.active)
		) {
			if (hasSameChannelActiveIntegration) {
				setIsPrimaryModalOpen(true);
				setPendingData(data);
				return;
			}
		}

		try {
			await updateIntegration({
				integrationId: integration._id,
				data: {
					name: data.name,
					identifier: data.identifier,
					active: data.active,
					primary: data.primary,
					credentials: data.credentials,
					check: data.check,
					configurations: data.configurations,
				},
			});

			if (data.primary && data.active && isChannelSupportPrimary) {
				await setPrimaryIntegration({ integrationId: integration._id });
			}

			showSuccessToast("Integration updated successfully");

			setIsSheetOpen(false);
			navigate({ to: ROUTES.INTEGRATIONS });
		} catch (error: unknown) {
			handleIntegrationError(error, "update");
		}
	}

	const onDelete = async (newPrimaryIntegrationId?: string) => {
		if (!integration) return;

		try {
			if (newPrimaryIntegrationId) {
				await setPrimaryIntegration({ integrationId: newPrimaryIntegrationId });
			}

			await deleteIntegration({ id: integration._id });

			showSuccessToast("Integration deleted successfully");
			setIsDeleteDialogOpen(false);
			setIsSheetOpen(false);
			navigate({ to: ROUTES.INTEGRATIONS });
		} catch (error: unknown) {
			handleIntegrationError(error, "delete");
		}
	};

	// Sync sheet open state with isOpened prop
	useEffect(() => {
		setIsSheetOpen(isOpened);
	}, [isOpened]);

	const handleClose = () => {
		if (formState.isDirty && !isUpdating && !isSettingPrimary && !isDeleting) {
			setShowUnsavedDialog(true);

			return;
		}

		setIsSheetOpen(false);
		navigate({ to: ROUTES.INTEGRATIONS });
	};

	const handleProceedClose = () => {
		setShowUnsavedDialog(false);
		setIsSheetOpen(false);
		navigate({ to: ROUTES.INTEGRATIONS });
	};

	const handleCancelClose = () => {
		setShowUnsavedDialog(false);
	};

	if (!integration || !provider) return null;

	const isIntegrationDeletionAllowed =
		!isDemoIntegration(integration?.providerId) &&
		integration?.channel !== ChannelTypeEnum.IN_APP &&
		!isReadOnly;

	return (
		<>
			<IntegrationSheet
				isOpened={isSheetOpen}
				onClose={handleClose}
				provider={provider}
				mode="update"
			>
				<div className="scrollbar-custom flex-1 overflow-y-auto">
					<IntegrationSettings
						isChannelSupportPrimary={isChannelSupportPrimary}
						provider={provider}
						integration={integration}
						onSubmit={handleSubmitWithPrimaryCheck}
						mode="update"
						hasOtherProviders={!!hasOtherProviders}
						isReadOnly={isReadOnly}
						onFormStateChange={setFormState}
					/>
				</div>

				<div className="bg-background flex justify-between gap-2 border-t p-3">
					{isIntegrationDeletionAllowed && (
						<Button
							variant="error"
							mode="ghost"
							isLoading={isDeleting}
							disabled={isReadOnly}
							onClick={() => setIsDeleteDialogOpen(true)}
						>
							Delete Integration
						</Button>
					)}

					{!isReadOnly && (
						<Button
							type="submit"
							form={`integration-configuration-form-${provider.id}`}
							className="ml-auto"
							isLoading={isUpdating || isSettingPrimary}
							disabled={isReadOnly || !formState.isValid}
						>
							Save Changes
						</Button>
					)}
				</div>
			</IntegrationSheet>

			<DeleteIntegrationModal
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				onConfirm={onDelete}
				isPrimary={integration.primary}
				otherIntegrations={integrations?.filter(
					(i) =>
						i._id !== integration?._id &&
						i.channel === integration?.channel &&
						i.active &&
						i._environmentId === integration?._environmentId,
				)}
			/>

			<SelectPrimaryIntegrationModal
				isOpen={isPrimaryModalOpen}
				onOpenChange={setIsPrimaryModalOpen}
				onConfirm={handlePrimaryConfirm}
				currentPrimaryName={existingPrimaryIntegration?.name}
				newPrimaryName={pendingData?.name ?? ""}
				isLoading={isUpdating || isSettingPrimary}
				otherIntegrations={integrations?.filter(
					(i) =>
						i._id !== integration?._id &&
						i.channel === integration?.channel &&
						i.active &&
						i._environmentId === integration?._environmentId,
				)}
				mode={integration?.primary ? "select" : "switch"}
			/>

			<UnsavedChangesAlertDialog
				show={showUnsavedDialog}
				onCancel={handleCancelClose}
				onProceed={handleProceedClose}
			/>
		</>
	);
}
