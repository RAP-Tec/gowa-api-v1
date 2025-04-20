import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"

// API key for authentication
const API_KEY = process.env.AUTH_KEY || "kfrngOCiD8FbpoRrjRe9vagrVEYeqc1B0eEWxsNdieWjaRPHSM"

// Make sure to export the handler functions properly
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

    // Check if instanceName is provided
    if (!body.instanceName) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: instanceName" },
        { status: 400 }
      )
    }

    // Call the Evolution API to check if instance exists
    const exists = await evolutionApi.instanceExists(body.instanceName)
    
    // Return the response
    return NextResponse.json({
      success: true,
      data: {
        exists: exists
      }
    })
  } catch (error) {
    console.error("Error in /deviceexists endpoint:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      },
      { status: 500 }
    )
  }
}

// Also export GET method to ensure the route is recognized
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST instead." },
    { status: 405 }
  )
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