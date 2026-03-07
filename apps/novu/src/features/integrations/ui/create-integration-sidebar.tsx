import { Button } from "@merge-rd/ui/components/button";
import { providers as novuProviders } from "@/shared";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showSuccessToast } from "@/shared/ui/primitives/sonner-helpers";
import { UnsavedChangesAlertDialog } from "@/shared/ui/unsaved-changes-alert-dialog";
import { useCreateIntegration } from "@/features/integrations/lib/use-create-integration";
import { useFetchIntegrations } from "@/features/integrations/lib/use-fetch-integrations";
import { useIntegrationList } from "@/features/integrations/lib/use-integration-list";
import { useIntegrationPrimaryModal } from "@/features/integrations/lib/use-integration-primary-modal";
import { useSetPrimaryIntegration } from "@/features/integrations/lib/use-set-primary-integration";
import { useSidebarNavigationManager } from "@/features/integrations/lib/use-sidebar-navigation-manager";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { ChannelTabs } from "./channel-tabs";
import { IntegrationSettings } from "./integration-settings";
import { IntegrationSheet } from "./integration-sheet";
import { SelectPrimaryIntegrationModal } from "./modals/select-primary-integration-modal";
import type { IntegrationFormData } from "./types";
import { handleIntegrationError } from "./utils/handle-integration-error";

export type CreateIntegrationSidebarProps = {
	isOpened: boolean;
};

export function CreateIntegrationSidebar({
	isOpened,
}: CreateIntegrationSidebarProps) {
	const navigate = useNavigate();
	const { providerId } = useParams();

	const providers = novuProviders;
	const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
	const { mutateAsync: setPrimaryIntegration, isPending: isSettingPrimary } =
		useSetPrimaryIntegration();
	const { integrations } = useFetchIntegrations();
	const [formState, setFormState] = useState({
		isValid: true,
		errors: {} as Record<string, unknown>,
		isDirty: false,
	});
	const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(isOpened);

	const handleIntegrationSelect = (integrationId: string) => {
		navigate(
			buildRoute(ROUTES.INTEGRATIONS_CONNECT_PROVIDER, {
				providerId: integrationId,
			}),
			{ replace: true },
		);
	};

	const handleBack = () => {
		navigate(ROUTES.INTEGRATIONS_CONNECT, { replace: true });
	};

	const {
		selectedIntegration,
		step,
		searchQuery,
		onIntegrationSelect,
		onBack,
	} = useSidebarNavigationManager({
		isOpened,
		initialProviderId: providerId,
		onIntegrationSelect: handleIntegrationSelect,
		onBack: handleBack,
	});

	const { integrationsByChannel } = useIntegrationList(searchQuery);
	const provider = providers?.find(
		(providerItem) => providerItem.id === (selectedIntegration || providerId),
	);
	const {
		isPrimaryModalOpen,
		setIsPrimaryModalOpen,
		pendingData,
		handleSubmitWithPrimaryCheck,
		handlePrimaryConfirm,
		existingPrimaryIntegration,
		isChannelSupportPrimary,
	} = useIntegrationPrimaryModal({
		onSubmit: handleCreateIntegration,
		integrations,
		channel: provider?.channel,
		mode: "create",
	});

	async function handleCreateIntegration(data: IntegrationFormData) {
		if (!provider) return;

		try {
			const integration = await createIntegration({
				providerId: provider.id,
				channel: provider.channel,
				credentials: data.credentials,
				configurations: data.configurations,
				name: data.name,
				identifier: data.identifier,
				active: data.active,
				_environmentId: data.environmentId,
			});

			if (data.primary && isChannelSupportPrimary && data.active) {
				await setPrimaryIntegration({ integrationId: integration.data._id });
			}

			showSuccessToast("Integration created successfully");

			setIsSheetOpen(false);
			navigate(ROUTES.INTEGRATIONS);
		} catch (error: unknown) {
			handleIntegrationError(error, "create");
		}
	}

	// Sync sheet open state with isOpened prop
	useEffect(() => {
		setIsSheetOpen(isOpened);
	}, [isOpened]);

	const handleClose = () => {
		// Only check for unsaved changes if we're on the configure step (form is visible)
		if (
			step === "configure" &&
			formState.isDirty &&
			!isPending &&
			!isSettingPrimary
		) {
			setShowUnsavedDialog(true);

			return;
		}

		setIsSheetOpen(false);
		navigate(ROUTES.INTEGRATIONS);
	};

	const handleProceedClose = () => {
		setShowUnsavedDialog(false);
		setIsSheetOpen(false);
		navigate(ROUTES.INTEGRATIONS);
	};

	const handleCancelClose = () => {
		setShowUnsavedDialog(false);
	};

	return (
		<>
			<IntegrationSheet
				isOpened={isSheetOpen}
				onClose={handleClose}
				provider={provider}
				mode="create"
				step={step}
				onBack={onBack}
			>
				{step === "select" ? (
					<div className="scrollbar-custom flex-1 overflow-y-auto">
						<ChannelTabs
							integrationsByChannel={integrationsByChannel}
							searchQuery={searchQuery}
							onIntegrationSelect={onIntegrationSelect}
						/>
					</div>
				) : provider ? (
					<>
						<div className="scrollbar-custom flex-1 overflow-y-auto">
							<IntegrationSettings
								isChannelSupportPrimary={isChannelSupportPrimary}
								provider={provider}
								onSubmit={handleSubmitWithPrimaryCheck}
								mode="create"
								onFormStateChange={setFormState}
							/>
						</div>
						<div className="bg-background flex justify-end gap-2 border-t p-3">
							<Button
								type="submit"
								variant="secondary"
								form={`integration-configuration-form-${provider.id}`}
								isLoading={isPending || isSettingPrimary}
								size="xs"
								disabled={!formState.isValid}
							>
								Create Integration
							</Button>
						</div>
					</>
				) : null}
			</IntegrationSheet>

			<SelectPrimaryIntegrationModal
				isOpen={isPrimaryModalOpen}
				onOpenChange={setIsPrimaryModalOpen}
				onConfirm={handlePrimaryConfirm}
				currentPrimaryName={existingPrimaryIntegration?.name}
				newPrimaryName={pendingData?.name ?? ""}
				isLoading={isPending || isSettingPrimary}
			/>

			<UnsavedChangesAlertDialog
				show={showUnsavedDialog}
				onCancel={handleCancelClose}
				onProceed={handleProceedClose}
			/>
		</>
	);
}
