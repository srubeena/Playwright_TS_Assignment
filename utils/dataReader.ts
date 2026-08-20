import * as fs from 'fs';
import * as path from 'path';

/**
 * Reads and parses a JSON file into a typed object.
 */
/*
export function readsJson<T>(relativePath: string): T {
    const fullPath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`JSON file not found: ${fullPath}`);
    }

    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw) as T;
}
*/


export function readJson<T>(relativePath: string): T {
    const fullPath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`JSON file not found: ${fullPath}`);
    }

    const raw = fs.readFileSync(fullPath, 'utf-8').trim();

    if (!raw) {
        throw new Error(`JSON file at ${fullPath} is empty`);
    }

    try {
        return JSON.parse(raw) as T;
    } catch (error) {
        throw new Error(`Invalid JSON structure in ${fullPath}: ${(error as Error).message}`);
    }
}

//export default readJson;


/**
 * Appends a single orderId to a JSON array file (e.g. orderIds.json).
 * If the file doesn't exist or is empty, it creates a new array with just this orderId.
 * If the file exists but isn't an array, throws an error rather than silently overwriting it.
 */
export function writeJson(relativePath: string, orderId: string): void {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let orderIds: string[] = [];

  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, 'utf-8').trim();
    if (raw.length > 0) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error(
          `Expected ${relativePath} to contain a JSON array, but found: ${typeof parsed}`
        );
      }
      orderIds = parsed as string[];
    }
  }

  orderIds.push(orderId);
  fs.writeFileSync(fullPath, JSON.stringify(orderIds, null, 2), 'utf-8');
}






/**
 * Reads a simple CSV file into an array of typed row objects.
 * The first line is treated as the header row (property names).
 * No external dependency required — safe from supply-chain/audit issues.
 *
 * Note: this is a lightweight parser intended for simple, comma-separated
 * test data (no embedded commas/quotes within fields). For complex CSVs,
 * consider a dedicated parser library.
 */
export default function readCsv<T = Record<string, string>>(relativePath: string): T[] {
    const fullPath = path.resolve(process.cwd(), relativePath);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`CSV file not found: ${fullPath}`);
    }

    const raw = fs.readFileSync(fullPath, 'utf-8').trim();
    const [headerLine, ...lines] = raw.split(/\r?\n/);
    const headers = headerLine.split(',').map(h => h.trim());

    return lines
        .filter(line => line.trim().length > 0)
        .map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, i) => (row[h] = values[i] ?? ''));
            return row as T;
        });
}

/**
 * Converts string "true"/"false" values from CSV into real booleans.
 * CSV has no native types, so this helper is handy for flags like
 * expectedInCart, isValid, etc.
 */
export function toBoolean(value: string): boolean {
    return value?.toLowerCase().trim() === 'true';
}