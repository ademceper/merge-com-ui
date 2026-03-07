import { StepTypeEnum } from "@novu/shared";
import {
	Bell,
	BracketsCurly,
	ChatCircle,
	Clock,
	Code,
	DeviceMobile,
	Envelope,
	Gauge,
	PlayCircle,
} from "@phosphor-icons/react";
import type { IconType } from "react-icons";
import { InboxBell } from "@/components/icons";

export const STEP_TYPE_ICONS: Record<StepTypeEnum, IconType> = {
	[StepTypeEnum.EMAIL]: Envelope,
	[StepTypeEnum.SMS]: DeviceMobile,
	[StepTypeEnum.PUSH]: Bell,
	[StepTypeEnum.IN_APP]: InboxBell as IconType,
	[StepTypeEnum.CHAT]: ChatCircle,
	[StepTypeEnum.DIGEST]: Clock,
	[StepTypeEnum.DELAY]: Clock,
	[StepTypeEnum.THROTTLE]: Gauge,
	[StepTypeEnum.CUSTOM]: BracketsCurly,
	[StepTypeEnum.TRIGGER]: PlayCircle,
} as const;

export const DEFAULT_STEP_ICON = Code;

export const ACCORDION_STYLES = {
	item: "border-b border-b-neutral-200 bg-transparent border-t-0 border-l-0 border-r-0 rounded-none p-3",
	itemLast:
		"border-b border-b-neutral-200 bg-transparent border-t-0 border-l-0 border-r-0 rounded-none p-3 border-b-0",
	trigger: "text-label-xs",
	jsonViewer:
		"border-neutral-alpha-200 bg-background text-foreground-600 rounded-lg border border-solid",
} as const;

export const DEFAULT_ACCORDION_VALUES = [
	"payload",
	"subscriber",
	"step-results",
	"context",
];
