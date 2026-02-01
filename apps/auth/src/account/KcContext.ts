import type { KcContext as KcContextBase } from "keycloakify/account/KcContext";

export const kcContext = (window as Window & { kcContext?: KcContextBase }).kcContext;

export type KcContext = KcContextBase;

