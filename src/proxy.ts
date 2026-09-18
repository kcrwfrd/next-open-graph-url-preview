import { NextResponse, userAgent, type NextRequest } from "next/server";

/**
 * Logs the User-Agent (raw and parsed) for every page and OG-image request so
 * link-preview fetchers (iMessage, Slack, Twitter, etc.) can be identified.
 */
export function proxy(request: NextRequest) {
  const { isBot, browser, os, device } = userAgent(request);

  console.log({
    ts: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname + request.nextUrl.search,
    userAgent: request.headers.get('user-agent') ?? '',
    isBot,
    browser: browser.name
      ? `${browser.name} ${browser.version ?? ''}`.trim()
      : undefined,
    os: os.name ? `${os.name} ${os.version ?? ''}`.trim() : undefined,
    device: device.type
  })

  return NextResponse.next();
}

export const config = {
  // Skip build assets and the favicon; everything else (pages, /opengraph-image.png) is logged.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
