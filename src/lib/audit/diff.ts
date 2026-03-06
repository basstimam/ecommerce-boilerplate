export function generateChanges<T extends Record<string, unknown>>(
  oldRecord: T,
  newRecord: T,
  fieldsToTrack: (keyof T)[]
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  for (const field of fieldsToTrack) {
    const oldValue = oldRecord[field]
    const newValue = newRecord[field]

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[field as string] = { old: oldValue, new: newValue }
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}
