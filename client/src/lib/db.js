import Dexie from "dexie";

// Initialize Dexie IndexedDB
export const db = new Dexie("SplixDatabase");

db.version(1).stores({
  snapshots: "key, groupId, updatedAt",
  syncQueue: "++id, editId, action, status, createdAt"
});

/**
 * Cache snapshot data for instant offline rendering
 */
export async function saveCachedSnapshot(key, snapshotData) {
  if (!key || !snapshotData) return;
  try {
    await db.snapshots.put({
      key,
      groupId: snapshotData.group?.id || "",
      data: snapshotData,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error("[Dexie] Failed to cache snapshot:", err);
  }
}

/**
 * Retrieve cached snapshot by key (e.g. `edit:${editId}` or `view:${viewId}`)
 */
export async function getCachedSnapshot(key) {
  if (!key) return null;
  try {
    const entry = await db.snapshots.get(key);
    return entry ? entry.data : null;
  } catch (err) {
    console.error("[Dexie] Failed to load cached snapshot:", err);
    return null;
  }
}

/**
 * Enqueue a mutation to be synced when online
 */
export async function enqueueMutation({ editId, action, payload, token, tempId }) {
  try {
    const id = await db.syncQueue.add({
      editId,
      action,
      payload,
      token,
      tempId: tempId || null,
      status: "pending",
      createdAt: Date.now(),
      error: null
    });
    return id;
  } catch (err) {
    console.error("[Dexie] Failed to enqueue mutation:", err);
    throw err;
  }
}

/**
 * Get all pending/failed mutations for an editId
 */
export async function getPendingMutations(editId) {
  try {
    let collection = db.syncQueue.orderBy("createdAt");
    if (editId) {
      collection = db.syncQueue.where("editId").equals(editId);
    }
    const items = await collection.toArray();
    return items.sort((a, b) => a.createdAt - b.createdAt);
  } catch (err) {
    console.error("[Dexie] Failed to get pending mutations:", err);
    return [];
  }
}

/**
 * Remove a mutation after successful sync
 */
export async function removeQueuedMutation(id) {
  try {
    await db.syncQueue.delete(id);
  } catch (err) {
    console.error("[Dexie] Failed to remove queued mutation:", err);
  }
}

/**
 * Update mutation status (e.g. marking syncing or error)
 */
export async function updateQueuedMutation(id, updates) {
  try {
    await db.syncQueue.update(id, updates);
  } catch (err) {
    console.error("[Dexie] Failed to update mutation:", err);
  }
}

/**
 * Clear all queued mutations for a group
 */
export async function clearQueuedMutations(editId) {
  try {
    if (editId) {
      await db.syncQueue.where("editId").equals(editId).delete();
    } else {
      await db.syncQueue.clear();
    }
  } catch (err) {
    console.error("[Dexie] Failed to clear mutations:", err);
  }
}
