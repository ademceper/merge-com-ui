import { useMutation } from "@tanstack/react-query";
import {
    generateAndDownloadKey,
    uploadCertificate,
    generateKey,
    downloadKey
} from "@/admin/api/clients";

export function useGenerateAndDownloadKey() {
    return useMutation({
        mutationFn: ({
            clientId,
            attr,
            config
        }: {
            clientId: string;
            attr: string;
            config: Record<string, unknown>;
        }) => generateAndDownloadKey(clientId, attr, config)
    });
}

export function useUploadCertificate() {
    return useMutation({
        mutationFn: ({
            clientId,
            attr,
            formData
        }: {
            clientId: string;
            attr: string;
            formData: FormData;
        }) => uploadCertificate(clientId, attr, formData)
    });
}

export function useGenerateKey() {
    return useMutation({
        mutationFn: ({ clientId, attr }: { clientId: string; attr: string }) =>
            generateKey(clientId, attr)
    });
}

export function useDownloadKey() {
    return useMutation({
        mutationFn: ({
            clientId,
            attr,
            config
        }: {
            clientId: string;
            attr: string;
            config: Record<string, unknown>;
        }) => downloadKey(clientId, attr, config)
    });
}
