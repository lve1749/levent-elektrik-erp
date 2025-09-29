import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')
  const userInfo = request.cookies.get('user-info')

  if (!sessionToken) {
    return NextResponse.json(
      { success: false, message: 'Oturum bulunamadı' },
      { status: 401 }
    )
  }

  try {
    const user = userInfo ? JSON.parse(userInfo.value) : null
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Oturum bilgisi hatalı' },
      { status: 401 }
    )
  }
}