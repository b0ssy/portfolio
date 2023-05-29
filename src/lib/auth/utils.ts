export const sleep = async (milliseconds: number) => {
  if (milliseconds > 0) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }
};

export const sleepFn = async <T>(fn: Promise<T>, milliseconds: number) => {
  const start = Date.now();
  const result = await fn.catch(() => null);
  const duration = Date.now() - start;
  if (duration < milliseconds) {
    await sleep(milliseconds - duration);
  }
  return result;
};
