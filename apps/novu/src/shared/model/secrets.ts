const NOVU_ENCRYPTION_SUB_MASK = "nvsk.";

type EncryptedSecret = `${typeof NOVU_ENCRYPTION_SUB_MASK}${string}`;
