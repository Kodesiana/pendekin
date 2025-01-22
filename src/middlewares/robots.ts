import { createMiddleware } from "hono/factory";

const robotsNoIndex = createMiddleware<{ Bindings: Env }>(async (c, next) => {
    await next();
    c.header("X-Robots-Tag", "noindex");
});

export default robotsNoIndex;
