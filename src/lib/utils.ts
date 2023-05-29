export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

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
  const result = await fn;
  const duration = Date.now() - start;
  if (duration < milliseconds) {
    await sleep(milliseconds - duration);
  }
  return result;
};

// Provide some convenient methods
export const sleepFn500ms = async <T>(fn: Promise<T>) => sleepFn(fn, 500);
export const sleepFn1000ms = async <T>(fn: Promise<T>) => sleepFn(fn, 1000);

export const formatNumber = (value: number) => {
  const str = `${value}`;
  const chunks = [];
  let i = str.length - 3;
  for (; i >= 0; i -= 3) {
    chunks.unshift(str.substring(i, i + 3));
  }
  if (i < 0 && i > -3) {
    chunks.unshift(str.substring(0, 3 + i));
  }
  return chunks.join(",");
};

// RFC2822
// https://regexr.com/2rhq7
export const isValidEmail = (email: string) => {
  return !!email.match(
    // eslint-disable-next-line
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
  );
};
