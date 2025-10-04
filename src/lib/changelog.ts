import { ChangelogEntry, ChangelogIndex } from '@/types/changelog'

export async function getChangelogIndex(): Promise<ChangelogIndex | null> {
  try {
    const response = await fetch('/changelog/index.json', {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch changelog index')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching changelog index:', error)
    return null
  }
}

export async function getChangelogEntry(version: string): Promise<ChangelogEntry | null> {
  try {
    const response = await fetch(`/changelog/versions/${version}.json`, {
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch changelog for version ${version}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching changelog for version ${version}:`, error)
    return null
  }
}

export async function getAllChangelogs(): Promise<ChangelogEntry[]> {
  try {
    const index = await getChangelogIndex()
    if (!index || !index.versions.length) {
      return []
    }

    const changelogPromises = index.versions.map(version => getChangelogEntry(version))
    const changelogs = await Promise.all(changelogPromises)
    
    // Filter out any null values and sort by date (most recent first)
    return changelogs
      .filter((entry): entry is ChangelogEntry => entry !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching all changelogs:', error)
    return []
  }
}

export async function getLatestChangelog(): Promise<ChangelogEntry | null> {
  try {
    const index = await getChangelogIndex()
    if (!index || !index.latest) {
      return null
    }
    
    return await getChangelogEntry(index.latest)
  } catch (error) {
    console.error('Error fetching latest changelog:', error)
    return null
  }
}

export function formatChangelogDate(date: string): string {
  try {
    const dateObj = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
    return new Intl.DateTimeFormat('tr-TR', options).format(dateObj)
  } catch (error) {
    return date
  }
}

export function isNewVersion(lastViewedVersion: string | null, currentVersion: string): boolean {
  if (!lastViewedVersion) return true
  
  try {
    const lastViewed = lastViewedVersion.split('.').map(Number)
    const current = currentVersion.split('.').map(Number)
    
    for (let i = 0; i < current.length; i++) {
      if (current[i] > (lastViewed[i] || 0)) {
        return true
      } else if (current[i] < (lastViewed[i] || 0)) {
        return false
      }
    }
    
    return false
  } catch (error) {
    return false
  }
}