import { supabaseAdmin } from "./supabaseAdmin.js";

export class SyncService {
  constructor() {
    this.client = supabaseAdmin;
  }

  async syncItems(data) {
    if (!this.client) {
      console.error("Supabase admin client not available");
      return { inserted: 0, updated: 0 };
    }

    try {
      const { data: result, error } = await this.client
        .from("items")
        .upsert(data, { onConflict: "slug" })
        .select("id");

      if (error) {
        console.error("Error syncing items:", error);
        return { inserted: 0, updated: 0 };
      }

      // Since upsert doesn't return counts, we can estimate or just log the total
      const count = result ? result.length : 0;
      console.log(`Synced ${count} items`);
      return { inserted: count, updated: 0 }; // Placeholder, as Supabase doesn't provide insert/update counts
    } catch (err) {
      console.error("Sync failed:", err);
      return { inserted: 0, updated: 0 };
    }
  }
}
