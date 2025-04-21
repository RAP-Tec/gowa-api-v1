import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    const adminUsername = process.env.LOGIN_ADMIN;
    const adminPassword = process.env.PASSWORD_ADMIN;
    
    if (username === adminUsername && password === adminPassword) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in login endpoint:", error);
    
    return NextResponse.json(
      { success: false, error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}