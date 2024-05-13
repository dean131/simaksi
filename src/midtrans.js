import midtransClient from "midtrans-client";

// Membuat Midtrans API client
export const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: "SB-Mid-server-KAAlcXIVhBhUC2R9U-xchQG0",
    clientKey: "SB-Mid-client-JbTOBSUC5bI8vblM",
});
