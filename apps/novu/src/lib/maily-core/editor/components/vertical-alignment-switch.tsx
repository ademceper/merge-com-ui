import {
	AlignBottom,
	AlignCenterVertical,
	AlignTop,
} from "@phosphor-icons/react";
import type { AllowedColumnVerticalAlign } from "../nodes/columns/column";
import { BubbleMenuButton } from "./bubble-menu-button";

type VerticalAlignmentSwitchProps = {
	alignment: AllowedColumnVerticalAlign;
	onAlignmentChange: (alignment: AllowedColumnVerticalAlign) => void;
};

export function VerticalAlignmentSwitch(props: VerticalAlignmentSwitchProps) {
	const { alignment = "top", onAlignmentChange } = props;

	const activeAlignment = {
		top: {
			icon: AlignTop,
			tooltip: "Align Top",
			onClick: () => {
				onAlignmentChange("middle");
			},
		},
		middle: {
			icon: AlignCenterVertical,
			tooltip: "Align Center",
			onClick: () => {
				onAlignmentChange("bottom");
			},
		},
		bottom: {
			icon: AlignBottom,
			tooltip: "Align Bottom",
			onClick: () => {
				onAlignmentChange("top");
			},
		},
	}[alignment];

	return (
		<BubbleMenuButton
			icon={activeAlignment.icon}
			tooltip={activeAlignment.tooltip}
			command={activeAlignment.onClick}
		/>
	);
}
