import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Search, Filter, Bookmark, PlusCircle, MapPin, Tag,
  CheckCircle2, AlertCircle, Loader2, MessageSquare, Send, X, Flag
} from 'lucide-react';
import {
  fetchMarketplaceListings,
  createMarketplaceListing,
  sendMarketplaceInquiry,
  toggleBookmarkListing
} from '../services/economyService';
import { MarketplaceListing, MarketplaceCategory, MarketplaceListingType, MarketplaceItemCondition } from '../types/economy';

const CATEGORIES: { key: MarketplaceCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All Categories' },
  { key: 'plants_seedlings', label: 'Plants & Seedlings' },
  { key: 'seeds_bulbs', label: 'Seeds & Bulbs' },
  { key: 'gardening_tools', label: 'Gardening Tools' },
  { key: 'eco_products', label: 'Eco-Friendly Products' },
  { key: 'recycled_materials', label: 'Recycled Materials' },
  { key: 'equipment_sharing', label: 'Equipment Sharing' },
  { key: 'community_exchange', label: 'Community Exchange' },
];

export const MarketplacePage: React.FC = () => {
  const { user, profile } = useAuth();
  const currentUserId = user?.id;
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Community Neighbor';

  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Detail Modal
  const [activeItem, setActiveItem] = useState<MarketplaceListing | null>(null);

  // Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Create Listing Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'plants_seedlings' as MarketplaceCategory,
    listing_type: 'for_sale' as MarketplaceListingType,
    item_condition: 'new' as MarketplaceItemCondition,
    price: 15,
    currency: 'USD',
    exchange_preference: '',
    description: '',
    image_url: '',
    location_region: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceListings({
        category: selectedCat,
        listingType: selectedType,
        search: searchTerm
      });
      setItems(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [selectedCat, selectedType, searchTerm]);

  const handleBookmark = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    await toggleBookmarkListing(itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_bookmarked: !i.is_bookmarked } : i));
  };

  const handleSendInquiry = async () => {
    if (!activeItem || !inquiryMsg.trim()) return;
    setInquiryLoading(true);
    try {
      await sendMarketplaceInquiry(activeItem.id, inquiryMsg, currentUserName, currentUserId);
      setInquirySuccess(true);
      setTimeout(() => {
        setInquirySuccess(false);
        setShowInquiryModal(false);
        setInquiryMsg('');
      }, 1800);
    } catch {
      // handled
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleCreateListing = async () => {
    setCreateLoading(true);
    try {
      await createMarketplaceListing(createForm, currentUserId, currentUserName);
      setShowCreateModal(false);
      loadListings();
    } catch {
      // handled
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            Green Marketplace & Community Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Trade native saplings, heirloom seeds, eco tools, and share restoration gear with community members.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Create Listing
        </button>
      </div>

      {/* Safety Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-800 flex items-start gap-3">
        <Tag className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Community-First Safe Coordination:</span> Greenverse does not store credit cards or process direct payments. Inquiries allow sellers and community buyers to arrange safe local handoffs, swaps, and seedling pick-ups.
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search marketplace items, plants, tools..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            <option value="all">All Listing Types</option>
            <option value="for_sale">Items for Sale</option>
            <option value="free">Free / Giveaways Only</option>
            <option value="exchange">Tool & Gear Exchange</option>
            <option value="donation">Community Donations</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
          <span className="text-sm text-slate-600">Loading marketplace listings...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No marketplace listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm ${
                      item.listing_type === 'free'
                        ? 'bg-emerald-600 text-white'
                        : item.listing_type === 'exchange'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-900/80 text-white backdrop-blur-sm'
                    }`}>
                      {item.listing_type.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={e => handleBookmark(e, item.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full text-slate-600 shadow-sm transition"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${item.is_bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {item.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.listing_type === 'free' ? 'FREE' : `$${item.price} ${item.currency}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {item.location_region || 'Local Pickup'}
                </span>
                <span>{item.inquiries_count} inquiries</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {activeItem && !showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {activeItem.listing_type.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{activeItem.title}</h2>
                <p className="text-xs text-slate-500">Offered by {activeItem.seller_name}</p>
              </div>
              <button onClick={() => setActiveItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-56 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={activeItem.image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Price</span>
                <span className="font-bold text-emerald-700">
                  {activeItem.listing_type === 'free' ? 'FREE' : `$${activeItem.price} ${activeItem.currency}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Condition</span>
                <span className="font-bold text-slate-700 capitalize">{activeItem.item_condition.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Region</span>
                <span className="font-bold text-slate-700">{activeItem.location_region || 'Local'}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <h4 className="font-semibold text-slate-900">Description</h4>
              <p className="leading-relaxed text-slate-600">{activeItem.description}</p>
              {activeItem.exchange_preference && (
                <div className="bg-amber-50 p-3 rounded-xl text-xs text-amber-800">
                  <strong>Exchange Note:</strong> {activeItem.exchange_preference}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setActiveItem(null)} className="px-3 py-1.5 text-xs text-slate-600">Close</button>
              <button
                onClick={() => setShowInquiryModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message Seller / Inquire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryModal && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Inquire: {activeItem.title}</h3>
            {inquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Inquiry Sent!</p>
                <p className="text-xs text-slate-500 mt-1">The seller will reply to your community inquiry directly.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Your Message to {activeItem.seller_name} *</label>
                    <textarea
                      rows={3}
                      value={inquiryMsg}
                      onChange={e => setInquiryMsg(e.target.value)}
                      placeholder="e.g. Hi! I'm interested in these native saplings. Can I pick them up this Saturday afternoon?"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Your phone and private email remain protected.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setShowInquiryModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button
                    onClick={handleSendInquiry}
                    disabled={inquiryLoading || !inquiryMsg.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {inquiryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Send Message
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">Create Marketplace Listing</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Item Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bare Root Western Red Cedar Saplings (Pack of 5)"
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm(p => ({ ...p, category: e.target.value as MarketplaceCategory }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {CATEGORIES.filter(c => c.key !== 'all').map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Listing Type</label>
                  <select
                    value={createForm.listing_type}
                    onChange={e => setCreateForm(p => ({ ...p, listing_type: e.target.value as MarketplaceListingType }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="for_sale">For Sale</option>
                    <option value="free">Free / Giveaway</option>
                    <option value="exchange">Gear / Tool Exchange</option>
                    <option value="donation">Resource Donation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    disabled={createForm.listing_type === 'free'}
                    value={createForm.price}
                    onChange={e => setCreateForm(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Condition</label>
                  <select
                    value={createForm.item_condition}
                    onChange={e => setCreateForm(p => ({ ...p, item_condition: e.target.value as MarketplaceItemCondition }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={createForm.image_url}
                  onChange={e => setCreateForm(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Location / Neighborhood Region</label>
                <input
                  type="text"
                  placeholder="e.g. East District Hub or Clackamas County"
                  value={createForm.location_region}
                  onChange={e => setCreateForm(p => ({ ...p, location_region: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Item details, age, pickup instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button
                onClick={handleCreateListing}
                disabled={createLoading || !createForm.title || !createForm.description}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {createLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MarketplacePage;
