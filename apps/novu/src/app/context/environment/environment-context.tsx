import type { IEnvironment } from "@/shared";
import React from "react";

type EnvironmentContextValue = {
	currentEnvironment?: IEnvironment;
	environments?: IEnvironment[];
	areEnvironmentsInitialLoading: boolean;
	readOnly: boolean;
	switchEnvironment: (newEnvironmentSlug?: string) => void;
	setBridgeUrl: (url: string) => void;
	oppositeEnvironment: IEnvironment | null;
};

export const EnvironmentContext = React.createContext<EnvironmentContextValue>(
	{} as EnvironmentContextValue,
);
EnvironmentContext.displayName = "EnvironmentContext";
