import { rmSync } from 'node:fs';

try {
  rmSync('.next', { recursive: true, force: true });
  console.log('Removed .next build cache');
} catch {
  // Ignore if the folder does not exist or is locked.
}
