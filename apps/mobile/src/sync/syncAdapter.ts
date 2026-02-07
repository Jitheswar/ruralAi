import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../db';

export async function syncWithServer() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      // STUB: In production, fetch changes from Supabase since lastPulledAt
      console.log('[SYNC STUB] Pull changes since:', lastPulledAt);
      return {
        changes: {
          patients: { created: [], updated: [], deleted: [] },
          health_logs: { created: [], updated: [], deleted: [] },
          medicines: { created: [], updated: [], deleted: [] },
          users: { created: [], updated: [], deleted: [] },
        },
        timestamp: Date.now(),
      };
    },
    pushChanges: async ({ changes }) => {
      // STUB: In production, push local changes to Supabase
      console.log('[SYNC STUB] Push changes:', JSON.stringify(changes).slice(0, 200));
    },
    migrationsEnabledAtVersion: 1,
  });
}
