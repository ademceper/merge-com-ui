import { useMemo } from "react";
import type { RQBJsonLogic } from "react-querybuilder";

import { countConditions } from "@/shared/lib/conditions";

export const useConditionsCount = (jsonLogic?: RQBJsonLogic) => {
	return useMemo(() => countConditions(jsonLogic), [jsonLogic]);
};
