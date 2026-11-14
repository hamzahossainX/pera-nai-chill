import { describe, expect, it } from "vitest";
import { translate } from "@/i18n";

describe("localization", () => {
  it("provides English and Bangla labels for shared UI", () => {
    expect(translate("en", "settings")).toBe("SETTINGS");
    expect(translate("bn", "settings")).toBe("সেটিংস");
    expect(translate("en", "nextMap")).toBe("NEXT MAP");
    expect(translate("bn", "nextMap")).toBe("পরের ম্যাপ");
  });
});
