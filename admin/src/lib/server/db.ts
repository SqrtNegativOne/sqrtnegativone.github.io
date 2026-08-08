import fs from 'fs/promises';
import path from 'path';

// Resolve paths relative to the current working directory (which is admin-app usually)
const DATA_DIR = path.resolve(process.cwd(), '../src/data');

export async function readData<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T[];
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Error reading ${filename}:`, error);
    }
    return [];
  }
}

export async function writeData<T>(filename: string, data: T[]): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}
