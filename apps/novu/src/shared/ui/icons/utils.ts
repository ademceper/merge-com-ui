import {
	ChatText,
	Circle,
	CodeBlock,
	DeviceMobile,
	Gauge,
	HourglassSimple,
	Lightning,
} from "@phosphor-icons/react";
import type { IconType } from "react-icons/lib";
import { StepTypeEnum } from "@/utils/enums";
import { Mail3Fill } from "./mail-3-fill";
import { Notification5Fill } from "./notification-5-fill";
import { Sms } from "./sms";

export const STEP_TYPE_TO_ICON: Record<StepTypeEnum, IconType> = {
	[StepTypeEnum.CHAT]: ChatText,
	[StepTypeEnum.CUSTOM]: CodeBlock,
	[StepTypeEnum.DELAY]: HourglassSimple,
	[StepTypeEnum.DIGEST]: Circle,
	[StepTypeEnum.EMAIL]: Mail3Fill as IconType,
	[StepTypeEnum.IN_APP]: Notification5Fill as IconType,
	[StepTypeEnum.PUSH]: DeviceMobile,
	[StepTypeEnum.SMS]: Sms as IconType,
	[StepTypeEnum.THROTTLE]: Gauge,
	[StepTypeEnum.TRIGGER]: Lightning,
};
