import { execSync } from 'child_process';

import { MongoMemoryReplSet } from 'mongodb-memory-server';

// Extend the default timeout so MongoDB binaries can download
// jest.setTimeout(60000);

const replSet = new MongoMemoryReplSet({
  replSet: { storageEngine: 'wiredTiger' },
  // configSettings: {
  //   getLastErrorDefaults: { w: 'majority', wtimeout: 5000 },
  // },
});

export const stopMemoryDb = async (): Promise<void> => {
  console.log('Stopping memory db');
  await replSet.stop();
};

export const getMemoryDbUri = async (): Promise<string> => {
  return replSet.getUri('financer_test');
};

export const startMemoryDb = async (): Promise<void> => {
  console.log('Starting memory db');
  await replSet.start();
  const uri = await getMemoryDbUri();

  console.log('Running prisma db push', uri);

  execSync(`npx prisma db push --schema=$SCHEMA --skip-generate`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: uri },
  });
};
