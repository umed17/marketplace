"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

/** Must match Supabase → Auth → Email → Email OTP length */
export const EMAIL_OTP_LENGTH = Number(process.env.NEXT_PUBLIC_EMAIL_OTP_LENGTH) || 6;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  length?: number;
};

export function OtpInput({ value, onChange, label, disabled, length = EMAIL_OTP_LENGTH }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function updateAt(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").slice(0, length));
  }

  function focusIndex(index: number) {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateAt(index, digit);
    if (digit && index < length - 1) focusIndex(index + 1);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        updateAt(index, "");
        return;
      }
      if (index > 0) {
        updateAt(index - 1, "");
        focusIndex(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div
        className="otp-grid"
        role="group"
        aria-label={label}
        style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            className="otp-cell"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`${label} ${index + 1}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
}
