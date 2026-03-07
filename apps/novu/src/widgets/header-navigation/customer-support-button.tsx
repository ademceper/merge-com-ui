import { FeatureFlagsKeysEnum } from "@/shared";
import { Question } from "@phosphor-icons/react";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { usePlainChat } from "@/shared/lib/hooks/use-plain-chat";
import { IS_SELF_HOSTED } from "@/shared/config";
import { openInNewTab } from "@/shared/lib/url";
import { HeaderButton } from "./header-button";
import { SupportDrawer } from "./support-drawer";

export const CustomerSupportButton = () => {
	const { showPlainLiveChat } = usePlainChat();
	const isContextualHelpEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_CONTEXTUAL_HELP_DRAWER_ENABLED,
	);

	if (IS_SELF_HOSTED) {
		return (
			<button
				tabIndex={-1}
				className="flex items-center justify-center"
				onClick={() =>
					openInNewTab(
						"https://go.novu.co/hosted-upgrade?utm_campaign=help-icon",
					)
				}
			>
				<HeaderButton label="Help">
					<Question weight="fill" className="text-foreground-600 size-4" />
				</HeaderButton>
			</button>
		);
	}

	return isContextualHelpEnabled ? (
		<SupportDrawer>
			<button tabIndex={-1} className="flex items-center justify-center">
				<HeaderButton label="Help">
					<Question weight="fill" className="text-foreground-600 size-4" />
				</HeaderButton>
			</button>
		</SupportDrawer>
	) : (
		<button
			tabIndex={-1}
			className="flex items-center justify-center"
			onClick={() => showPlainLiveChat()}
		>
			<HeaderButton label="Help">
				<Question weight="fill" className="text-foreground-600 size-4" />
			</HeaderButton>
		</button>
	);
};
