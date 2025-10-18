'use client';

import * as React from 'react';
import {
  ChevronsUpDown,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import type { ColumnDef, SortingState, VisibilityState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Log } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const getBadgeVariant = (level: Log['level']) => {
  switch (level) {
    case 'ERROR':
      return 'destructive';
    case 'WARNING':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getBadgeColor = (level: Log['level']) => {
    switch (level) {
      case 'ERROR':
        return 'border-red-500/50 text-red-500';
      case 'WARNING':
        return 'border-yellow-500/50 text-yellow-500';
      case 'INFO':
        return 'border-blue-500/50 text-blue-500';
      case 'DEBUG':
        return 'border-gray-500/50 text-gray-500';
      default:
        return 'border-gray-500/50 text-gray-500';
    }
}

const TimestampCell = ({ timestamp }: { timestamp: string }) => {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient ? <div>{format(new Date(timestamp), 'PPpp')}</div> : null;
};


export const columns: ColumnDef<Log>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'timestamp',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Timestamp
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <TimestampCell timestamp={row.getValue('timestamp')} />,
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => (
      <Badge variant="outline" className={cn(getBadgeColor(row.getValue('level')))}>
        {row.getValue('level')}
      </Badge>
    ),
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('message')}</div>,
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <div className="capitalize">{row.getValue('source')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(JSON.stringify(row.original))}
            >
              Copy Log JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type LogTableProps = {
    data: Log[];
};

export function LogTable({ data }: LogTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter messages..."
          value={(table.getColumn('message')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('message')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
