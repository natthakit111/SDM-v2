'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoEvidence {
  id: string
  readingId: string
  meterType: 'electricity' | 'water'
  imageUrl: string
  uploadedAt: string
  fileName: string
}

interface PhotoEvidenceUploadProps {
  readingId: string
  onPhotoAdded?: (photo: PhotoEvidence) => void
  photos?: PhotoEvidence[]
  onPhotoDeleted?: (photoId: string) => void
}

export function PhotoEvidenceUpload({
  readingId,
  onPhotoAdded,
  photos = [],
  onPhotoDeleted,
}: PhotoEvidenceUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<'electricity' | 'water'>('electricity')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('กรุณาเลือกรูปภาพ')
      return
    }

    const newPhoto: PhotoEvidence = {
      id: `photo_${Date.now()}`,
      readingId,
      meterType: selectedType,
      imageUrl: preview,
      uploadedAt: new Date().toISOString(),
      fileName: selectedFile.name,
    }

    onPhotoAdded?.(newPhoto)
    toast.success('อัปโหลดรูปภาพเรียบร้อย')

    setSelectedFile(null)
    setPreview('')
    setIsOpen(false)
  }

  const handleDelete = (photoId: string) => {
    onPhotoDeleted?.(photoId)
    toast.success('ลบรูปภาพเรียบร้อย')
  }

  const electricityPhotos = photos.filter(p => p.meterType === 'electricity')
  const waterPhotos = photos.filter(p => p.meterType === 'water')

  return (
    <div className="space-y-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Camera className="h-4 w-4" />
            อัปโหลดรูปมิเตอร์
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>อัปโหลดรูปมิเตอร์</DialogTitle>
            <DialogDescription>อัปโหลดรูปภาพเป็นหลักฐานอ้างอิงของมิเตอร์</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ประเภทมิเตอร์</label>
              <div className="flex gap-2">
                {(['electricity', 'water'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'electricity' ? 'ไฟฟ้า' : 'น้ำประปา'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">เลือกรูปภาพ</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {preview && (
              <div className="space-y-2">
                <label className="text-sm font-medium block">ตัวอย่าง</label>
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile}>
                <Camera className="mr-2 h-4 w-4" />
                อัปโหลด
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {photos.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-yellow-500" />
              รูปมิเตอร์ไฟฟ้า ({electricityPhotos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {electricityPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <CardContent className="p-0 aspect-square relative group">
                    <img
                      src={photo.imageUrl}
                      alt={`${photo.meterType} photo`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:text-destructive"
                        onClick={() => handleDelete(photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                      {new Date(photo.uploadedAt).toLocaleDateString('th-TH')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              รูปมิเตอร์น้ำ ({waterPhotos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {waterPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                  <CardContent className="p-0 aspect-square relative group">
                    <img
                      src={photo.imageUrl}
                      alt={`${photo.meterType} photo`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:text-destructive"
                        onClick={() => handleDelete(photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                      {new Date(photo.uploadedAt).toLocaleDateString('th-TH')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
