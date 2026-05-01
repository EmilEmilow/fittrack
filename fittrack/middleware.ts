export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/diary/:path*',
    '/search/:path*',
    '/recommendations/:path*',
    '/progress/:path*',
    '/profile/:path*',
    '/foods/:path*',
  ],
}
