import { NextResponse } from "next/server";

export function middleware(req) {
  console.log("middleware");
  const cookie = req.cookies.get("token")?.value;
  if (cookie === undefined) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url, req.url);
  }
}
export const config = {
  matcher: "/((?!login|signup|api|_next/static|_next/image|favicon.ico).*)",
};
