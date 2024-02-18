import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { cpus } from 'os';

const BASE_PORT = 3100;

const getWorkerCountByCpu = () => {
  const cpuCount = cpus().length;

  return Math.ceil(cpuCount / 2);
};

export const getWorkerCount = () =>
  process.env.CI ? 1 : getWorkerCountByCpu();
// process.env.CI || process.env.DEBUG ? 1 : getWorkerCountByCpu();

// export const parsePort = (testIndex: number) => process.env.DEBUG ? 3000 : BASE_PORT + testIndex;
export const parsePort = (testIndex: number) => BASE_PORT + testIndex;

export const startServer = async (
  workerIndex: number,
): Promise<ChildProcessWithoutNullStreams> => {
  const serverProcess = spawn('node', ['../../build/server/main.js'], {
    env: {
      PORT: parsePort(workerIndex).toString(),
      NODE_ENV: 'test',
      PATH: process.env.PATH,
    },
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });

  return new Promise((resolve) => {
    serverProcess.stdout.on('data', (data) => {
      if (data.toString().includes('Nest application successfully started')) {
        resolve(serverProcess);
      }
    });
  });
};
