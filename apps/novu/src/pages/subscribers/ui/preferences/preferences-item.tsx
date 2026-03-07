import { Switch } from "@merge-rd/ui/components/switch";
import { ChannelTypeEnum } from "@/shared";
import { STEP_TYPE_TO_ICON } from "@/shared/ui/icons/utils";
import { Step } from "@/shared/ui/primitives/step";
import { STEP_TYPE_TO_COLOR } from "@/shared/lib/color";
import { capitalize } from "@/shared/lib/string";

const CHANNEL_LABELS_LOOKUP: Record<`${ChannelTypeEnum}`, string> = {
	[ChannelTypeEnum.IN_APP]: "In-App",
	[ChannelTypeEnum.EMAIL]: "Email",
	[ChannelTypeEnum.SMS]: "SMS",
	[ChannelTypeEnum.CHAT]: "Chat",
	[ChannelTypeEnum.PUSH]: "Push",
};

type PreferencesItemProps = {
	channel: ChannelTypeEnum;
	enabled: boolean;
	onChange: (checked: boolean) => void;
	readOnly?: boolean;
};

export function PreferencesItem(props: PreferencesItemProps) {
	const { channel, enabled, onChange, readOnly = false } = props;
	const Icon = STEP_TYPE_TO_ICON[channel];

	return (
		<div>
			<div className="flex w-full items-center justify-between space-y-1">
				<div className="flex items-center gap-2">
					<Step variant={STEP_TYPE_TO_COLOR[channel]} className="size-5">
						<Icon />
					</Step>
					<span className="text-foreground-950 text-xs font-medium">
						{capitalize(CHANNEL_LABELS_LOOKUP[channel])}
					</span>
				</div>
				<Switch
					checked={enabled}
					onCheckedChange={readOnly ? undefined : onChange}
				/>
			</div>
		</div>
	);
}
