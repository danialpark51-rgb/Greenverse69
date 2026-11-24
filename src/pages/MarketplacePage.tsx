import React, { useState } from 'react';
import { MOCK_MARKETPLACE } from '../data/mockData';
import { MarketplaceItem } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  ShoppingBag,
  Star,
  CheckCircle2,
  Package,
  Sparkles,
  Coins,
  ShieldCheck,
  ShoppingCart
} from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [cart, setCart] = useState<{ item: MarketplaceItem; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const categories = [
    'all',
    'Certified Native Saplings',
    'Soil Bio-Amendments',
    'IoT Sensors',
    'Protective Gear',
  ];

  const filteredItems = MOCK_MARKETPLACE.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (item: MarketplaceItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) => (p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { item, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const totalVerd = cart.reduce((acc, curr) => acc + curr.item.priceVerd * curr.qty, 0);
  const totalUsd = cart.reduce((acc, curr) => acc + curr.item.priceUsd * curr.qty, 0);

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCart([]);
      setIsCartOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-forest-700" />
            Green Marketplace & Restoration Supplies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Certified native genetics, mycorrhizal inoculants, long-range IoT sensors, and biodegradable guards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            Cart
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-forest-rich text-white text-[10px] font-bold flex items-center justify-center -mr-1">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search saplings, fungal inoculum, sensors..."
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                categoryFilter === cat
                  ? 'bg-forest-rich text-white border-forest-moss shadow-sm'
                  : 'bg-white text-slate-600 border-sage-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <Card key={item.id} hoverEffect className="overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  <Badge variant="lime" size="sm">
                    {item.carbonBadge}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.category}</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {item.rating} ({item.reviewsCount})
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 flex items-baseline justify-between">
                  <div className="text-base font-bold text-forest-800">
                    {item.priceVerd} <span className="text-xs text-forest-600 font-normal">$VERD</span>
                  </div>
                  <div className="text-xs text-slate-400">or ${item.priceUsd} USD</div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Shopping Cart Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Restoration Cart"
        description="Pay with $VERD tokens or conventional payment."
      >
        {checkoutSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Order Placed Successfully!</h4>
            <p className="text-xs text-slate-500">
              Shipment confirmation and digital tracking code dispatched to your profile.
            </p>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Your restoration cart is empty.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {cart.map(({ item, qty }) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{item.title}</div>
                    <div className="text-[11px] text-slate-400">Qty: {qty} × {item.priceVerd} $VERD</div>
                  </div>
                  <div className="font-bold text-forest-800">{item.priceVerd * qty} $VERD</div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-sage-50 rounded-lg border border-sage-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-forest-700">{totalVerd} $VERD (or ${totalUsd} USD)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
              <Button variant="lime" size="sm" onClick={handleCheckout}>
                Pay with $VERD
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
