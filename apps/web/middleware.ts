import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/patients', '/settings', '/analytics'];


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static assets and api routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                response = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                );
            },
        },
    });

    // Refresh session if exists
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth pages to dashboard
    if ((pathname === '/' || pathname === '/login' || pathname === '/register') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role-based route protection for authenticated users
    if (user && pathname.startsWith('/dashboard/')) {
        const role = user.user_metadata?.role || 'citizen';

        const adminOnly = ['/dashboard/patients', '/dashboard/sahayak'];
        const sahayakOnly = ['/dashboard/my-patients'];
        const citizenOnly = ['/dashboard/my-health', '/dashboard/symptom-checker', '/dashboard/prescription-scanner', '/dashboard/medicine-search', '/dashboard/nearby'];

        const isAdminRoute = adminOnly.some((r) => pathname.startsWith(r));
        const isSahayakRoute = sahayakOnly.some((r) => pathname.startsWith(r));
        const isCitizenRoute = citizenOnly.some((r) => pathname.startsWith(r));

        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (isSahayakRoute && role !== 'sahayak') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        if (isCitizenRoute && role !== 'citizen') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
