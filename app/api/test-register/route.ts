import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test registration body:', body)
    
    return NextResponse.json({
      message: "Test successful",
      receivedData: body
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: "Test failed",
      details: error
    }, { status: 400 })
  }
}