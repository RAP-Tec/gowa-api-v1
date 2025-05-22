import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY // Carrega a chave AUTH_KEY do .env
const GOWA_API_KEY = process.env.GOWA_API_KEY // Carrega a chave da API GOWA do .env

// Handle POST requests para listar devices/instances
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key do Header
    const apiKeyFromHeader = request.headers.get('apikey')
    if (!GOWA_API_KEY) {
        console.error("GOWA_API_KEY não está definida no ambiente.")
        return NextResponse.json(
            { success: false, error: "API KEY configuration error" },
            { status: 500 }
        )
    }
    if (!apiKeyFromHeader || apiKeyFromHeader !== GOWA_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API Key (apikey)" },
        { status: 401 }
      )
    }

    // 2. Validar Auth Key do Body
    const body = await request.json()
    if (!body.authkey || body.authkey !== AUTH_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid authentication key (authkey)" },
        { status: 401 }
      )
    }

    // Se ambas as chaves são válidas, prosseguir
//    console.log("Autenticação bem-sucedida. Listando instâncias...")
    const result = await evolutionApi.listInstances() // Chama a função para listar instâncias

    // Retorna o resultado da API Evolution
    return NextResponse.json(result)

  } catch (error) {
    console.error("Error in /listdevices endpoint:", error)
    
    // Trata erros de parsing do JSON ou outros erros inesperados
    let errorMessage = "Unknown error occurred"
    if (error instanceof SyntaxError) {
        errorMessage = "Invalid JSON format in request body"
    } else if (error instanceof Error) {
        errorMessage = error.message
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: error instanceof SyntaxError ? 400 : 500 } // Retorna 400 para JSON inválido
    )
  }
}

// Método GET não permitido (ou ajuste conforme necessário)
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
      "Access-Control-Allow-Methods": "POST, OPTIONS", // Permitir POST e OPTIONS
      "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey", // Permitir os headers necessários
    },
  })
}