import type { ComponentType, ReactNode } from "react";

/** A component that accepts children (required or optional). */
type Provider = ComponentType<{ children?: ReactNode }> | ComponentType<{ children: ReactNode }>;

/**
 * Composes multiple context providers into a single wrapper component,
 * eliminating deep nesting in the component tree.
 *
 * @example
 * const AppProviders = composeProviders(
 *   ThemeProvider,
 *   AuthProvider,
 *   DataProvider,
 * );
 *
 * // Instead of:
 * <ThemeProvider><AuthProvider><DataProvider>{children}</DataProvider></AuthProvider></ThemeProvider>
 *
 * // Use:
 * <AppProviders>{children}</AppProviders>
 */
export function composeProviders(...providers: Provider[]): ComponentType<{ children: ReactNode }> {
    return providers.reduce<ComponentType<{ children: ReactNode }>>(
        (Accumulated, Current) => {
            const Wrapper = Current as ComponentType<{ children?: ReactNode }>;
            return function ComposedProvider({ children }: { children: ReactNode }) {
                return (
                    <Accumulated>
                        <Wrapper>{children}</Wrapper>
                    </Accumulated>
                );
            };
        },
        ({ children }: { children: ReactNode }) => <>{children}</>
    );
}
