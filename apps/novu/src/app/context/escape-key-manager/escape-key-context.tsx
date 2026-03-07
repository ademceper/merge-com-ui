import { createContext } from "react";
import type { EscapeKeyManagerPriority } from "./priority";

type EscapeKeyManagerContextType = {
	registerEscapeHandler: (
		id: string,
		handler: () => void,
		priority?: EscapeKeyManagerPriority,
	) => void;
	unregisterEscapeHandler: (id: string) => void;
};

export const EscapeKeyManagerContext =
	createContext<EscapeKeyManagerContextType>({
		registerEscapeHandler: () => {},
		unregisterEscapeHandler: () => {},
	});
