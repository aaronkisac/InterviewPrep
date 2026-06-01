"use client";

import type { MockOptionInput } from "@/types/mock";

import type { MyTopicsI18n } from "./types";

export function MockOptionsEditor({
  value,
  onChange,
  i18n,
}: {
  value: MockOptionInput[];
  onChange: (opts: MockOptionInput[]) => void;
  i18n: MyTopicsI18n;
}): React.ReactElement {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {i18n.mockOptionsLabel}{" "}
        <span className="font-normal">{i18n.mockOptionsHint}</span>
      </p>
      {value.map((opt, i) => (
        <div key={`opt-${i}`} className="flex items-start gap-2">
          <input
            type="radio"
            name="mock-correct"
            checked={opt.isCorrect}
            onChange={() =>
              onChange(value.map((o, j) => ({ ...o, isCorrect: j === i })))
            }
            className="mt-2 shrink-0"
            title={i18n.markCorrect}
          />
          <div className="flex-1 space-y-1">
            <input
              value={opt.optionText}
              onChange={(e) =>
                onChange(
                  value.map((o, j) =>
                    j === i ? { ...o, optionText: e.target.value } : o,
                  ),
                )
              }
              placeholder={i18n.mockOptionPlaceholder(String.fromCharCode(65 + i))}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
            <input
              value={opt.explanation ?? ""}
              onChange={(e) =>
                onChange(
                  value.map((o, j) =>
                    j === i ? { ...o, explanation: e.target.value } : o,
                  ),
                )
              }
              placeholder={i18n.explanationPlaceholder}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
