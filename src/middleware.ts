import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, redirect } = context;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/tai-khoan")) {
    const cookieHeader = request.headers.get("cookie");
    const hasAccessToken = cookieHeader?.includes("accessToken=");

    if (!hasAccessToken) {
      return redirect("/404");
    }
  }

  return next();
};
