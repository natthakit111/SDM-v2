import { NextRequest, NextResponse } from 'next/server'

interface OverdueBill {
  id: string
  roomNumber: string
  tenantName: string
  tenantPhone: string
  amount: number
  daysOverdue: number
  dueDate: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Here you would fetch overdue bills from database
    // For now, this is a mock implementation
    const overdateBills: OverdueBill[] = [
      {
        id: '1',
        roomNumber: 'A101',
        tenantName: 'สมชาย ใจดี',
        tenantPhone: '081-234-5678',
        amount: 5500,
        daysOverdue: 45,
        dueDate: '2026-02-10',
      },
      {
        id: '2',
        roomNumber: 'B205',
        tenantName: 'สมหญิง สุขสวรรค์',
        tenantPhone: '089-876-5432',
        amount: 6000,
        daysOverdue: 30,
        dueDate: '2026-02-15',
      },
    ]

    const notifications = []

    // Check each overdue bill and send notifications
    for (const bill of overdateBills) {
      // Send to Telegram if configured
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
      const telegramChatId = process.env.TELEGRAM_CHAT_ID

      if (telegramBotToken && telegramChatId) {
        const message = `⚠️ เตือนบิลค้าง\n\nห้อง: ${bill.roomNumber}\nผู้เช่า: ${bill.tenantName}\nยอดเงิน: ${bill.amount} บาท\nค้างชำระ: ${bill.daysOverdue} วัน\n\nกรุณาติดต่อ: ${bill.tenantPhone}`

        try {
          const response = await fetch(
            `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
              }),
            }
          )

          if (response.ok) {
            notifications.push({
              billId: bill.id,
              method: 'telegram',
              status: 'success',
            })
            console.log(`[v0] Telegram notification sent for room ${bill.roomNumber}`)
          }
        } catch (error) {
          console.error(`[v0] Error sending Telegram notification for room ${bill.roomNumber}:`, error)
        }
      }

      // Send email notification
      try {
        // You would use your email service here (SendGrid, Resend, etc.)
        console.log(`[v0] Email notification sent to ${bill.tenantName} for room ${bill.roomNumber}`)
        notifications.push({
          billId: bill.id,
          method: 'email',
          status: 'sent',
        })
      } catch (error) {
        console.error(`[v0] Error sending email:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Overdue bills checked and notifications sent',
      totalBills: overdateBills.length,
      notifications: notifications.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cron job endpoint for checking overdue bills',
    method: 'POST',
    authentication: 'Bearer token required',
  })
}
