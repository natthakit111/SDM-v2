/**
 * controllers/reportController.js
 *
 * Use Case: "ส่งออกข้อมูลรายงาน (PDF / Excel)"
 *
 * Routes:
 *   GET /api/reports/revenue?year=&format=excel|pdf  — monthly revenue report
 *   GET /api/reports/rooms?format=excel              — room occupancy report
 *   GET /api/reports/payments?month=&year=&format=   — payment summary
 */

const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const BillModel  = require('../models/bill.model')
const { pool }   = require('../config/db')
const { thaiMonthYear, thaiDate } = require('../utils/dateHelper')

const THAI_MONTHS = ['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const fmt = (n) => Number(n || 0).toFixed(2)

// ── Revenue Report ────────────────────────────────────────────
const getRevenueReport = async (req, res, next) => {
  try {
    const year   = parseInt(req.query.year)   || new Date().getFullYear()
    const format = (req.query.format || 'excel').toLowerCase()
    const data   = await BillModel.getMonthlyRevenue(year)

    if (format === 'excel') {
      const wb = new ExcelJS.Workbook()
      wb.creator = 'Smart Dormitory'
      const ws = wb.addWorksheet(`รายรับ ${year + 543}`)

      // Title
      ws.mergeCells('A1:G1')
      ws.getCell('A1').value = `รายงานรายรับประจำปี ${year + 543}`
      ws.getCell('A1').font  = { bold: true, size: 14 }
      ws.getCell('A1').alignment = { horizontal: 'center' }

      // Headers
      ws.addRow([])
      const headerRow = ws.addRow(['เดือน','บิลทั้งหมด','ชำระแล้ว','ค่าเช่า','ค่าไฟ','ค่าน้ำ','รวม (฿)'])
      headerRow.font = { bold: true }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a2e' } }
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }

      ws.columns = [
        { key: 'month', width: 14 },
        { key: 'bills', width: 12 },
        { key: 'paid',  width: 12 },
        { key: 'rent',  width: 14 },
        { key: 'elec',  width: 14 },
        { key: 'water', width: 14 },
        { key: 'total', width: 16 },
      ]

      let grandTotal = 0
      data.forEach(d => {
        const total = parseFloat(d.total_billed || 0)
        grandTotal += total
        ws.addRow([
          THAI_MONTHS[d.bill_month],
          d.bill_count,
          d.paid_count,
          fmt(d.total_rent),
          fmt(d.total_electric),
          fmt(d.total_water),
          fmt(total),
        ])
      })

      // Grand total row
      const totalRow = ws.addRow(['รวมทั้งปี', '', '', '', '', '', fmt(grandTotal)])
      totalRow.font = { bold: true }
      totalRow.getCell(7).numFmt = '#,##0.00'

      ws.eachRow(row => {
        row.eachCell(cell => {
          cell.border = { top: {style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} }
          cell.alignment = { vertical: 'middle' }
        })
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename=revenue_${year}.xlsx`)
      await wb.xlsx.write(res)
      return res.end()
    }

    // PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=revenue_${year}.pdf`)
    doc.pipe(res)

    doc.fontSize(18).text(`รายงานรายรับประจำปี ${year + 543}`, { align: 'center' })
    doc.fontSize(10).text(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, { align: 'center' })
    doc.moveDown(1.5)

    // Simple table
    const cols = [80, 70, 70, 90, 90, 90, 100]
    const headers = ['เดือน','บิลทั้งหมด','ชำระแล้ว','ค่าเช่า','ค่าไฟ','ค่าน้ำ','รวม (฿)']
    let x = 50, y = doc.y

    // Header row
    doc.rect(x, y, cols.reduce((a,b)=>a+b,0), 20).fill('#1a1a2e')
    doc.fillColor('white').fontSize(9)
    let cx = x
    headers.forEach((h, i) => { doc.text(h, cx + 3, y + 5, { width: cols[i]-6 }); cx += cols[i] })
    doc.fillColor('black')
    y += 20

    let grand = 0
    data.forEach((d, idx) => {
      const total = parseFloat(d.total_billed || 0)
      grand += total
      if (idx % 2 === 0) doc.rect(x, y, cols.reduce((a,b)=>a+b,0), 18).fill('#f8f7f4')
      doc.fillColor('#1a1a2e').fontSize(8.5)
      const row = [THAI_MONTHS[d.bill_month], d.bill_count, d.paid_count, fmt(d.total_rent), fmt(d.total_electric), fmt(d.total_water), fmt(total)]
      cx = x
      row.forEach((v, i) => { doc.text(String(v), cx + 3, y + 4, { width: cols[i]-6 }); cx += cols[i] })
      y += 18
    })

    // Total
    doc.rect(x, y, cols.reduce((a,b)=>a+b,0), 20).fill('#e8e6ff')
    doc.fillColor('#1a1a2e').fontSize(9).font('Helvetica-Bold')
    doc.text(`รวมทั้งปี: ${Number(grand).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿`, x + 3, y + 5)
    doc.end()

  } catch (err) { next(err) }
}

// ── Room Occupancy Report ─────────────────────────────────────
const getRoomsReport = async (req, res, next) => {
  try {
    const format = (req.query.format || 'excel').toLowerCase()
    const [rows] = await pool.query(`
      SELECT r.room_number, r.floor, r.room_type, r.base_rent, r.status,
             CONCAT(t.first_name,' ',t.last_name) AS tenant_name,
             t.phone AS tenant_phone,
             c.start_date, c.end_date, c.rent_amount
      FROM rooms r
      LEFT JOIN contracts c ON c.room_id = r.room_id AND c.status = 'active'
      LEFT JOIN tenants t ON c.tenant_id = t.tenant_id
      ORDER BY r.floor, r.room_number
    `)

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('ข้อมูลห้องพัก')

    ws.mergeCells('A1:J1')
    ws.getCell('A1').value = 'รายงานสถานะห้องพัก'
    ws.getCell('A1').font  = { bold: true, size: 14 }
    ws.getCell('A1').alignment = { horizontal: 'center' }
    ws.addRow([])

    const hRow = ws.addRow(['ห้อง','ชั้น','ประเภท','ค่าเช่าตั้ง','สถานะ','ผู้เช่า','เบอร์โทร','วันเริ่ม','วันสิ้นสุด','ค่าเช่าสัญญา'])
    hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a2e' } }
    ws.columns = [10,8,12,14,12,20,14,14,14,14].map(w => ({ width: w }))

    const statusMap = { available: 'ว่าง', occupied: 'มีผู้เช่า', maintenance: 'ซ่อมบำรุง' }
    rows.forEach(r => ws.addRow([
      r.room_number, r.floor, r.room_type, fmt(r.base_rent),
      statusMap[r.status] || r.status,
      r.tenant_name || '-', r.tenant_phone || '-',
      r.start_date ? new Date(r.start_date).toLocaleDateString('th-TH') : '-',
      r.end_date   ? new Date(r.end_date).toLocaleDateString('th-TH')   : '-',
      r.rent_amount ? fmt(r.rent_amount) : '-',
    ]))

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=rooms_report.xlsx')
    await wb.xlsx.write(res)
    return res.end()
  } catch (err) { next(err) }
}

// ── Payment Summary Report ────────────────────────────────────
const getPaymentsReport = async (req, res, next) => {
  try {
    const month  = parseInt(req.query.month) || new Date().getMonth() + 1
    const year   = parseInt(req.query.year)  || new Date().getFullYear()
    const format = (req.query.format || 'excel').toLowerCase()

    const [rows] = await pool.query(`
      SELECT p.payment_id, p.paid_at, p.amount_paid, p.payment_method, p.status,
             r.room_number,
             CONCAT(t.first_name,' ',t.last_name) AS tenant_name,
             b.bill_month, b.bill_year,
             u.username AS verified_by
      FROM payments p
      JOIN bills b ON p.bill_id = b.bill_id
      JOIN rooms r ON b.room_id = r.room_id
      JOIN tenants t ON p.tenant_id = t.tenant_id
      LEFT JOIN users u ON p.verified_by = u.user_id
      WHERE b.bill_month = ? AND b.bill_year = ?
      ORDER BY p.paid_at DESC
    `, [month, year])

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet(`การชำระ ${THAI_MONTHS[month]} ${year + 543}`)

    ws.mergeCells('A1:H1')
    ws.getCell('A1').value = `รายงานการชำระเงิน ${THAI_MONTHS[month]} ${year + 543}`
    ws.getCell('A1').font  = { bold: true, size: 14 }
    ws.getCell('A1').alignment = { horizontal: 'center' }
    ws.addRow([])

    const hRow = ws.addRow(['ห้อง','ผู้เช่า','จำนวน (฿)','วิธีชำระ','วันที่ชำระ','สถานะ','ตรวจสอบโดย','เบอร์บิล'])
    hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a2e' } }
    ws.columns = [10,20,14,14,16,14,16,10].map(w => ({ width: w }))

    const methodMap = { qr_promptpay: 'QR PromptPay', cash: 'เงินสด', bank_transfer: 'โอนเงิน' }
    const statusMap = { pending_verify: 'รอตรวจสอบ', verified: 'ยืนยันแล้ว', rejected: 'ปฏิเสธ' }
    let total = 0
    rows.forEach(r => {
      if (r.status === 'verified') total += parseFloat(r.amount_paid || 0)
      ws.addRow([
        r.room_number, r.tenant_name, fmt(r.amount_paid),
        methodMap[r.payment_method] || r.payment_method,
        new Date(r.paid_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' }),
        statusMap[r.status] || r.status,
        r.verified_by || '-',
        r.payment_id,
      ])
    })
    ws.addRow([])
    const tRow = ws.addRow(['','รวมที่ยืนยันแล้ว', fmt(total)])
    tRow.font = { bold: true }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=payments_${month}_${year}.xlsx`)
    await wb.xlsx.write(res)
    return res.end()
  } catch (err) { next(err) }
}

module.exports = { getRevenueReport, getRoomsReport, getPaymentsReport }
