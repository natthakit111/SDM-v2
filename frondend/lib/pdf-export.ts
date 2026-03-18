/**
 * PDF Export Utility for DormFlow
 * Generates PDF documents for bills, receipts, and contracts
 */

export interface BillExportData {
  billId: string
  tenantName: string
  room: string
  month: string
  year: string
  items: {
    description: string
    amount: number
    unit?: string
    rate?: number
  }[]
  totalAmount: number
  dueDate: string
  notes?: string
}

export interface ReceiptExportData {
  receiptNumber: string
  tenantName: string
  room: string
  paymentDate: string
  paymentMethod: string
  amount: number
  billId: string
  notes?: string
}

export interface ContractExportData {
  contractId: string
  tenantName: string
  tenantId: string
  room: string
  startDate: string
  endDate: string
  duration: number
  rentAmount: number
  deposit: number
  terms?: string[]
}

/**
 * Generate a simple PDF for a bill
 * Note: This is a mock implementation. In production, use a library like pdfkit or html2pdf
 */
export function generateBillPDF(data: BillExportData): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>บิลค่าห้อง</h1>
          <p>DormFlow - ระบบจัดการหอพัก</p>
        </div>

        <div class="section">
          <div class="section-title">รายละเอียดบิล</div>
          <div class="info-row">
            <span>เลขที่บิล:</span>
            <span>${data.billId}</span>
          </div>
          <div class="info-row">
            <span>ชื่อผู้เช่า:</span>
            <span>${data.tenantName}</span>
          </div>
          <div class="info-row">
            <span>ห้อง:</span>
            <span>${data.room}</span>
          </div>
          <div class="info-row">
            <span>งวด:</span>
            <span>${data.month}/${data.year}</span>
          </div>
          <div class="info-row">
            <span>กำหนดชำระ:</span>
            <span>${data.dueDate}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">รายการ</div>
          <table>
            <tr>
              <th>รายการ</th>
              <th>หน่วย</th>
              <th>ราคาต่อหน่วย</th>
              <th>จำนวนเงิน</th>
            </tr>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.unit || '-'}</td>
                <td>${item.rate ? item.rate.toLocaleString('th-TH') : '-'}</td>
                <td>${item.amount.toLocaleString('th-TH')} บาท</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">รวมทั้งสิ้น</td>
              <td>${data.totalAmount.toLocaleString('th-TH')} บาท</td>
            </tr>
          </table>
        </div>

        ${data.notes ? `
          <div class="section">
            <div class="section-title">หมายเหตุ</div>
            <p>${data.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>เอกสารนี้ออกให้โดยระบบจัดการหอพัก DormFlow</p>
          <p>ออกเมื่อ ${new Date().toLocaleDateString('th-TH')}</p>
        </div>
      </body>
    </html>
  `

  // Open print dialog with the HTML content
  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    // Trigger print dialog
    setTimeout(() => printWindow.print(), 250)
  }
}

/**
 * Generate a receipt PDF
 */
export function generateReceiptPDF(data: ReceiptExportData): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; max-width: 600px; margin-left: auto; margin-right: auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; }
          .section { margin-bottom: 20px; }
          .label { color: #666; font-size: 12px; margin-bottom: 2px; }
          .value { font-weight: bold; margin-bottom: 15px; }
          .amount-section { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .amount-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .amount-row.total { font-size: 18px; font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ใบเสร็จการชำระเงิน</h1>
          <p>DormFlow - ระบบจัดการหอพัก</p>
        </div>

        <div class="section">
          <div class="label">เลขที่ใบเสร็จ</div>
          <div class="value">${data.receiptNumber}</div>
          
          <div class="label">วันที่ชำระ</div>
          <div class="value">${new Date(data.paymentDate).toLocaleDateString('th-TH', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>

        <div class="section">
          <div class="label">ชื่อผู้เช่า</div>
          <div class="value">${data.tenantName}</div>
          
          <div class="label">ห้อง</div>
          <div class="value">${data.room}</div>
          
          <div class="label">บิล</div>
          <div class="value">${data.billId}</div>
        </div>

        <div class="amount-section">
          <div class="amount-row">
            <span>วิธีการชำระ</span>
            <span>${data.paymentMethod}</span>
          </div>
          <div class="amount-row total">
            <span>จำนวนเงิน</span>
            <span>${data.amount.toLocaleString('th-TH')} บาท</span>
          </div>
        </div>

        ${data.notes ? `
          <div class="section">
            <div class="label">หมายเหตุ</div>
            <div>${data.notes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <p>ขอบคุณที่ชำระเงินของคุณ</p>
          <p>เอกสารนี้ออกให้โดยระบบจัดการหอพัก DormFlow</p>
          <p>ออกเมื่อ ${new Date().toLocaleDateString('th-TH')}</p>
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }
}

/**
 * Generate a contract PDF
 */
export function generateContractPDF(data: ContractExportData): void {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 20px; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666; }
          .signature-section { display: flex; justify-content: space-around; margin-top: 40px; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin: 30px 0 5px 0; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>สัญญาเช่าห้องพัก</h1>
          <p>DormFlow - ระบบจัดการหอพัก</p>
        </div>

        <div class="section">
          <div class="section-title">รายละเอียดสัญญา</div>
          <div class="info-row">
            <span>เลขที่สัญญา:</span>
            <span>${data.contractId}</span>
          </div>
          <div class="info-row">
            <span>ชื่อผู้เช่า:</span>
            <span>${data.tenantName}</span>
          </div>
          <div class="info-row">
            <span>เลขประจำตัวประชาชน:</span>
            <span>${data.tenantId}</span>
          </div>
          <div class="info-row">
            <span>เลขห้อง:</span>
            <span>${data.room}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">ระยะเวลาและค่าเช่า</div>
          <div class="info-row">
            <span>วันเริ่มต้นสัญญา:</span>
            <span>${new Date(data.startDate).toLocaleDateString('th-TH')}</span>
          </div>
          <div class="info-row">
            <span>วันสิ้นสุดสัญญา:</span>
            <span>${new Date(data.endDate).toLocaleDateString('th-TH')}</span>
          </div>
          <div class="info-row">
            <span>ระยะเวลา:</span>
            <span>${data.duration} เดือน</span>
          </div>
          <div class="info-row">
            <span>ค่าเช่ารายเดือน:</span>
            <span>${data.rentAmount.toLocaleString('th-TH')} บาท</span>
          </div>
          <div class="info-row">
            <span>เงินประกัน:</span>
            <span>${data.deposit.toLocaleString('th-TH')} บาท</span>
          </div>
        </div>

        ${data.terms && data.terms.length > 0 ? `
          <div class="section">
            <div class="section-title">เงื่อนไขและข้อตกลง</div>
            <ul>
              ${data.terms.map(term => `<li>${term}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature-box">
            <p>ผู้เช่า</p>
            <div class="signature-line"></div>
            <p>${data.tenantName}</p>
          </div>
          <div class="signature-box">
            <p>เจ้าของห้องพัก</p>
            <div class="signature-line"></div>
            <p>DormFlow</p>
          </div>
        </div>

        <div class="footer">
          <p>สัญญานี้ถูกสร้างโดยระบบจัดการหอพัก DormFlow</p>
          <p>ออกเมื่อ ${new Date().toLocaleDateString('th-TH')}</p>
        </div>
      </body>
    </html>
  `

  const printWindow = window.open('', '', 'height=600,width=800')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }
}
