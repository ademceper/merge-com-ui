import type { KcContext as KcContextBase } from "keycloakify/account/KcContext";

export const kcContext = (window as any).kcContext as KcContextBase | undefined;

export type KcContext = KcContextBase;

