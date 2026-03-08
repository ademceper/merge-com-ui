import { generateEncodedPath } from "../generateEncodedPath";

export type PageListParams = { realm?: string; providerId: string };
export type PageParams = { realm: string; providerId: string; id: string };

export const toPage = (params: PageListParams): string =>
    generateEncodedPath("/:realm/page-section/:providerId", params as any);

export const toDetailPage = (params: PageParams): string =>
    generateEncodedPath("/:realm/page-section/:providerId/:id", params as any);

export const addDetailPage = (params: Partial<PageParams>): string =>
    generateEncodedPath("/:realm/page-section/:providerId/add", params as any);
