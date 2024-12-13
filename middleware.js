import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  return
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // if (!token || typeof token !== "object") {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }

  // console.log("Token data:", token);

  // const currentPath = req.nextUrl.pathname;

  // const protectedRoutes = {
  //   "/admin": { role: "admin" },
  //   "/orders/process": { permissions: ["picking"] },
  //   "/dashboard/reports": { permissions: ["view_reports"] },
  // };

  // const routeConfig = protectedRoutes[currentPath];

  // if (routeConfig) {
  //   if (routeConfig.role && token.role !== routeConfig.role) {
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }

  //   if (
  //     routeConfig.permissions &&
  //     Array.isArray(routeConfig.permissions) &&
  //     (!Array.isArray(token.permissions) || 
  //       !routeConfig.permissions.some((perm) => token.permissions.includes(perm)))
  //   ) {
  //     return NextResponse.redirect(new URL("/", req.url));
  //   }
  // }

  // return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/orders/process", "/dashboard/:path*"],
};
