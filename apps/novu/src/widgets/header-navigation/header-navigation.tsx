import { Button } from "@merge-rd/ui/components/button";
import { Kbd } from "@merge-rd/ui/components/kbd";
import { SidebarPageHeader } from "@merge-rd/ui/components/sidebar";
import { EnvironmentTypeEnum, PermissionsEnum } from "@/shared";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { HTMLAttributes, ReactNode } from "react";
import { useCommandPalette } from "@/widgets/command-palette/hooks/use-command-palette";
import { InboxButton } from "@/widgets/inbox-button";
import { UserProfile } from "@/widgets/user-profile";
import { RegionSelector } from "@/app/context/region";
import { IS_ENTERPRISE, IS_SELF_HOSTED } from "@/shared/config";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import { CustomerSupportButton } from "./customer-support-button";
import { EditBridgeUrlButton } from "./edit-bridge-url-button";
import { PublishButton } from "./publish-button";

type HeaderNavigationProps = HTMLAttributes<HTMLDivElement> & {
	startItems?: ReactNode;
	hideBridgeUrl?: boolean;
};

export const HeaderNavigation = (props: HeaderNavigationProps) => {
	const { startItems, hideBridgeUrl = false, className, ...rest } = props;
	const { currentEnvironment } = useEnvironment();
	const has = useHasPermission();
	const canPublish = has({ permission: PermissionsEnum.ENVIRONMENT_WRITE });
	const { openCommandPalette } = useCommandPalette();

	return (
		<SidebarPageHeader className={className} {...rest}>
			{startItems && <span className="hidden md:contents">{startItems}</span>}
			<div className="flex-1 min-w-0" />
			<button
				type="button"
				className="inline-flex h-7 items-center rounded-md bg-neutral-100 px-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-colors mr-2"
				onClick={() => {
					const wrapper = document.querySelector("[data-scale-wrapper]");
					if (wrapper) {
						const isScaled = wrapper.getAttribute("data-scaled") === "true";
						wrapper.setAttribute("data-scaled", isScaled ? "false" : "true");
					}
				}}
			>
				Scale
			</button>
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-6.5 w-auto gap-1 px-1.5"
					onClick={openCommandPalette}
				>
					<MagnifyingGlass className="size-3.5" />
					<Kbd className="text-[10px]">⌘K</Kbd>
				</Button>
				{currentEnvironment?.type === EnvironmentTypeEnum.DEV && canPublish && (
					<PublishButton />
				)}
				{!hideBridgeUrl ? <EditBridgeUrlButton /> : null}
				{!(IS_SELF_HOSTED && IS_ENTERPRISE) && <CustomerSupportButton />}
				<div className="flex items-center gap-2">
					<InboxButton />
					<div className="h-4 w-px bg-border" />
					<RegionSelector />
				</div>
				<UserProfile />
			</div>
		</SidebarPageHeader>
	);
};
