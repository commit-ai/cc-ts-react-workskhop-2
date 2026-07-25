export interface ActivityEntry {
  path: string;
  method: string;
  timestamp: string;
}

const log: ActivityEntry[] = [];

export function record(entry: ActivityEntry): void {
  log.push(entry);
  if (log.length > 50) log.shift();
}

export function getLog(pathFilter?: string): ActivityEntry[] {
  if (pathFilter) {
    return log.filter((e) => e.path.includes(pathFilter));
  }
  return [...log];
}

export function clearLog(): void {
  log.length = 0;
}
