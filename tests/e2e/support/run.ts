/**
 * `npm run test:e2e -- <args>`: runs `playwright test <args>`.
 *
 * It exists for one reason. Git Bash on Windows rewrites any argument that
 * looks like a POSIX path before the program sees it, so
 * `--grep "/de/forschung/"` arrives as `--grep "C:/Program Files/Git/de/forschung/"`
 * and selects nothing. In an MSYS shell this turns such arguments back. On any
 * other shell or platform the arguments pass through untouched.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function msysRoot(): string | null {
  if (process.platform !== 'win32' || !process.env.MSYSTEM) return null;
  try {
    const root = execFileSync('cygpath', ['-m', '/'], { encoding: 'utf8' }).trim();
    return root.endsWith('/') ? root : `${root}/`;
  } catch {
    return null;
  }
}

const root = msysRoot();
const args = process.argv.slice(2).map((arg) => {
  if (!root) return arg;
  if (arg.startsWith(root)) return `/${arg.slice(root.length)}`;
  const eq = arg.indexOf('=');
  if (arg.startsWith('--') && eq > 0 && arg.startsWith(root, eq + 1)) {
    return `${arg.slice(0, eq + 1)}/${arg.slice(eq + 1 + root.length)}`;
  }
  return arg;
});

const cli = fileURLToPath(import.meta.resolve('@playwright/test/cli'));
const result = spawnSync(process.execPath, [cli, 'test', ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
