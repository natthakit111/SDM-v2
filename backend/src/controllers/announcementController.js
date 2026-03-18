/**
 * controllers/announcementController.js
 * Supports target_floor for floor-specific announcements (13.1.4)
 */
const { validationResult } = require('express-validator')
const AnnouncementModel = require('../models/announcement.model')
const TelegramService   = require('../services/telegram.service')
const { sendSuccess, sendCreated, sendBadRequest, sendNotFound } = require('../utils/response')

const getAll = async (req, res, next) => {
  try {
    const audience = req.user.role === 'admin' ? undefined : 'tenant'
    const items = await AnnouncementModel.findAll({ target_audience: audience })
    return sendSuccess(res, items)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const item = await AnnouncementModel.findById(req.params.id)
    if (!item) return sendNotFound(res, 'Announcement not found')
    return sendSuccess(res, item)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array())

    const { title, content, target_audience, target_floor, is_pinned, expires_at } = req.body
    const id = await AnnouncementModel.create({
      title, content, target_audience, is_pinned,
      target_floor: target_floor ? parseInt(target_floor) : null,
      published_by: req.user.user_id,
      expires_at,
    })

    const item = await AnnouncementModel.findById(id)

    // Broadcast to tenants via Telegram — respects floor filter
    if (target_audience !== 'admin') {
      TelegramService.broadcastAnnouncement(
        title, content, target_audience,
        target_floor ? parseInt(target_floor) : null
      ).catch(() => {})
    }

    return sendCreated(res, item, 'Announcement published')
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const item = await AnnouncementModel.findById(req.params.id)
    if (!item) return sendNotFound(res, 'Announcement not found')
    await AnnouncementModel.update(req.params.id, req.body)
    return sendSuccess(res, await AnnouncementModel.findById(req.params.id), 'Announcement updated')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const item = await AnnouncementModel.findById(req.params.id)
    if (!item) return sendNotFound(res, 'Announcement not found')
    await AnnouncementModel.remove(req.params.id)
    return sendSuccess(res, null, 'Announcement deleted')
  } catch (err) { next(err) }
}

module.exports = { getAll, getById, create, update, remove }
