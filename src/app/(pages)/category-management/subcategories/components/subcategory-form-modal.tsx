'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Upload, Loader2 } from 'lucide-react';
import { SubCategory, Category } from '../page';

interface Props {
  subcategory: SubCategory | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubCategoryFormModal({ subcategory, categories, onClose, onSuccess }: Props) {
  const [name, setName] = useState(subcategory?.name || '');
  const [description, setDescription] = useState(subcategory?.description || '');
  const [categoryId, setCategoryId] = useState(subcategory?.categoryId || (categories.length > 0 ? categories[0].id : ''));
  const [isTrending, setIsTrending] = useState(subcategory?.isTrending || false);
  const [isActive, setIsActive] = useState(subcategory?.isActive ?? true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(subcategory?.imageUrl || null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Subcategory name is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a parent category.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('isTrending', isTrending.toString());
      formData.append('isActive', isActive.toString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (subcategory) {
        await axios.put(`/api/subcategories/${subcategory.id}`, formData);
        onSuccess();
      } else {
        const res = await axios.post('/api/subcategories', formData);
        const productsUrl = res.data?.productsUrl as string | undefined;
        onSuccess();
        if (productsUrl) {
          window.open(productsUrl, '_blank');
        }
      }
    } catch (err: any) {
      console.error('Error saving subcategory:', err);
      setError(err.response?.data?.error || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {subcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Parent Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
              required
            >
              <option value="" disabled>Select a parent category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Subcategory Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="e.g. Smartphones, T-Shirts"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
              placeholder="Short description of the subcategory..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subcategory Image
            </label>
            <div 
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${previewUrl ? 'border-green-300 bg-green-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload an image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
            <label className="flex items-center cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="w-5 h-5 border-2 border-gray-300 rounded text-green-600 focus:ring-green-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Mark as Trending</span>
            </label>

            <label className="flex items-center cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 border-2 border-gray-300 rounded text-green-600 focus:ring-green-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">Active Subcategory</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                subcategory ? 'Save Changes' : 'Create Subcategory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
