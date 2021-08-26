import { ok } from "assert";

it("is in the browser", async () => {
  ok(typeof window === "object");
});
