import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: 200,
      message: "Gowa Plataforma Devices API",
      version: "2.3.3",
      clientName: "gowa_plataforma_api",
      manager: "/manager",
      documentation: "https://gowaba.com.br"
    },
    { status: 200 }
  )
}