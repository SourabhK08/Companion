"use client";

import { useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ─── Load Razorpay Script ─────────────────────────────────

let scriptLoadPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null; // Allow retry
      reject(new Error("Failed to load Razorpay checkout script"));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

// ─── Hook ─────────────────────────────────────────────────

interface UseRazorpayOptions {
  /** User's name for prefilling checkout */
  userName?: string;
  /** User's email for prefilling checkout */
  userEmail?: string;
  /** User's phone for prefilling checkout */
  userPhone?: string;
}

export function useRazorpay(options: UseRazorpayOptions = {}) {
  const isProcessingRef = useRef(false);

  /**
   * Opens the Razorpay Checkout popup.
   *
   * @param orderId - Razorpay order ID from backend
   * @param amount - Amount in paisa
   * @param keyId - Razorpay key_id (public key)
   * @returns Promise resolving with payment response on success
   */
  const openCheckout = useCallback(
    async (orderId: string, amount: number, keyId: string): Promise<RazorpayResponse> => {
      if (isProcessingRef.current) {
        throw new Error("A payment is already in progress");
      }

      isProcessingRef.current = true;

      try {
        await loadRazorpayScript();

        return await new Promise<RazorpayResponse>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: keyId,
            amount,
            currency: "INR",
            order_id: orderId,
            name: "Modhuralap",
            description: "Add Money to Wallet",
            prefill: {
              name: options.userName,
              email: options.userEmail,
              contact: options.userPhone,
            },
            theme: {
              color: "#7C2D4B", // berry color
            },
            handler: (response: RazorpayResponse) => {
              isProcessingRef.current = false;
              resolve(response);
            },
            modal: {
              ondismiss: () => {
                isProcessingRef.current = false;
                reject(new Error("Payment cancelled by user"));
              },
            },
          });

          rzp.on("payment.failed", (response: unknown) => {
            isProcessingRef.current = false;
            const errorDesc =
              (response as { error?: { description?: string } })?.error?.description ||
              "Payment failed";
            reject(new Error(errorDesc));
          });

          rzp.open();
        });
      } catch (error) {
        isProcessingRef.current = false;
        throw error;
      }
    },
    [options.userName, options.userEmail, options.userPhone]
  );

  return { openCheckout };
}
