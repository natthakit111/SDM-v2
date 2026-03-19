/**
 * frondend/lib/api/index.js
 * Central export — import ทุกอย่างจากที่เดียว
 *
 * Usage ใน Client Component:
 *   'use client'
 *   import { billAPI, roomAPI } from '@/lib/api'
 */

export { authAPI }         from './auth.api';
export { roomAPI }         from './room.api';
export { tenantAPI }       from './tenant.api';
export { contractAPI }     from './contract.api';
export { meterAPI }        from './meter.api';
export { billAPI }         from './bill.api';
export { utilityRateAPI }  from './utilityRate.api';
export { paymentAPI }      from './payment.api';
export { maintenanceAPI }  from './maintenance.api';
export { announcementAPI } from './announcement.api';
export { telegramAPI }     from './telegram.api';
export { reportAPI }       from './report.api';
