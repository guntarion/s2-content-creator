
export { default } from "next-auth/middleware"

export const config = { matcher: ["/generate", "/workflow/:path*", "/result/:path*"] }
