import { useEffect, useState } from "react";

// 1. Definisikan interface untuk response Midtrans
export interface MidtransResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    pdf_url?: string;
    finish_redirect_url?: string;
}

// 2. Definisikan interface untuk Window agar global 'snap' dikenali
interface MidtransSnap {
    pay: (token: string, options: MidtransOptions) => void;
}

interface MidtransOptions {
    onSuccess?: (result: MidtransResult) => void;
    onPending?: (result: MidtransResult) => void;
    onError?: (result: MidtransResult) => void;
    onClose?: () => void;
}

export function useMidtransSnap() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const existingScript = document.getElementById("midtrans-snap");
        if (existingScript) {
            setIsReady(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "midtrans-snap";
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        script.setAttribute("data-client-key", clientKey);

        script.async = true;
        script.onload = () => setIsReady(true);
        document.body.appendChild(script);
    }, []);

    const pay = (snapToken: string, callbacks: MidtransOptions) => {
        // Type casting window ke custom interface yang kita buat
        const snap = ((window as unknown) as { snap: MidtransSnap }).snap;

        if (!snap) {
            console.error("Midtrans Snap not loaded");
            return;
        }

        snap.pay(snapToken, callbacks);
    };

    return { isReady, pay };
}
