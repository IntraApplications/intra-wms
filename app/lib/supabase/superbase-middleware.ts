import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // No user, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  } else if (user) {
    const workspaceExists = await doesWorkspaceExist(user.id, supabase);

    if (!workspaceExists && request.nextUrl.pathname !== "/setup") {
      // If no workspace exists and the user is not already on the setup page, redirect to setup
      const url = request.nextUrl.clone();
      url.pathname = "/setup";
      return NextResponse.redirect(url);
    }

    if (workspaceExists && request.nextUrl.pathname === "/setup") {
      // If the user has a workspace and tries to access the setup page, redirect to dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/workspaces";
      return NextResponse.redirect(url);
    }
  }

  // Handle redirects for the login page
  if (request.nextUrl.pathname === "/login") {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/workspaces";
      return NextResponse.redirect(url);
    }
  }

  // Redirect root to dashboard
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/workspaces";
    return NextResponse.redirect(url);
  }

  // Return the original supabaseResponse
  return supabaseResponse;
}

const doesWorkspaceExist = async (userId, supabaseClient) => {
  // User is logged in, now check for workspaces
  const { data: workspacesData, error } = await supabaseClient
    .from("workspaces")
    .select("name")
    .eq("user_id", userId);

  // If there are no workspaces or an error occurs, return false
  if (!workspacesData || workspacesData.length === 0) {
    return false;
  }

  return true;
};
