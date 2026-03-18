'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SlipData {
  transferDate: string
  amount: number
  senderBank: string
  senderAccount: string
  receiverBank: string
  receiverAccount: string
  billId?: string
}

interface PaymentSlipProcessorProps {
  onSubmit?: (data: SlipData) => void
}

export function PaymentSlipProcessor({ onSubmit }: PaymentSlipProcessorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split('T')[0],
    amount: '',
    senderBank: '',
    receiverBank: '',
    billId: ''
  })
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!file || !formData.amount) {
      setError('กรุณาเลือกไฟล์สลิปและระบุจำนวนเงิน')
      return
    }

    setProcessing(true)
    
    // Simulate OCR processing
    setTimeout(() => {
      const slipData: SlipData = {
        transferDate: formData.transferDate,
        amount: parseFloat(formData.amount),
        senderBank: formData.senderBank,
        senderAccount: '',
        receiverBank: formData.receiverBank,
        receiverAccount: '',
        billId: formData.billId
      }
      
      onSubmit?.(slipData)
      setSuccess(true)
      setProcessing(false)
      
      setTimeout(() => {
        setFile(null)
        setPreview('')
        setFormData({
          transferDate: new Date().toISOString().split('T')[0],
          amount: '',
          senderBank: '',
          receiverBank: '',
          billId: ''
        })
        setSuccess(false)
      }, 2000)
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>อัปโหลดสลิปการโอนเงิน</CardTitle>
        <CardDescription>อัปโหลดสลิป ATM หรือแอปธนาคารเพื่อยืนยันการชำระเงิน</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="text-sm font-medium block mb-2">รูปสลิป</label>
          <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="slip-file"
            />
            <label htmlFor="slip-file" className="cursor-pointer">
              {preview ? (
                <div className="space-y-2">
                  <img 
                    src={preview} 
                    alt="Slip preview" 
                    className="max-h-48 mx-auto rounded"
                  />
                  <p className="text-sm text-muted-foreground">{file?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="font-medium">คลิกเพื่ออัปโหลด</p>
                  <p className="text-xs text-muted-foreground">หรือลากไฟล์มาวาง (JPG, PNG)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">วันที่โอน</label>
            <Input
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({...formData, transferDate: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">จำนวนเงิน (บาท)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">ธนาคารต้นทาง</label>
            <Select value={formData.senderBank} onValueChange={(value) => setFormData({...formData, senderBank: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกธนาคาร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kbank">กสิกรไทย</SelectItem>
                <SelectItem value="bbl">ธนาคารบาท</SelectItem>
                <SelectItem value="scb">ไทยพาณิชย์</SelectItem>
                <SelectItem value="kmt">กรุงไทย</SelectItem>
                <SelectItem value="ttb">ทหารไทย</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">ธนาคารปลายทาง</label>
            <Select value={formData.receiverBank} onValueChange={(value) => setFormData({...formData, receiverBank: value})}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกธนาคาร" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kbank">กสิกรไทย</SelectItem>
                <SelectItem value="bbl">ธนาคารบาท</SelectItem>
                <SelectItem value="scb">ไทยพาณิชย์</SelectItem>
                <SelectItem value="kmt">กรุงไทย</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium block mb-2">บิลที่เกี่ยวข้อง (ถ้ามี)</label>
            <Input
              placeholder="เช่น BL001, BL002"
              value={formData.billId}
              onChange={(e) => setFormData({...formData, billId: e.target.value})}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex gap-2">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        {success ? (
          <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
            <Check className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-success font-medium">ตรวจสอบสลิปสำเร็จ</p>
            <p className="text-sm text-muted-foreground mt-1">กำลังบันทึกข้อมูล...</p>
          </div>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={!file || !formData.amount || processing}
            className="w-full gap-2"
          >
            {processing ? (
              <>
                <span className="animate-spin">⏳</span>
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                ยืนยันการอัปโหลด
              </>
            )}
          </Button>
        )}

        {/* Tips */}
        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p className="font-medium">เคล็ดลับ:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>อัปโหลดรูปสลิปที่ชัดเจนและมีความสำคัญ</li>
            <li>สลิปต้องแสดงจำนวนเงิน วันที่ และบัญชีผู้รับ</li>
            <li>เรามีระบบตรวจสอบอัตโนมัติด้วย OCR</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
