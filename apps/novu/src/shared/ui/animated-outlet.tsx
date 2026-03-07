import { AnimatePresence } from "motion/react";
import React, { useRef } from "react";
import { Outlet, useLocation } from "@tanstack/react-router";

export const AnimatedOutlet = (): React.JSX.Element => {
	const { pathname } = useLocation();
	const keyRef = useRef(pathname);

	keyRef.current = pathname;

	return (
		<AnimatePresence mode="wait" initial>
			<React.Fragment key={keyRef.current}>
				<Outlet />
			</React.Fragment>
		</AnimatePresence>
	);
};
