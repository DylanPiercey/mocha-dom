import { ok } from "assert";

it("is on the server", async () => {
  ok(typeof window === "undefined");
});
