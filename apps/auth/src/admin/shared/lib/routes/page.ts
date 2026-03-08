import { generateEncodedPath } from "../generate-encoded-path";

export type PageListParams = { realm?: string; providerId: string };
export type PageParams = { realm: string; providerId: string; id: string };

export const toPage = (params: PageListParams): string =>
    generateEncodedPath("/:realm/page-section/:providerId", {
        realm: params.realm!,
        providerId: params.providerId
    });

export const toDetailPage = (params: PageParams): string =>
    generateEncodedPath("/:realm/page-section/:providerId/:id", {
        realm: params.realm,
        providerId: params.providerId,
        id: params.id
    });

export const addDetailPage = (params: Partial<PageParams>): string =>
    generateEncodedPath("/:realm/page-section/:providerId/add", {
        realm: params.realm!,
        providerId: params.providerId!
    });
