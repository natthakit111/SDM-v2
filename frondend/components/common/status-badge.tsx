import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'destructive' | 'default' | 'secondary' | 'outline'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

// Room status
export function RoomStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    available: { label: 'ว่าง', variant: 'success' },
    occupied: { label: 'มีผู้เช่า', variant: 'default' },
    maintenance: { label: 'ซ่อมบำรุง', variant: 'warning' },
    reserved: { label: 'จอง', variant: 'secondary' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Bill status
export function BillStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'รอชำระ', variant: 'warning' },
    paid: { label: 'ชำระแล้ว', variant: 'success' },
    overdue: { label: 'เกินกำหนด', variant: 'destructive' },
    partial: { label: 'ชำระบางส่วน', variant: 'secondary' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Payment status
export function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'รอตรวจสอบ', variant: 'warning' },
    verified: { label: 'ตรวจสอบแล้ว', variant: 'success' },
    rejected: { label: 'ปฏิเสธ', variant: 'destructive' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Maintenance status
export function MaintenanceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    pending: { label: 'รอดำเนินการ', variant: 'warning' },
    in_progress: { label: 'กำลังดำเนินการ', variant: 'default' },
    completed: { label: 'เสร็จสิ้น', variant: 'success' },
    cancelled: { label: 'ยกเลิก', variant: 'destructive' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Priority badge
export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    low: { label: 'ต่ำ', variant: 'secondary' },
    medium: { label: 'ปานกลาง', variant: 'default' },
    high: { label: 'สูง', variant: 'warning' },
    urgent: { label: 'เร่งด่วน', variant: 'destructive' },
  }
  
  const { label, variant } = config[priority] || { label: priority, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Contract status
export function ContractStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    active: { label: 'ใช้งาน', variant: 'success' },
    expired: { label: 'หมดอายุ', variant: 'destructive' },
    terminated: { label: 'ยกเลิก', variant: 'secondary' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Tenant status
export function TenantStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    active: { label: 'กำลังเช่า', variant: 'success' },
    pending: { label: 'รอเข้าพัก', variant: 'warning' },
    moved_out: { label: 'ย้ายออก', variant: 'secondary' },
  }
  
  const { label, variant } = config[status] || { label: status, variant: 'default' }
  
  return <StatusBadge status={label} variant={variant} />
}

// Base status badge component
export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, string> = {
    success: 'bg-success/20 text-success hover:bg-success/30 border-success/30',
    warning: 'bg-warning/20 text-warning-foreground hover:bg-warning/30 border-warning/30',
    destructive: 'bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/30',
    default: 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/30',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent',
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {status}
    </Badge>
  )
}

export default StatusBadge
