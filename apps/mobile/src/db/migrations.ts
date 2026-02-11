import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'email', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
