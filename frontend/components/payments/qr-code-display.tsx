'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Download, Copy } from 'lucide-react'
import { useState } from 'react'

interface QRCodeDisplayProps {
  amount: number
  bankAccount: string
  bankName: string
  phoneNumber?: string
}

export function QRCodeDisplay({ 
  amount, 
  bankAccount, 
  bankName,
  phoneNumber 
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const promptPayId = phoneNumber || bankAccount

  const handleCopy = () => {
    navigator.clipboard.writeText(promptPayId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <QrCode className="w-5 h-5" />
          QR Code PromptPay
        </CardTitle>
        <CardDescription>สแกน QR Code เพื่อชำระเงินผ่าน PromptPay</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Simulated QR Code */}
            <div className="w-48 h-48 bg-white border-4 border-foreground flex items-center justify-center">
              <QrCode className="w-32 h-32 text-foreground opacity-20" />
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">จำนวนเงิน</p>
          <p className="text-3xl font-bold text-primary">{amount.toLocaleString('th-TH')} บาท</p>
        </div>

        {/* Bank Details */}
        <div className="space-y-3 bg-muted p-4 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">ชื่อธนาคาร</p>
            <p className="font-medium">{bankName}</p>
          </div>
          <div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">เลขที่บัญชี / เบอร์โทร</p>
                <p className="font-mono font-medium">{promptPayId}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? 'คัดลอกแล้ว' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-sm">
          <p className="font-medium">วิธีการชำระเงิน:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>เปิดแอปธนาคารหรือแอป PromptPay</li>
            <li>กด "สแกน QR Code" หรือ "ส่งเงิน"</li>
            <li>สแกน QR Code ด้านบน</li>
            <li>ยืนยันจำนวนเงิน {amount.toLocaleString('th-TH')} บาท</li>
            <li>ยืนยันการชำระเงิน</li>
          </ol>
        </div>

        {/* Download Button */}
        <Button variant="outline" className="w-full gap-2">
          <Download className="w-4 h-4" />
          ดาวน์โหลด QR Code
        </Button>

        {/* Security Notice */}
        <div className="bg-info/10 border border-info rounded-lg p-3">
          <p className="text-xs text-info">
            ปลอดภัย: ข้อมูลการชำระเงินของคุณได้รับการเข้ารหัสและปกป้องอย่างเต็มที่
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
