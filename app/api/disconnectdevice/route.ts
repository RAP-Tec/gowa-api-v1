import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY
const GOWA_API_KEY = process.env.GOWA_API_KEY

// Handle POST requests to disconnect a device by number
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key do Header
    const apiKeyFromHeader = request.headers.get('apikey')
    if (!GOWA_API_KEY) {
        console.error("GOWA_API_KEY não está definida no ambiente.")
        return NextResponse.json(
            { success: false, error: "Gowa API Key is not defined in the environment" },
            { status: 500 }
        )
    }
    if (!apiKeyFromHeader || apiKeyFromHeader !== GOWA_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API Key (apikey)" },
        { status: 401 }
      )
    }

    // 2. Validar Auth Key e number do Body
    const body = await request.json()

    // Validar authkey
    if (!AUTH_KEY) {
        console.error("AUTH_KEY não está definida no ambiente.")
        return NextResponse.json(
            { success: false, error: "Gowa Auth Key is not defined in the environment" },
            { status: 500 }
        )
    }
    if (!body.authkey || body.authkey !== AUTH_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid authentication key (authkey)" },
        { status: 401 }
      )
    }

    // Validar number
    if (!body.number) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: number" },
        { status: 400 }
      )
    }

    // Se ambas as chaves e number são válidos, prosseguir
    console.log(`Autenticação bem-sucedida. Desconectando dispositivo com número: ${body.number}...`)
    // Call the Evolution API to disconnect the device by number
    // Note: We need to add a method in evolutionApi to handle this
    const result = await evolutionApi.disconnectDeviceByNumber(body.number)

    // Return the response
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in /disconnectdevice endpoint:", error)

    // Trata erros de parsing do JSON ou outros erros inesperados
    let errorMessage = "Unknown error occurred"
    let errorStatus = 500
    if (error instanceof SyntaxError) {
        errorMessage = "Invalid JSON format in request body"
        errorStatus = 400
    } else if (error instanceof Error) {
        errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: errorStatus }
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
      "Access-Control-Allow-Origin": "*", // Ajuste conforme sua política de CORS
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey", // Adicionado apikey
    },
  })
}