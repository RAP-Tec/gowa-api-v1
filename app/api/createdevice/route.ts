import { NextRequest, NextResponse } from "next/server"
import { evolutionApi } from "@/lib/evolution-api"

// Chaves de autenticação
const AUTH_KEY = process.env.AUTH_KEY
const GOWA_API_KEY = process.env.GOWA_API_KEY // Carrega a chave da API GOWA do .env

// Handle POST requests to create a new device/instance
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API Key do Header
    const apiKeyFromHeader = request.headers.get('apikey')
    if (!GOWA_API_KEY) {
        console.error("GOWA_API_KEY não está definida no ambiente.")
        // É importante não expor detalhes internos do erro ao cliente
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

    // Validar formato do instanceName (letras, números, traço)
    const instanceNameRegex = /^[a-zA-Z0-9-]+$/;
    if (!instanceNameRegex.test(body.instanceName)) {
      return NextResponse.json(
        { success: false, error: "The Instance name cannot contain spaces, special characters and accents, it can only contain letters, numbers and - (dash)" },
        { status: 400 }
      )
    }

    // Se ambas as chaves e instanceName são válidos, prosseguir
//    console.log("Autenticação bem-sucedida. Criando instância...")
    // Call the Evolution API to create a new instance
    const result = await evolutionApi.createInstance(body.instanceName, body.number)

    if (result.success && result.data) { // Verificação adicional para result.data
      // Get QR code for the newly created instance
      const qrResult = await evolutionApi.getQrCode(body.instanceName)

      // Combine the results
      return NextResponse.json({
        success: result.success,
        message: result.message,
        version: result.version, // Acessar a versão diretamente do resultado
        steps: result.steps,
        data: {
          ...result.data, // Mantém os dados originais de createInstance (instanceName, instanceId, number, createdAt, token)
          qrcode: qrResult.success ? qrResult.data?.qrcode : null,
          pairingCode: qrResult.success ? qrResult.data?.pairingCode : null
        }
      })
    }
    
    // Return the original result if instance creation failed or data is missing
    return NextResponse.json(result)
    
  } catch (error) {
    console.error("Error in /createdevice endpoint:", error)
    
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