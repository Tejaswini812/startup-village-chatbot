/**
 * Two editable .xlsx files under backend/data/ (open in Excel anytime):
 * - home_page_booking_users.xlsx  — home page /book-signup users
 * - become_host_signup_login.xlsx — Become a host portal (signup + login log)
 */
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join(__dirname, '../data')
const BOOKING_FILE = path.join(DATA_DIR, 'home_page_booking_users.xlsx')
const HOST_FILE = path.join(DATA_DIR, 'become_host_signup_login.xlsx')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readSheet(filePath, sheetName, headers) {
  ensureDataDir()
  if (!fs.existsSync(filePath)) {
    return { workbook: null, rows: [headers], sheetName }
  }
  const workbook = XLSX.readFile(filePath)
  const sn = workbook.SheetNames.includes(sheetName) ? sheetName : workbook.SheetNames[0]
  const sheet = workbook.Sheets[sn]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  if (!rows.length || !rows[0].length) {
    return { workbook, rows: [headers], sheetName: sn }
  }
  return { workbook, rows, sheetName: sn }
}

function writeSheet(filePath, sheetName, rows) {
  ensureDataDir()
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filePath)
}

// --- Home page booking users ---
const BOOKING_HEADERS = ['Name', 'Email', 'Phone', 'PasswordHash', 'CreatedAt', 'LastLoginAt']

function findEmailRow(rows, email, emailCol = 1) {
  const target = (email || '').toString().trim().toLowerCase()
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const cell = (row[emailCol] != null ? String(row[emailCol]) : '').trim().toLowerCase()
    if (cell === target) return i
  }
  return -1
}

function appendBookingSignup({ name, email, phone, passwordHash }) {
  const { rows, sheetName } = readSheet(BOOKING_FILE, 'Users', BOOKING_HEADERS)
  if (findEmailRow(rows, email) >= 0) {
    const err = new Error('EMAIL_EXISTS')
    err.code = 'EMAIL_EXISTS'
    throw err
  }
  const now = new Date().toISOString()
  rows.push([name, email, phone, passwordHash, now, ''])
  writeSheet(BOOKING_FILE, sheetName || 'Users', rows)
}

function updateBookingLastLogin(email) {
  const { rows, sheetName } = readSheet(BOOKING_FILE, 'Users', BOOKING_HEADERS)
  const idx = findEmailRow(rows, email)
  if (idx < 0) return false
  const now = new Date().toISOString()
  const row = rows[idx]
  while (row.length < 6) row.push('')
  row[5] = now
  rows[idx] = row
  writeSheet(BOOKING_FILE, sheetName || 'Users', rows)
  return true
}

function getBookingUserByEmail(email) {
  const { rows } = readSheet(BOOKING_FILE, 'Users', BOOKING_HEADERS)
  const idx = findEmailRow(rows, email)
  if (idx < 0) return null
  const r = rows[idx]
  return {
    name: r[0],
    email: r[1],
    phone: r[2],
    passwordHash: r[3],
    createdAt: r[4],
    lastLoginAt: r[5]
  }
}

// --- Become a host portal ---
const HOST_SIGNUP_HEADERS = ['Name', 'Email', 'Phone', 'PasswordHash', 'CreatedAt', 'Source']
const HOST_LOGIN_HEADERS = ['Timestamp', 'Email', 'Name', 'Phone', 'Role', 'Note']

function readHostWorkbook() {
  let signups = [HOST_SIGNUP_HEADERS]
  let logins = [HOST_LOGIN_HEADERS]
  if (fs.existsSync(HOST_FILE)) {
    const wb = XLSX.readFile(HOST_FILE)
    if (wb.SheetNames.includes('Signups')) {
      signups = XLSX.utils.sheet_to_json(wb.Sheets.Signups, { header: 1, defval: '' })
      if (!signups.length) signups = [HOST_SIGNUP_HEADERS]
    }
    if (wb.SheetNames.includes('Logins')) {
      logins = XLSX.utils.sheet_to_json(wb.Sheets.Logins, { header: 1, defval: '' })
      if (!logins.length) logins = [HOST_LOGIN_HEADERS]
    }
  }
  return { signups, logins }
}

function writeHostWorkbook(signups, logins) {
  ensureDataDir()
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(signups), 'Signups')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(logins), 'Logins')
  XLSX.writeFile(wb, HOST_FILE)
}

function appendHostSignupRow({ name, email, phone, passwordHash }) {
  const { signups, logins } = readHostWorkbook()
  signups.push([name, email, phone, passwordHash, new Date().toISOString(), 'MongoDB+Portal'])
  writeHostWorkbook(signups, logins)
}

function appendHostLoginRow({ email, name, phone, role, note }) {
  const { signups, logins } = readHostWorkbook()
  logins.push([new Date().toISOString(), email, name || '', phone || '', role || 'host', note || 'login'])
  writeHostWorkbook(signups, logins)
}

/** Create empty workbooks with header rows so files exist under backend/data/ (editable in Excel). */
function ensurePortalExcelFilesExist() {
  ensureDataDir()
  if (!fs.existsSync(BOOKING_FILE)) {
    writeSheet(BOOKING_FILE, 'Users', [BOOKING_HEADERS])
  }
  if (!fs.existsSync(HOST_FILE)) {
    writeHostWorkbook([HOST_SIGNUP_HEADERS], [HOST_LOGIN_HEADERS])
  }
}

module.exports = {
  BOOKING_FILE,
  HOST_FILE,
  ensurePortalExcelFilesExist,
  appendBookingSignup,
  updateBookingLastLogin,
  getBookingUserByEmail,
  appendHostSignupRow,
  appendHostLoginRow
}
