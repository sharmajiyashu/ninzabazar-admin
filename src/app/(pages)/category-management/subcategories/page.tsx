'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Search, Tags, Plus, Image as ImageIcon } from 'lucide-react';
// @ts-ignore
import SubCategoryFormModal from './components/subcategory-form-modal';
// @ts-ignore
import ActionDropdown from './components/action-dropdown';

export type Category = {
  id: string;
  name: string;
};

export type SubCategory = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isTrending: boolean;
  isActive: boolean;
  categoryId: string;
  category: Category;
  createdAt: string;
};

const PAGE_SIZE = 10;

export default function SubCategoryManagementPage() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const [subRes, catRes] = await Promise.all([
        axios.get('/api/subcategories'),
        axios.get('/api/categories')
      ]);
      setSubcategories(subRes.data);
      setCategories(catRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setError('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const filteredData = useMemo(() => {
    return subcategories.filter((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.category && sub.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subcategories, searchTerm]);

  const pagedData = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, pageIndex]);

  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleCreateNew = () => {
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subcategory: SubCategory) => {
    setEditingSubCategory(subcategory);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await axios.delete(`/api/subcategories/${id}`);
      fetchSubCategories();
    } catch (err) {
      console.error('Failed to delete subcategory:', err);
      alert('Error deleting subcategory.');
    }
  };

  const columns: ColumnDef<SubCategory>[] = [
    {
      header: 'Image',
      accessorKey: 'imageUrl',
      cell: (info) => {
        const url = info.getValue() as string | null;
        return (
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
            {url ? (
              <img src={url} alt="SubCategory" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-gray-400" size={20} />
            )}
          </div>
        );
      },
    },
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info) => (
        <div className="font-semibold text-gray-900">{info.getValue() as string}</div>
      ),
    },
    {
      header: 'Parent Category',
      accessorKey: 'category.name',
      cell: (info) => (
        <div className="text-gray-600">{info.getValue() as string || '-'}</div>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info) => {
        const desc = info.getValue() as string | null;
        return (
          <div className="text-sm text-gray-500 truncate max-w-[200px]">
            {desc || '-'}
          </div>
        );
      },
    },
    {
      header: 'Trending',
      accessorKey: 'isTrending',
      cell: (info) => {
        const isTrending = info.getValue() as boolean;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              isTrending
                ? 'bg-orange-100 text-orange-700 border-orange-200'
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}
          >
            {isTrending ? 'Trending' : 'Standard'}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (info) => {
        const isActive = info.getValue() as boolean;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              isActive
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-red-100 text-red-700 border-red-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionDropdown
          subcategory={row.original}
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: pagedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading && subcategories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Loading subcategories...</span>
        </div>
      </div>
    );
  }

  if (error && subcategories.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
        <div className="text-red-600 text-center">
          <Tags className="mx-auto mb-2" size={48} />
          <p className="font-semibold">Failed to load subcategories</p>
          <p className="text-sm">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg text-green-700">
            <Tags size={20} />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Subcategory Management</h1>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Create Subcategory
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search subcategories..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageIndex(0);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filteredData.length} total subcategories
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-green-50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  <Tags className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="text-lg font-medium text-gray-900">No subcategories found</p>
                  <p className="text-sm mt-1">Try a different search term or create a new subcategory.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{pageIndex * PAGE_SIZE + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((pageIndex + 1) * PAGE_SIZE, filteredData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredData.length}</span> subcategories
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
              disabled={pageIndex === 0}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPageIndex((old) => Math.min(old + 1, pageCount - 1))}
              disabled={pageIndex === pageCount - 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <SubCategoryFormModal
          subcategory={editingSubCategory}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSubCategories();
          }}
        />
      )}
    </div>
  );
}
