/**
 * Shared "tour version" preference (V1 = classic Guided Journey overlay,
 * V2 = Mission Board). The pills on the Data Sources page write it; the Help
 * chat's "Start Data Sources Tour" reads it to launch the chosen engine.
 */

export type TourVersion = 'v1' | 'v2' | 'v3' | 'v4' | 'v5'

export const TOUR_VERSION_KEY = 'tlx:tour-version'

export function readTourVersion(): TourVersion {
  try {
    const v = localStorage.getItem(TOUR_VERSION_KEY)
    return v === 'v1' || v === 'v3' || v === 'v4' || v === 'v5' ? v : 'v2'
  } catch {
    return 'v2'
  }
}

export function writeTourVersion(v: TourVersion) {
  try {
    localStorage.setItem(TOUR_VERSION_KEY, v)
  } catch {
    /* ignore quota / private mode */
  }
}
