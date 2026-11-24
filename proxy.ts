import type { SetAllCookies } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { createRequestSupabaseClient } from "@/src/server/supabase/client";

export async function proxy(request: NextRequest) {
  const responseCookies: Parameters<SetAllCookies>[0] = [];
  const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
  const supabase = createRequestSupabaseClient({
    getAll: () => request.cookies.getAll(),
    setAll: (changes, headers) => {
      for (const { name, value } of changes) {
        request.cookies.set(name, value);
      }

      responseCookies.push(...changes);
      for (const [name, value] of Object.entries(headers)) {
        responseHeaders.set(name, value);
      }
    },
  });

  // Resolve token refresh before the protected route reads the request cookies.
  await supabase.auth.getClaims();

  const response = NextResponse.next({ request, headers: responseHeaders });
  for (const { name, value, options } of responseCookies) {
    response.cookies.set(name, value, options);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
