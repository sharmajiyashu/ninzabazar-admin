'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  LayoutTemplate,
  Tags,
  Flame,
  Percent,
  Package,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type LandingSection = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  isVisible: boolean;
  sortOrder: number;
  config: Record<string, unknown> | null;
};

type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
};

type LandingDeal = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bgColor: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

type LandingProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | null;
  sellerName?: string;
};

const PRODUCT_SECTION_KEYS = [
  { key: 'featured_products', label: 'Featured Products' },
  { key: 'apparel_fashion', label: 'Apparel & Fashion' },
  { key: 'air_cleaning', label: 'Air Cleaning Equipment' },
  { key: 'sports_entertainment', label: 'Sports & Entertainment' },
  { key: 'beauty_health', label: 'Beauty & Health' },
];

const DEFAULT_ACTION_CARDS = [
  { title: 'Request for Quotation', bgColor: '#fce3f2', image: '/img/hero-cards/quotation_3d.png', link: '/products' },
  { title: 'Sell Your Products', bgColor: '#fdf0cd', image: '/img/hero-cards/sell_products_3d.png', link: '/seller/post' },
  { title: 'Grow Your Business', bgColor: '#ffd3d5', image: '/img/hero-cards/grow_business_3d.png', link: '/seller/dashboard' },
];

function parseConfig(config: unknown): Record<string, unknown> {
  if (!config) return {};
  if (typeof config === 'string') {
    try {
      return JSON.parse(config) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof config === 'object') return config as Record<string, unknown>;
  return {};
}

function normalizeSections(raw: LandingSection[]): LandingSection[] {
  return raw.map((section) => {
    if (section.key !== 'hero') return section;
    const config = parseConfig(section.config);
    const storedCards = Array.isArray(config.actionCards) ? config.actionCards : [];
    const actionCards =
      storedCards.length > 0
        ? DEFAULT_ACTION_CARDS.map((defaultCard, i) => ({ ...defaultCard, ...(storedCards[i] as object || {}) }))
        : DEFAULT_ACTION_CARDS;
    return { ...section, config: { ...config, actionCards } };
  });
}

const TABS = [
  { id: 'headings', label: 'Headings & Hero', icon: LayoutTemplate },
  { id: 'top', label: 'Top Categories', icon: Tags },
  { id: 'trending', label: 'Trending Categories', icon: Flame },
  { id: 'deals', label: 'Best Deals', icon: Percent },
  { id: 'products', label: 'Product Sections', icon: Package },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function LandingPageManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>('headings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [sections, setSections] = useState<LandingSection[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [topCategoryIds, setTopCategoryIds] = useState<string[]>([]);
  const [trendingCategoryIds, setTrendingCategoryIds] = useState<string[]>([]);
  const [deals, setDeals] = useState<LandingDeal[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<LandingProduct[]>([]);
  const [selectedProductSection, setSelectedProductSection] = useState('featured_products');
  const [sectionProductIds, setSectionProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const [dealForm, setDealForm] = useState({
    id: '',
    title: '',
    description: '',
    bgColor: '#0a8558',
    linkUrl: '',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
  });
  const [dealImageFile, setDealImageFile] = useState<File | null>(null);
  const [showDealForm, setShowDealForm] = useState(false);

  const heroSection = sections.find((s) => s.key === 'hero');
  const heroConfig = (heroSection?.config || {}) as Record<string, unknown>;
  const actionCards = (heroConfig.actionCards as { title: string; bgColor: string; image: string; link?: string }[]) || [];

  const filteredLiveProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return approvedProducts;
    return approvedProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sellerName || '').toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [approvedProducts, productSearch]);

  const loadLiveProducts = useCallback(async () => {
    try {
      const res = await axios.get('/api/landing/products');
      setApprovedProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sectionsRes, categoriesRes, topRes, trendingRes, dealsRes] = await Promise.all([
        axios.get('/api/landing/sections'),
        axios.get('/api/categories'),
        axios.get('/api/landing/category-slots?slotType=top'),
        axios.get('/api/landing/category-slots?slotType=trending'),
        axios.get('/api/landing/deals'),
      ]);

      setSections(normalizeSections(sectionsRes.data));
      setAllCategories(categoriesRes.data.filter((c: Category) => c.isActive));
      setTopCategoryIds(topRes.data.map((s: { categoryId: string }) => s.categoryId));
      setTrendingCategoryIds(trendingRes.data.map((s: { categoryId: string }) => s.categoryId));
      setDeals(dealsRes.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load landing page data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProductSection = useCallback(async (sectionKey: string) => {
    try {
      const res = await axios.get(`/api/landing/product-slots?sectionKey=${sectionKey}`);
      setSectionProductIds(res.data.map((s: { productId: string }) => s.productId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProductSection(selectedProductSection);
      loadLiveProducts();
    }
  }, [activeTab, selectedProductSection, loadProductSection, loadLiveProducts]);

  const showSuccess = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  };

  const saveSections = async () => {
    setSaving(true);
    try {
      await axios.put('/api/landing/sections', { sections });
      showSuccess('Sections saved successfully');
    } catch {
      setMessage('Failed to save sections');
    } finally {
      setSaving(false);
    }
  };

  const saveCategorySlots = async (slotType: 'top' | 'trending', ids: string[]) => {
    setSaving(true);
    try {
      await axios.put('/api/landing/category-slots', { slotType, categoryIds: ids });
      showSuccess(`${slotType === 'top' ? 'Top' : 'Trending'} categories saved`);
    } catch {
      setMessage('Failed to save categories');
    } finally {
      setSaving(false);
    }
  };

  const saveProductSlots = async () => {
    setSaving(true);
    try {
      await axios.put('/api/landing/product-slots', {
        sectionKey: selectedProductSection,
        productIds: sectionProductIds,
      });
      showSuccess('Product section saved');
    } catch {
      setMessage('Failed to save products');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (key: string, field: keyof LandingSection, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  const updateHeroConfig = (field: string, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.key !== 'hero') return s;
        return { ...s, config: { ...(s.config || {}), [field]: value } };
      })
    );
  };

  const moveItem = (ids: string[], setIds: (v: string[]) => void, index: number, direction: 'up' | 'down') => {
    const next = [...ids];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setIds(next);
  };

  const toggleCategory = (ids: string[], setIds: (v: string[]) => void, categoryId: string) => {
    if (ids.includes(categoryId)) {
      setIds(ids.filter((id) => id !== categoryId));
    } else {
      setIds([...ids, categoryId]);
    }
  };

  const resetDealForm = () => {
    setDealForm({ id: '', title: '', description: '', bgColor: '#0a8558', linkUrl: '', imageUrl: '', sortOrder: deals.length, isActive: true });
    setDealImageFile(null);
    setShowDealForm(false);
  };

  const saveDeal = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', dealForm.title);
      formData.append('description', dealForm.description);
      formData.append('bgColor', dealForm.bgColor);
      formData.append('linkUrl', dealForm.linkUrl);
      formData.append('sortOrder', String(dealForm.sortOrder));
      formData.append('isActive', String(dealForm.isActive));
      if (dealImageFile) formData.append('image', dealImageFile);
      else if (dealForm.imageUrl) formData.append('imageUrl', dealForm.imageUrl);

      if (dealForm.id) {
        await axios.put(`/api/landing/deals/${dealForm.id}`, formData);
      } else {
        await axios.post('/api/landing/deals', formData);
      }

      resetDealForm();
      const res = await axios.get('/api/landing/deals');
      setDeals(res.data);
      showSuccess('Deal saved');
    } catch {
      setMessage('Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
    await axios.delete(`/api/landing/deals/${id}`);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    showSuccess('Deal deleted');
  };

  const editDeal = (deal: LandingDeal) => {
    setDealForm({ ...deal, linkUrl: deal.linkUrl || '' });
    setShowDealForm(true);
  };

  const renderCategoryManager = (
    title: string,
    description: string,
    selectedIds: string[],
    setSelectedIds: (v: string[]) => void,
    slotType: 'top' | 'trending'
  ) => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Link
          href="/category-management"
          className="inline-flex items-center gap-2 shrink-0 text-sm font-semibold text-[#006d44] border border-[#006d44]/30 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100"
        >
          Edit Categories & Images <ExternalLink size={14} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold mb-3 text-gray-800">Available Categories</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allCategories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat.id)}
                  onChange={() => toggleCategory(selectedIds, setSelectedIds, cat.id)}
                  className="rounded border-gray-300"
                />
                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold mb-3 text-gray-800">Display Order</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedIds.length === 0 ? (
              <p className="text-sm text-gray-400">No categories selected</p>
            ) : (
              selectedIds.map((id, index) => {
                const cat = allCategories.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <div key={id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-xs font-bold text-green-700 w-6">{index + 1}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                    <button type="button" onClick={() => moveItem(selectedIds, setSelectedIds, index, 'up')} className="p-1 hover:bg-white rounded">
                      <ChevronUp size={16} />
                    </button>
                    <button type="button" onClick={() => moveItem(selectedIds, setSelectedIds, index, 'down')} className="p-1 hover:bg-white rounded">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => saveCategorySlots(slotType, selectedIds)}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-[#006d44] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#005a36] disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save {slotType === 'top' ? 'Top' : 'Trending'} Categories
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-200 flex justify-center">
        <Loader2 className="animate-spin text-[#006d44]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Landing Page Management</h1>
        <p className="text-gray-500 mt-1">
          Choose which categories and products appear on the homepage. To add or edit categories/images go to{' '}
          <Link href="/category-management" className="text-[#006d44] font-semibold hover:underline inline-flex items-center gap-1">
            Category Management <ExternalLink size={14} />
          </Link>
          . To approve seller products go to{' '}
          <Link href="/product-approval" className="text-[#006d44] font-semibold hover:underline inline-flex items-center gap-1">
            Product Approval <ExternalLink size={14} />
          </Link>
          .
        </p>
        {message && (
          <div className={`mt-4 px-4 py-2 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-[#006d44] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        {activeTab === 'headings' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Section Headings</h3>
              <div className="space-y-4">
                {sections
                  .filter((s) => s.key !== 'hero')
                  .map((section) => (
                    <div key={section.id} className="grid md:grid-cols-4 gap-3 items-end border-b border-gray-100 pb-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">{section.key.replace(/_/g, ' ')}</label>
                        <input
                          value={section.title}
                          onChange={(e) => updateSection(section.key, 'title', e.target.value)}
                          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
                        <input
                          value={section.subtitle || ''}
                          onChange={(e) => updateSection(section.key, 'subtitle', e.target.value || null)}
                          className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 pb-2">
                        <input
                          type="checkbox"
                          checked={section.isVisible}
                          onChange={(e) => updateSection(section.key, 'isVisible', e.target.checked)}
                        />
                        Visible on landing page
                      </label>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hero Banner</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Headline (use line break in text)</label>
                  <textarea
                    value={(heroConfig.headline as string) || ''}
                    onChange={(e) => updateHeroConfig('headline', e.target.value)}
                    rows={2}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Subtext</label>
                  <input
                    value={(heroConfig.subtext as string) || ''}
                    onChange={(e) => updateHeroConfig('subtext', e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">CTA Button Text</label>
                  <input
                    value={(heroConfig.ctaText as string) || ''}
                    onChange={(e) => updateHeroConfig('ctaText', e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">CTA Link</label>
                  <input
                    value={(heroConfig.ctaLink as string) || ''}
                    onChange={(e) => updateHeroConfig('ctaLink', e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Action Cards</h4>
                <div className="space-y-3">
                  {actionCards.map((card, index) => (
                    <div key={index} className="grid md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl">
                      <input
                        value={card.title}
                        onChange={(e) => {
                          const next = [...actionCards];
                          next[index] = { ...next[index], title: e.target.value };
                          updateHeroConfig('actionCards', next);
                        }}
                        placeholder="Title"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={card.link || ''}
                        onChange={(e) => {
                          const next = [...actionCards];
                          next[index] = { ...next[index], link: e.target.value };
                          updateHeroConfig('actionCards', next);
                        }}
                        placeholder="Link URL"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={card.bgColor}
                        onChange={(e) => {
                          const next = [...actionCards];
                          next[index] = { ...next[index], bgColor: e.target.value };
                          updateHeroConfig('actionCards', next);
                        }}
                        placeholder="Background color"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        value={card.image}
                        onChange={(e) => {
                          const next = [...actionCards];
                          next[index] = { ...next[index], image: e.target.value };
                          updateHeroConfig('actionCards', next);
                        }}
                        placeholder="Image path"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={saveSections}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#006d44] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#005a36] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Headings & Hero
            </button>
          </div>
        )}

        {activeTab === 'top' &&
          renderCategoryManager(
            'Top Categories (Sidebar)',
            'Choose which categories appear in the left sidebar and their order.',
            topCategoryIds,
            setTopCategoryIds,
            'top'
          )}

        {activeTab === 'trending' &&
          renderCategoryManager(
            'Trending Categories',
            'Choose categories shown in the trending section with images.',
            trendingCategoryIds,
            setTrendingCategoryIds,
            'trending'
          )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Today&apos;s Best Deals</h3>
                <p className="text-sm text-gray-500">Manage promotional deal cards on the landing page.</p>
              </div>
              <button
                type="button"
                onClick={() => { resetDealForm(); setShowDealForm(true); }}
                className="inline-flex items-center gap-2 bg-[#006d44] text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                <Plus size={16} /> Add Deal
              </button>
            </div>

            {showDealForm && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} placeholder="Title" className="border rounded-lg px-3 py-2 text-sm" />
                  <input value={dealForm.description} onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })} placeholder="Description" className="border rounded-lg px-3 py-2 text-sm" />
                  <input value={dealForm.bgColor} onChange={(e) => setDealForm({ ...dealForm, bgColor: e.target.value })} placeholder="Background color (#hex)" className="border rounded-lg px-3 py-2 text-sm" />
                  <input value={dealForm.linkUrl} onChange={(e) => setDealForm({ ...dealForm, linkUrl: e.target.value })} placeholder="Link URL" className="border rounded-lg px-3 py-2 text-sm" />
                  <input type="file" accept="image/*" onChange={(e) => setDealImageFile(e.target.files?.[0] || null)} className="text-sm" />
                  {!dealImageFile && (
                    <input value={dealForm.imageUrl} onChange={(e) => setDealForm({ ...dealForm, imageUrl: e.target.value })} placeholder="Or image URL/path" className="border rounded-lg px-3 py-2 text-sm" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={saveDeal} disabled={saving} className="bg-[#006d44] text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Deal</button>
                  <button type="button" onClick={resetDealForm} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((deal) => (
                <div key={deal.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="h-32 relative" style={{ backgroundColor: deal.bgColor }}>
                    <Image src={deal.imageUrl} alt={deal.title} fill className="object-contain p-4" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm">{deal.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{deal.description}</p>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => editDeal(deal)} className="text-xs font-semibold text-[#006d44]">Edit</button>
                      <button type="button" onClick={() => deleteDeal(deal.id)} className="text-xs font-semibold text-red-600 inline-flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Product Sections</h3>
                <p className="text-sm text-gray-500">
                  Pick live products (admin approved + seller listed). Search by product or seller name.
                </p>
              </div>
              <Link
                href="/product-approval"
                className="inline-flex items-center gap-2 shrink-0 text-sm font-semibold text-[#006d44] border border-[#006d44]/30 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100"
              >
                Approve Products <ExternalLink size={14} />
              </Link>
            </div>

            <select
              value={selectedProductSection}
              onChange={(e) => setSelectedProductSection(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm max-w-xs"
            >
              {PRODUCT_SECTION_KEYS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-semibold">Live Products ({filteredLiveProducts.length})</h4>
                </div>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search product or seller name..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLiveProducts.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sectionProductIds.includes(product.id)}
                        onChange={() => toggleCategory(sectionProductIds, setSectionProductIds, product.id)}
                      />
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {product.sellerName || 'Seller'} · {product.category} · ₹{product.price}
                        </p>
                      </div>
                    </label>
                  ))}
                  {filteredLiveProducts.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No live products found. Products must be admin approved and listed by the seller.{' '}
                      <Link href="/product-approval" className="text-[#006d44] font-semibold hover:underline">
                        Review products
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Selected Order</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sectionProductIds.map((id, index) => {
                    const product = approvedProducts.find((p) => p.id === id);
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                        <span className="text-xs font-bold text-green-700 w-6">{index + 1}</span>
                        <span className="flex-1 text-sm font-medium truncate">{product.name}</span>
                        <button type="button" onClick={() => moveItem(sectionProductIds, setSectionProductIds, index, 'up')} className="p-1"><ChevronUp size={16} /></button>
                        <button type="button" onClick={() => moveItem(sectionProductIds, setSectionProductIds, index, 'down')} className="p-1"><ChevronDown size={16} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={saveProductSlots}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#006d44] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#005a36] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Product Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
