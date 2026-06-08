'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
} from '@tanstack/react-table';
import { Loader2, AlertTriangle } from 'lucide-react';

interface Dispute {
	id: string;
	orderNumber: string;
	submittedBy: string;
	reason: string;
	status: 'OPEN' | 'RESOLVED' | 'REJECTED';
	createdAt: string;
}

const fetchDisputes = async (): Promise<Dispute[]> => {
	const res = await axios.get('/api/disputes');
	return res.data;
};

const DisputesTable: React.FC = () => {
	const {
		data = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['disputes'],
		queryFn: fetchDisputes,
	});

	const columns = React.useMemo<ColumnDef<Dispute>[]>(
		() => [
			{ header: 'Order #', accessorKey: 'orderNumber' },
			{ header: 'Submitted By', accessorKey: 'submittedBy' },
			{ header: 'Reason', accessorKey: 'reason' },
			{
				header: 'Status',
				accessorKey: 'status',
				cell: (info) => {
					const status = info.getValue() as string;
					const colors: Record<string, string> = {
						OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-300',
						RESOLVED: 'bg-green-100 text-green-800 border-green-300',
						REJECTED: 'bg-red-100 text-red-800 border-red-300',
					};
					return (
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}
						>
							{status}
						</span>
					);
				},
			},
			{
				header: 'Date',
				accessorKey: 'createdAt',
				cell: (info) =>
					new Date(info.getValue() as string).toLocaleDateString(),
			},
		],
		[]
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (isLoading)
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="animate-spin mr-2 text-green-600" /> Loading
				disputes...
			</div>
		);

	if (isError)
		return (
			<div className="text-red-600 flex items-center justify-center py-8">
				<AlertTriangle className="mr-2" /> Failed to load disputes
			</div>
		);

	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="bg-green-50">
					{table.getHeaderGroups().map((group) => (
						<tr key={group.id}>
							{group.headers.map((header) => (
								<th
									key={header.id}
									className="px-6 py-3 text-left text-sm font-medium text-green-800"
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext()
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody className="divide-y divide-gray-200">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="hover:bg-green-50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-6 py-4">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default DisputesTable;
