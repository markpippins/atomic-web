
'use client';

import * as React from 'react';
import { getLogs } from '@/lib/data';
import type { Log } from '@/lib/types';
import { LogTable } from '@/components/logs/log-table';

export default function LogsPage() {
  const [logs] = React.useState<Log[]>(() => getLogs());

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <p className="text-muted-foreground">
          Search, filter, and inspect all log entries.
        </p>
      </div>
      <LogTable data={logs} />
    </div>
  );
}
