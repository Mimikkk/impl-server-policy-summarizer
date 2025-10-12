import { HonoClient } from "../clients/HonoClient.ts";

HonoClient.get("/", (context) => context.json({ message: "Hello, world!" }));
