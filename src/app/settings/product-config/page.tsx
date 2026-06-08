'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';

type Color = { id: string; name: string; hexCode?: string | null; isActive: boolean };
type Material = { id: string; name: string; isActive: boolean };

const TABS = ['colors', 'materials'] as const;
type Tab = (typeof TABS)[number];

export default function ProductSettingsPage() {
  const [tab, setTab] = useState<Tab>('colors');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [colorForm, setColorForm] = useState({ id: '', name: '', hexCode: '#000000', isActive: true });
  const [materialForm, setMaterialForm] = useState({ id: '', name: '', isActive: true });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [colorsRes, materialsRes] = await Promise.all([
        axios.get('/api/product-settings/colors'),
        axios.get('/api/product-settings/materials'),
      ]);
      setColors(colorsRes.data);
      setMaterials(materialsRes.data);
    } catch (e) {
      console.error(e);
      setMessage('Failed to load product settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const saveColor = async () => {
    if (!colorForm.name.trim()) return;
    setSaving(true);
    try {
      if (colorForm.id) {
        await axios.put(`/api/product-settings/colors/${colorForm.id}`, colorForm);
      } else {
        await axios.post('/api/product-settings/colors', colorForm);
      }
      setColorForm({ id: '', name: '', hexCode: '#000000', isActive: true });
      await load();
      notify('Color saved');
    } catch {
      setMessage('Failed to save color');
    } finally {
      setSaving(false);
    }
  };

  const saveMaterial = async () => {
    if (!materialForm.name.trim()) return;
    setSaving(true);
    try {
      if (materialForm.id) {
        await axios.put(`/api/product-settings/materials/${materialForm.id}`, materialForm);
      } else {
        await axios.post('/api/product-settings/materials', materialForm);
      }
      setMaterialForm({ id: '', name: '', isActive: true });
      await load();
      notify('Material saved');
    } catch {
      setMessage('Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border flex justify-center">
        <Loader2 className="animate-spin text-[#006d44]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border">
        <h1 className="text-2xl font-bold">Product Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage colors and materials for product listings. Subcategories (formerly brands) are managed in{' '}
          <Link href={ROUTES.subcategories} className="text-[#006d44] font-semibold inline-flex items-center gap-1 hover:underline">
            Subcategories <ExternalLink size={14} />
          </Link>
        </p>
        {message && (
          <p className={`mt-3 text-sm px-3 py-2 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'bg-[#006d44] text-white' : 'bg-white border text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        {tab === 'colors' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-3 items-end bg-gray-50 p-4 rounded-xl">
              <input placeholder="Color name" value={colorForm.name} onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input type="color" value={colorForm.hexCode || '#000000'} onChange={(e) => setColorForm({ ...colorForm, hexCode: e.target.value })} className="h-10 w-full border rounded-lg" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={colorForm.isActive} onChange={(e) => setColorForm({ ...colorForm, isActive: e.target.checked })} /> Active</label>
              <button type="button" onClick={saveColor} disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#006d44] text-white px-4 py-2 rounded-lg text-sm font-semibold"><Save size={14} /> {colorForm.id ? 'Update' : 'Add'} Color</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {colors.map((c) => (
                <div key={c.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hexCode || '#ccc' }} />
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="text-[#006d44] text-xs font-semibold" onClick={() => setColorForm({ id: c.id, name: c.name, hexCode: c.hexCode || '#000000', isActive: c.isActive })}>Edit</button>
                    <button type="button" className="text-red-600" onClick={async () => { if (confirm('Delete?')) { await axios.delete(`/api/product-settings/colors/${c.id}`); load(); } }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'materials' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-3 items-end bg-gray-50 p-4 rounded-xl">
              <input placeholder="Material name" value={materialForm.name} onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={materialForm.isActive} onChange={(e) => setMaterialForm({ ...materialForm, isActive: e.target.checked })} /> Active</label>
              <button type="button" onClick={saveMaterial} disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#006d44] text-white px-4 py-2 rounded-lg text-sm font-semibold"><Plus size={14} /> {materialForm.id ? 'Update' : 'Add'} Material</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded-lg p-3">
                  <span className="font-medium">{m.name}</span>
                  <div className="flex gap-2">
                    <button type="button" className="text-[#006d44] text-xs font-semibold" onClick={() => setMaterialForm({ id: m.id, name: m.name, isActive: m.isActive })}>Edit</button>
                    <button type="button" className="text-red-600" onClick={async () => { if (confirm('Delete?')) { await axios.delete(`/api/product-settings/materials/${m.id}`); load(); } }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
