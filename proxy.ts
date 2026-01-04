import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

type AppRole = "user" | "admin" | "super_admin";

function isPublicAssetPath(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
  return to;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAssetPath(pathname)) {
    return NextResponse.next();
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // Keep canonical route casing and migrate old paths.
  if (pathname === "/signup" || pathname.startsWith("/signup/")) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (pathname === "/superadmin" || pathname.startsWith("/superadmin/")) {
    const corrected = pathname.replace("/superadmin", "/superAdmin");
    return NextResponse.redirect(new URL(corrected, request.url));
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardPath = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isSuperAdminPath = pathname === "/superAdmin" || pathname.startsWith("/superAdmin/");

  // Require auth for protected areas.
  if (!user && (isDashboardPath || isAdminPath || isSuperAdminPath)) {
    const redirectResponse = NextResponse.redirect(new URL("/signin", request.url));
    return copyCookies(response, redirectResponse);
  }

  let role: AppRole = "user";
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    role = (userData?.role as AppRole) || "user";
  }

  // Role-based routing.
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin";
  const isPrivileged = isSuperAdmin || isAdmin;

  // Keep canonical route casing and migrate old paths (role-aware).
  // Note: we delay /admin <-> /superAdmin redirects until after auth so we can route by role.
  if (user && isSuperAdmin && isAdminPath) {
    const mapped = pathname.replace("/admin", "/superAdmin");
    const redirectResponse = NextResponse.redirect(new URL(mapped, request.url));
    return copyCookies(response, redirectResponse);
  }
  if (user && isAdmin && isSuperAdminPath) {
    const mapped = pathname.replace("/superAdmin", "/admin");
    const redirectResponse = NextResponse.redirect(new URL(mapped, request.url));
    return copyCookies(response, redirectResponse);
  }

  // If already signed in, send users to the correct landing page.
  if (user && (pathname === "/signin" || pathname.startsWith("/signin/"))) {
    const redirectResponse = NextResponse.redirect(
      new URL(isSuperAdmin ? "/superAdmin/dashboard" : isAdmin ? "/admin/dashboard" : "/dashboard", request.url),
    );
    return copyCookies(response, redirectResponse);
  }

  if (user && isSuperAdmin && isDashboardPath) {
    const redirectResponse = NextResponse.redirect(new URL("/superAdmin/dashboard", request.url));
    return copyCookies(response, redirectResponse);
  }

  if (user && isAdmin && isDashboardPath) {
    const redirectResponse = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return copyCookies(response, redirectResponse);
  }

  if (user && !isSuperAdmin && isSuperAdminPath) {
    const redirectResponse = NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/dashboard", request.url));
    return copyCookies(response, redirectResponse);
  }

  if (user && !isPrivileged && isAdminPath) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    return copyCookies(response, redirectResponse);
  }

  // Admin area is view-only and intentionally excludes some routes.
  if (
    user &&
    isAdmin &&
    (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/settings"))
  ) {
    const redirectResponse = NextResponse.redirect(new URL('/admin/dashboard', request.url));
    return copyCookies(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};