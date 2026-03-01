/**
 * Brute-Force Protection — Account lockout after repeated failed login attempts
 * 
 * Tracks failed attempts per IP and per email. Locks out after threshold.
 * Auto-unlocks after cooldown period.
 */

interface LockoutEntry {
  attempts: number
  lastAttempt: number
  lockedUntil: number | null
}

const ipAttempts = new Map<string, LockoutEntry>()
const emailAttempts = new Map<string, LockoutEntry>()

// Configuration
const MAX_ATTEMPTS_PER_IP = 20       // 20 failed attempts from same IP
const MAX_ATTEMPTS_PER_EMAIL = 5     // 5 failed attempts on same email
const LOCKOUT_DURATION = 15 * 60_000 // 15 minutes lockout
const ATTEMPT_WINDOW = 30 * 60_000   // 30 minute sliding window
const PROGRESSIVE_DELAYS = [0, 0, 0, 1000, 2000, 5000] // Progressive delay after 3rd attempt (ms)

function cleanup(map: Map<string, LockoutEntry>) {
  const now = Date.now()
  const keys: string[] = []
  map.forEach((entry, key) => {
    if (now - entry.lastAttempt > ATTEMPT_WINDOW && (!entry.lockedUntil || now > entry.lockedUntil)) {
      keys.push(key)
    }
  })
  keys.forEach(key => map.delete(key))
}

function getEntry(map: Map<string, LockoutEntry>, key: string): LockoutEntry {
  const existing = map.get(key)
  const now = Date.now()

  if (!existing) {
    const entry: LockoutEntry = { attempts: 0, lastAttempt: now, lockedUntil: null }
    map.set(key, entry)
    return entry
  }

  // Reset if window has expired and not locked
  if (now - existing.lastAttempt > ATTEMPT_WINDOW && (!existing.lockedUntil || now > existing.lockedUntil)) {
    existing.attempts = 0
    existing.lockedUntil = null
  }

  // Unlock if lockout has expired
  if (existing.lockedUntil && now > existing.lockedUntil) {
    existing.lockedUntil = null
    existing.attempts = 0
  }

  return existing
}

export interface BruteForceCheck {
  allowed: boolean
  /** Seconds until lockout expires (0 if not locked) */
  retryAfter: number
  /** Remaining attempts before lockout */
  attemptsRemaining: number
  /** Artificial delay in ms to slow down attackers */
  delay: number
}

/**
 * Check if a login attempt is allowed
 */
export function checkBruteForce(ip: string, email: string): BruteForceCheck {
  cleanup(ipAttempts)
  cleanup(emailAttempts)

  const now = Date.now()
  const ipEntry = getEntry(ipAttempts, ip)
  const emailEntry = getEntry(emailAttempts, email.toLowerCase())

  // Check IP lockout
  if (ipEntry.lockedUntil && now < ipEntry.lockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((ipEntry.lockedUntil - now) / 1000),
      attemptsRemaining: 0,
      delay: 0,
    }
  }

  // Check email lockout
  if (emailEntry.lockedUntil && now < emailEntry.lockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((emailEntry.lockedUntil - now) / 1000),
      attemptsRemaining: 0,
      delay: 0,
    }
  }

  const emailRemaining = MAX_ATTEMPTS_PER_EMAIL - emailEntry.attempts
  const ipRemaining = MAX_ATTEMPTS_PER_IP - ipEntry.attempts
  const attemptsRemaining = Math.min(emailRemaining, ipRemaining)

  // Progressive delay based on email attempts
  const delayIndex = Math.min(emailEntry.attempts, PROGRESSIVE_DELAYS.length - 1)
  const delay = PROGRESSIVE_DELAYS[delayIndex]

  return {
    allowed: true,
    retryAfter: 0,
    attemptsRemaining: Math.max(0, attemptsRemaining),
    delay,
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(ip: string, email: string): void {
  const now = Date.now()

  const ipEntry = getEntry(ipAttempts, ip)
  ipEntry.attempts += 1
  ipEntry.lastAttempt = now
  if (ipEntry.attempts >= MAX_ATTEMPTS_PER_IP) {
    ipEntry.lockedUntil = now + LOCKOUT_DURATION
  }

  const emailEntry = getEntry(emailAttempts, email.toLowerCase())
  emailEntry.attempts += 1
  emailEntry.lastAttempt = now
  if (emailEntry.attempts >= MAX_ATTEMPTS_PER_EMAIL) {
    emailEntry.lockedUntil = now + LOCKOUT_DURATION
  }
}

/**
 * Record a successful login — resets attempt counters
 */
export function recordSuccessfulLogin(ip: string, email: string): void {
  ipAttempts.delete(ip)
  emailAttempts.delete(email.toLowerCase())
}

/**
 * Get lockout status for an email (used by UI to show remaining attempts)
 */
export function getLockoutStatus(email: string): { locked: boolean; retryAfter: number; attempts: number } {
  const entry = emailAttempts.get(email.toLowerCase())
  if (!entry) return { locked: false, retryAfter: 0, attempts: 0 }

  const now = Date.now()
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      locked: true,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
      attempts: entry.attempts,
    }
  }

  return { locked: false, retryAfter: 0, attempts: entry.attempts }
}
