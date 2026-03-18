'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save, Lock, Bell, Palette, Send, Copy, Check } from 'lucide-react'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  const [dormName, setDormName] = useState('หอพัก DormFlow')
  const [dormAddress, setDormAddress] = useState('123 ซ.พหลโยธิน กรุงเทพฯ')
  const [adminEmail, setAdminEmail] = useState('admin@dormflow.com')
  const [adminPhone, setAdminPhone] = useState('081-234-5678')
  const [currency, setCurrency] = useState('THB')
  const [taxRate, setTaxRate] = useState('7')
  const [bankName, setBankName] = useState('ธนาคารกสิกรไทย')
  const [bankAccount, setBankAccount] = useState('123-456-789')
  const [bankAccountName, setBankAccountName] = useState('DormFlow Co., Ltd.')

  const [notifyPayment, setNotifyPayment] = useState(true)
  const [notifyMaintenance, setNotifyMaintenance] = useState(true)
  const [notifyOverdue, setNotifyOverdue] = useState(true)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [isTelegramConnected, setIsTelegramConnected] = useState(false)
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleSaveGeneral = () => {
    if (!dormName || !dormAddress || !adminEmail || !adminPhone) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }
    toast.success('บันทึกการตั้งค่าทั่วไปสำเร็จ')
  }

  const handleSaveFinancial = () => {
    if (!bankName || !bankAccount || !bankAccountName) {
      toast.error('กรุณากรอกข้อมูลธนาคารให้ครบถ้วน')
      return
    }
    toast.success('บันทึกการตั้งค่าการเงินสำเร็จ')
  }

  const handleSaveNotifications = () => {
    toast.success('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ')
  }

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('กรุณากรอกรหัสผ่านให้ครบถ้วน')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }
    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }
    toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      toast.error('กรุณากรอก Bot Token และ Chat ID')
      return
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'กำลังส่งข้อความทดสอบ...',
        success: 'ส่งข้อความทดสอบสำเร็จ ตรวจสอบ Telegram',
        error: 'เกิดข้อผิดพลาดในการส่งข้อความ',
      }
    )
  }

  const handleSaveTelegram = () => {
    if (telegramBotToken && telegramChatId) {
      setIsTelegramConnected(true)
      toast.success('บันทึกการตั้งค่า Telegram สำเร็จ')
    } else if (!telegramBotToken && !telegramChatId) {
      setIsTelegramConnected(false)
      setTelegramEnabled(false)
      toast.success('ยกเลิกการเชื่อมต่อ Telegram')
    } else {
      toast.error('กรุณากรอก Bot Token และ Chat ID ให้ครบถ้วน')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(telegramBotToken || 'https://t.me/BotFather')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-2">จัดการการตั้งค่าและกำหนดค่าของระบบ</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="general">ทั่วไป</TabsTrigger>
          <TabsTrigger value="financial">การเงิน</TabsTrigger>
          <TabsTrigger value="notifications">แจ้งเตือน</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทั่วไป</CardTitle>
              <CardDescription>จัดการข้อมูลหอพักและข้อมูลผู้ดูแล</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อหอพัก</label>
                  <Input
                    placeholder="ชื่อหอพัก"
                    value={dormName}
                    onChange={(e) => setDormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ที่อยู่</label>
                  <Input
                    placeholder="ที่อยู่"
                    value={dormAddress}
                    onChange={(e) => setDormAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">อีเมลผู้ดูแล</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">เบอร์โทรศัพท์</label>
                  <Input
                    placeholder="081-234-5678"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">สกุลเงิน</label>
                  <select className="w-full px-3 py-2 rounded-md border border-input bg-background">
                    <option value="THB">บาทไทย (THB)</option>
                    <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">อัตราภาษี (%)</label>
                  <Input
                    type="number"
                    placeholder="7"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveGeneral} className="gap-2">
                <Save className="w-4 h-4" />
                บันทึกการตั้งค่า
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการเงิน</CardTitle>
              <CardDescription>จัดการข้อมูลธนาคารและการชำระเงิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อธนาคาร</label>
                  <Input
                    placeholder="ชื่อธนาคาร"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">หมายเลขบัญชีธนาคาร</label>
                  <Input
                    placeholder="123-456-789"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อเจ้าของบัญชี</label>
                  <Input
                    placeholder="ชื่อเจ้าของบัญชี"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveFinancial} className="gap-2">
                <Save className="w-4 h-4" />
                บันทึกข้อมูลการเงิน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>การแจ้งเตือน</CardTitle>
              <CardDescription>กำหนดการแจ้งเตือนต่างๆ ของระบบ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">แจ้งเตือนการชำระเงิน</p>
                      <p className="text-sm text-muted-foreground">ส่งอีเมลแจ้งเตือนเมื่อมีการชำระเงิน</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyPayment}
                    onChange={(e) => setNotifyPayment(e.target.checked)}
                    className="w-5 h-5 rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">แจ้งเตือนการซ่อมแซม</p>
                      <p className="text-sm text-muted-foreground">ส่งแจ้งเตือนเมื่อมีการแจ้งซ่อม</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyMaintenance}
                    onChange={(e) => setNotifyMaintenance(e.target.checked)}
                    className="w-5 h-5 rounded border-input"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium">แจ้งเตือนเงินค้างชำระ</p>
                      <p className="text-sm text-muted-foreground">ส่งอีเมลแจ้งเตือนเมื่อมีเงินค้างชำระ</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOverdue}
                    onChange={(e) => setNotifyOverdue(e.target.checked)}
                    className="w-5 h-5 rounded border-input"
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications} className="gap-2">
                <Save className="w-4 h-4" />
                บันทึกการตั้งค่าการแจ้งเตือน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Settings */}
        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                ตั้งค่า Telegram Bot
              </CardTitle>
              <CardDescription>เชื่อมต่อ Telegram Bot สำหรับการแจ้งเตือน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-info/5 border border-info/30 rounded-lg p-4 space-y-3">
                <p className="font-medium text-sm">วิธีการตั้งค่า Telegram Bot</p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
                  <li>ไปที่ <span className="font-mono bg-muted px-1">@BotFather</span> บน Telegram</li>
                  <li>พิมพ์ <span className="font-mono bg-muted px-1">/newbot</span> เพื่อสร้าง Bot ใหม่</li>
                  <li>คัดลอก Bot Token และนำมาวางตรงนี้</li>
                  <li>ส่งข้อความแรกไปยัง Bot ของคุณ</li>
                  <li>เปิด <span className="font-mono bg-muted px-1">https://api.telegram.org/botTOKEN/getUpdates</span> เพื่อหา Chat ID</li>
                </ol>
              </div>

              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="telegramBotToken">Bot Token</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="telegramBotToken"
                      type="password"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      title={isCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    >
                      {isCopied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="telegramChatId">Chat ID</FieldLabel>
                  <Input
                    id="telegramChatId"
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="123456789"
                  />
                </Field>

                {isTelegramConnected && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
                    <Check className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium text-sm text-success">เชื่อมต่อสำเร็จ</p>
                      <p className="text-xs text-muted-foreground">ระบบจะส่งการแจ้งเตือนผ่าน Telegram</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleTestTelegram}
                    disabled={!telegramBotToken || !telegramChatId}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    ส่งทดสอบ
                  </Button>
                  <Button onClick={handleSaveTelegram} className="gap-2">
                    <Save className="h-4 w-4" />
                    บันทึก
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>ความปลอดภัย</CardTitle>
              <CardDescription>จัดการรหัสผ่านและความปลอดภัย</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">รหัสผ่านเดิม</label>
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่านเดิม"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">รหัสผ่านใหม่</label>
                  <Input
                    type="password"
                    placeholder="กรอกรหัสผ่านใหม่"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ยืนยันรหัสผ่านใหม่</label>
                  <Input
                    type="password"
                    placeholder="ยืนยันรหัสผ่าน"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleChangePassword} className="gap-2">
                <Lock className="w-4 h-4" />
                เปลี่ยนรหัสผ่าน
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
