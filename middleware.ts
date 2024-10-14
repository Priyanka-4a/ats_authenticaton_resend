import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // Get the session token to check if the user is authenticated
    const token = await getToken({ req });
    const isAuth = !!token;

    // Check if the user is trying to access the sign-in page
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth/signin");

    // If the user is already authenticated and tries to access the sign-in page, redirect them to the dashboard
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null; // Allow access to the sign-in page if not authenticated
    }

    // If the user is not authenticated and tries to access a protected page, redirect them to the sign-in page
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Allow the request to proceed if authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures that the middleware runs for all the specified routes
      async authorized() {
        return true;
      },
    },
  }
);

// Define the paths that should be protected
export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"], // Protect the dashboard and editor routes
};
