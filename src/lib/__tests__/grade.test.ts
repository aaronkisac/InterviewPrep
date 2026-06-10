import { describe, expect, it } from "vitest";

import { getGrade } from "@/lib/grade";
import { i18nCommon } from "@/lib/i18n";

describe("getGrade", () => {
  it("returns Perfect only at exactly 100", () => {
    expect(getGrade(100, "en").label).toBe(i18nCommon.en.perfect);
    expect(getGrade(99, "en").label).not.toBe(i18nCommon.en.perfect);
  });

  it("returns Strong for 80–99", () => {
    expect(getGrade(80, "en").label).toBe(i18nCommon.en.strong);
    expect(getGrade(99, "en").label).toBe(i18nCommon.en.strong);
  });

  it("returns Decent for 60–79", () => {
    expect(getGrade(60, "en").label).toBe(i18nCommon.en.decent);
    expect(getGrade(79, "en").label).toBe(i18nCommon.en.decent);
  });

  it("returns Needs work below 60", () => {
    expect(getGrade(59, "en").label).toBe(i18nCommon.en.needsWork);
    expect(getGrade(0, "en").label).toBe(i18nCommon.en.needsWork);
  });

  it("localizes labels in Turkish", () => {
    expect(getGrade(100, "tr").label).toBe(i18nCommon.tr.perfect);
    expect(getGrade(50, "tr").label).toBe(i18nCommon.tr.needsWork);
  });

  it("keeps css classes consistent within a band", () => {
    const g80 = getGrade(80, "en");
    const g99 = getGrade(99, "en");
    expect(g80.barClass).toBe(g99.barClass);
    expect(g80.chipClass).toBe(g99.chipClass);
  });
});
