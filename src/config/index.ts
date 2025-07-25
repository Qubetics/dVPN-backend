import { config } from 'dotenv';
import { resolve } from 'path';

export function initiate(): Promise<boolean> {
   return new Promise((resolvePromise) => {
      config({ path: resolve(__dirname, './local.env') });
      resolvePromise(true);
   });
}
