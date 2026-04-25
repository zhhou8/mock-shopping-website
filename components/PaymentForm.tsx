"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface PaymentFormProps {
  mode: "cart" | "membership";
  productId?: string;
  totalLabel: string;
  ctaLabel?: string; // e.g. "Pay" or "Subscribe"
  ctaSelector?: string; // overrides data-bunqpal on the submit button
}

type Tab = "iban" | "card";

export function PaymentForm({
  mode,
  productId,
  totalLabel,
  ctaLabel = "Pay",
  ctaSelector = "pay-now-button"
}: PaymentFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("iban");
  const [iban, setIban] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload =
      tab === "iban"
        ? {
            mode,
            productId,
            payment_method: "iban" as const,
            iban: iban.trim(),
            holder_name: accountName.trim()
          }
        : {
            mode,
            productId,
            payment_method: "card" as const,
            card_number: cardNumber.replace(/\s/g, ""),
            expiry: expiry.trim(),
            cvc: cvc.trim(),
            holder_name: cardName.trim()
          };

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Payment failed");
          return;
        }
        router.push(`/checkout/success/${data.orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      }
    });
  }

  const tabBtn = (target: Tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === target}
      onClick={() => {
        setTab(target);
        setError(null);
      }}
      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
        tab === target
          ? "bg-ah-blue text-white border-ah-blue"
          : "bg-white text-ah-ink border-ah-border hover:bg-ah-paper"
      }`}
      data-bunqpal="payment-method-tab"
      data-bunqpal-method={target}
    >
      {label}
    </button>
  );

  return (
    <form
      onSubmit={submit}
      className="space-y-4"
      data-bunqpal="payment-form"
      data-bunqpal-active-tab={tab}
    >
      <div role="tablist" className="flex gap-2">
        {tabBtn("iban", "Bank transfer")}
        {tabBtn("card", "Card")}
      </div>

      {tab === "iban" ? (
        <div className="space-y-3" data-bunqpal="iban-fields">
          <label className="block text-sm">
            <span className="font-medium block mb-1">IBAN</span>
            <input
              type="text"
              className="input font-mono"
              placeholder="NL00 BUNQ 0000 0000 00"
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              required
              autoComplete="off"
              data-bunqpal="iban-input"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium block mb-1">Account holder</span>
            <input
              type="text"
              className="input"
              placeholder="L. Nicholson"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              autoComplete="off"
              data-bunqpal="account-name-input"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3" data-bunqpal="card-fields">
          <label className="block text-sm">
            <span className="font-medium block mb-1">Card number</span>
            <input
              type="text"
              inputMode="numeric"
              className="input font-mono"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
              autoComplete="off"
              data-bunqpal="card-number-input"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium block mb-1">Expiry</span>
              <input
                type="text"
                className="input font-mono"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                autoComplete="off"
                data-bunqpal="card-expiry-input"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium block mb-1">CVC</span>
              <input
                type="text"
                inputMode="numeric"
                className="input font-mono"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                required
                autoComplete="off"
                data-bunqpal="card-cvc-input"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-medium block mb-1">Cardholder name</span>
            <input
              type="text"
              className="input"
              placeholder="L. Nicholson"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
              autoComplete="off"
              data-bunqpal="card-name-input"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full text-base"
        disabled={pending}
        data-bunqpal={ctaSelector}
      >
        {pending ? "Processing…" : `${ctaLabel} ${totalLabel}`}
      </button>

      {error && (
        <div
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          data-bunqpal="payment-error"
        >
          {error}
        </div>
      )}
    </form>
  );
}
