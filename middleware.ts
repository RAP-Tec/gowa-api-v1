import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers to allow API requests
  response.headers.append("Access-Control-Allow-Origin", "*")
  response.headers.append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.append("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return response
}

// Apply middleware to API routes
export const config = {
  matcher: ["/api/:path*"],
}

