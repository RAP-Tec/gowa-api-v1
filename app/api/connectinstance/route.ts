import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY
const GOWA_API_KEY = process.env.GOWA_API_KEY // Carrega a chave da API GOWA do .env

// Handle POST requests para conectar uma instância e obter o QR Code
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

    // 2. Validar Auth Key e instanceName do Body
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

    // Validar instanceName
    if (!body.instanceName) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: instanceName" },
        { status: 400 }
      )
    }

    // Se ambas as chaves e instanceName são válidos, prosseguir
    console.log("Autenticação bem-sucedida. Obtendo QR Code para a instância...")
    // Chama a função getQrCode da evolution-api
    const qrResult = await evolutionApi.getQrCode(body.instanceName)

    // Retorna o resultado da chamada getQrCode
    return NextResponse.json(qrResult)

  } catch (error) {
    console.error("Error in /connectinstance endpoint:", error) // Atualiza a mensagem de erro

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

// Também exporta o método GET para garantir que a rota seja reconhecida
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST instead." },
    { status: 405 }
  )
}

// Trata requisições OPTIONS para CORS
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