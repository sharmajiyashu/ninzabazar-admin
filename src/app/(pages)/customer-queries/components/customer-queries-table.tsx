'use client';

import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircleQuestion, Search } from 'lucide-react';
import { CUSTOMER_QUERY_STATUSES } from '@/lib/customer-query';

type CustomerQuery = {
  id: string;
  firstName: string;
  phoneNumber: string;
  queryText: string;
  status: string;
  adminNotes: string | null;
  source: string;
  productId: string | null;
  productName: string | null;
  sellerId: string | null;
  quantity: number | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

const SOURCE_LABELS: Record<string, string> = {
  LANDING: 'Landing',
  PRODUCT: 'Product Inquiry',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

async function fetchQueries(status?: string, source?: string) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (source) params.set('source', source);
  const qs = params.toString();
  const res = await axios.get(`/api/customer-queries${qs ? `?${qs}` : ''}`);
  return res.data as CustomerQuery[];
}

export default function CustomerQueriesTable() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerQuery | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['customer-queries', statusFilter, sourceFilter],
    queryFn: () => fetchQueries(statusFilter || undefined, sourceFilter || undefined),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.firstName.toLowerCase().includes(q) ||
        item.phoneNumber.includes(q) ||
        item.queryText.toLowerCase().includes(q) ||
        (item.productName || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const openDetail = (item: CustomerQuery) => {
    setSelected(item);
    setAdminNotes(item.adminNotes || '');
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/customer-queries/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ['customer-queries'] });
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.patch(`/api/customer-queries/${selected.id}`, { adminNotes });
      queryClient.invalidateQueries({ queryKey: ['customer-queries'] });
      setSelected((prev) => (prev ? { ...prev, adminNotes } : prev));
    } catch {
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="text-green-700" size={22} />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Customer Queries</h1>
              <p className="text-sm text-gray-500">Manage landing page and product inquiry submissions</p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-600">{filtered.length} total</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, or query..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[160px]"
        >
          <option value="">All sources</option>
          <option value="LANDING">Landing page</option>
          <option value="PRODUCT">Product inquiry</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[160px]"
        >
          <option value="">All statuses</option>
          {CUSTOMER_QUERY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-0">
        <div className="lg:col-span-3 overflow-x-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-500">Loading queries...</p>
          ) : isError ? (
            <p className="p-8 text-center text-red-500">Failed to load queries.</p>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No customer queries yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openDetail(item)}
                    className={`border-t border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selected?.id === item.id ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.firstName || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.phoneNumber}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600">
                        {SOURCE_LABELS[item.source] || item.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                      {item.productName || item.queryText}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full border px-2 py-1 ${STATUS_STYLES[item.status] || STATUS_STYLES.PENDING}`}
                      >
                        {CUSTOMER_QUERY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-l border-gray-200 p-4 min-h-[320px]">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900">{selected.firstName || 'Product inquiry'}</h3>
                <p className="text-sm text-gray-500">{selected.phoneNumber}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {SOURCE_LABELS[selected.source] || selected.source} ·{' '}
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              {selected.source === 'PRODUCT' && (
                <div className="text-sm text-gray-700 space-y-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  {selected.productName && (
                    <p>
                      <span className="font-semibold">Product:</span> {selected.productName}
                    </p>
                  )}
                  {selected.quantity != null && (
                    <p>
                      <span className="font-semibold">Quantity:</span> {selected.quantity} pieces
                    </p>
                  )}
                  {selected.color && (
                    <p>
                      <span className="font-semibold">Color:</span> {selected.color}
                    </p>
                  )}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Query</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {selected.queryText}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Admin notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Internal notes about this query..."
                />
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={saving}
                  className="mt-2 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
              <MessageCircleQuestion size={48} className="mb-3 opacity-40" />
              <p className="text-sm">Select a query to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
