export type FeatureFlagsState = {
  aiChat: boolean
  experimentalTerminal: boolean
  experimentalUpdater: boolean
}

const DEFAULT_FLAGS: FeatureFlagsState = {
  aiChat: true,
  experimentalTerminal: false,
  experimentalUpdater: false,
}

const STORAGE_KEY = 'meacode-feature-flags'

export function loadFeatureFlags(): FeatureFlagsState {
  if (typeof localStorage === 'undefined') return DEFAULT_FLAGS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_FLAGS
    const parsed = JSON.parse(saved)
    return { ...DEFAULT_FLAGS, ...parsed }
  } catch {
    return DEFAULT_FLAGS
  }
}

export function saveFeatureFlags(flags: FeatureFlagsState) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {
    // ignore
  }
}

export function toggleFeatureFlag(flags: FeatureFlagsState, key: keyof FeatureFlagsState): FeatureFlagsState {
  const updated = { ...flags, [key]: !flags[key] }
  saveFeatureFlags(updated)
  return updated
}

