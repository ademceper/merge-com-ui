import { useMutation } from "@tanstack/react-query";
import { importFromUrl } from "../../../api/identity-providers";

export function useImportFromUrl() {
    return useMutation({
        mutationFn: (params: { providerId: string; fromUrl: string }) =>
            importFromUrl(params)
    });
}
