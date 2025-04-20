import { NextRequest, NextResponse } from "next/server"
import { listInstances } from "@/app/actions/instance-actions"

// API key for authentication
const API_KEY = process.env.AUTH_KEY || "kfrngOCiD8FbpoRrjRe9vagrVEYeqc1B0eEWxsNdieWjaRPHSM"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Validate the auth key
    if (!body.authkey || body.authkey !== API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid authentication key" },
        { status: 401 }
      )
    }

    // Call the server action to list instances
    const response = await listInstances()
    
    // Return the response
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in /listdevices endpoint:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}