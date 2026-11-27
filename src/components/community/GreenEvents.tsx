import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Sprout,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Compass,
  X,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { GreenEvent, EventRSVP } from '../../types/community';
import { getEvents, createEvent, rsvpEvent, deleteEvent } from '../../services/communityService';
import { InteractiveMap, MapMarkerItem } from '../map/InteractiveMap';

interface GreenEventsProps {
  currentUserId?: string;
}

export const GreenEvents: React.FC<GreenEventsProps> = ({ currentUserId }) => {
  const [events, setEvents] = useState<GreenEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GreenEvent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'planting_drive' as string,
    start_time: '',
    end_time: '',
    location_name: '',
    latitude: 44.9778,
    longitude: -93.2650,
    target_trees: 50,
    max_participants: 30,
    cover_image: '',
    requirements: 'Bring comfortable gardening gloves, sturdy closed-toe boots, and a reusable water bottle.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRSVP = async (eventId: string, status: 'going' | 'interested') => {
    try {
      const currentEv = events.find(e => e.id === eventId);
      const newStatus = currentEv?.user_rsvp_status === status ? 'not_going' : status;
      await rsvpEvent(eventId, currentUserId || 'demo-user-id', newStatus);
      await loadData();
      if (selectedEvent && selectedEvent.id === eventId) {
        setSelectedEvent((prev: GreenEvent | null) => (prev ? { ...prev, user_rsvp_status: newStatus === 'not_going' ? null : newStatus } : null));
      }
    } catch (err) {
      console.error('Failed to update RSVP:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please enter an event title');
      return;
    }
    if (!formData.start_time) {
      setFormError('Please choose a start date & time');
      return;
    }
    if (!formData.location_name.trim()) {
      setFormError('Please specify the event location');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await createEvent(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.event_type,
          event_date: formData.start_time.split('T')[0] || new Date().toISOString().split('T')[0],
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          location_name: formData.location_name.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
          max_participants: Number(formData.max_participants) || 50,
        },
        currentUserId || 'demo-user-id',
        'Greenverse Organizer'
      );

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        event_type: 'planting_drive',
        start_time: '',
        end_time: '',
        location_name: '',
        latitude: 44.9778,
        longitude: -93.2650,
        target_trees: 50,
        max_participants: 30,
        cover_image: '',
        requirements: 'Gardening gloves, sturdy shoes, reusable water bottle',
      });
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    const evType = ev.event_type || ev.category;
    const matchesType = filterType === 'all' || evType === filterType || evType.toLowerCase().includes(filterType.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Map markers from events with coordinates
  const mapMarkers: MapMarkerItem[] = filteredEvents
    .filter(ev => ev.latitude && ev.longitude)
    .map(ev => {
      const typeStr = ev.event_type || ev.category || 'EVENT';
      return {
        id: ev.id,
        lat: ev.latitude!,
        lng: ev.longitude!,
        title: ev.title,
        subtitle: `${new Date(ev.start_time).toLocaleDateString()} • ${ev.location_name}`,
        badge: typeStr.replace('_', ' ').toUpperCase(),
        variant: typeStr === 'planting_drive' || typeStr.toLowerCase().includes('tree') ? 'emerald' : 'blue',
        data: ev,
      };
    });

  const handleCancelOrDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel and remove this event?')) return;
    try {
      await deleteEvent(eventId, currentUserId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to cancel event:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Community Field Mobilization
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Green Events & Planting Drives</h2>
            <p className="text-sm text-slate-600 mt-1">
              Join live local tree planting initiatives, seedling swaps, and environmental canopy audits powered by OpenStreetMap coordinates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map View
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Host Event
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by event title, location, or focus..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Event Types</option>
              <option value="planting_drive">Planting Drive</option>
              <option value="cleanup">Cleanup</option>
              <option value="seedling_swap">Seedling Swap</option>
              <option value="workshop">Workshop</option>
              <option value="canopy_audit">Canopy Audit</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Timelines</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Happening Now</option>
              <option value="completed">Past Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Event Coordinates on OpenStreetMap ({mapMarkers.length} locations)
            </div>
            <span className="text-xs text-slate-500">Click any marker to inspect event details</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <InteractiveMap
              center={[44.9778, -93.2650]}
              zoom={11}
              height="480px"
              markers={mapMarkers}
              onMarkerClick={(marker) => {
                if (marker.data) {
                  setSelectedEvent(marker.data);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Grid View */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Loading scheduled green events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No events found</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
            There are currently no events matching your filter criteria. Be the first to mobilize your community!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Host an Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => {
            const startDate = new Date(event.start_time);
            const isGoing = event.user_rsvp_status === 'going';
            const isInterested = event.user_rsvp_status === 'interested';

            const handleCancelOrDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel and remove this event?')) return;
    try {
      await deleteEvent(eventId, currentUserId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to cancel event:', err);
    }
  };

  return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Event Image / Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={event.cover_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                      {(event.event_type || event.category).replace('_', ' ')}
                    </span>
                  </div>

                  {/* Date pill */}
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                    <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-center shadow-md">
                      <div className="text-[10px] font-bold uppercase leading-none">
                        {startDate.toLocaleString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-base font-extrabold leading-none mt-0.5">
                        {startDate.getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/90 font-medium">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[11px] text-white/70">
                        {event.status === 'upcoming' ? 'Scheduled' : event.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedEvent(event)}
                      className="font-bold text-slate-900 text-lg hover:text-emerald-700 cursor-pointer line-clamp-1 mb-2"
                    >
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location_name}</span>
                      </div>
                      {event.target_trees && event.target_trees > 0 && (
                        <div className="flex items-center gap-2 text-emerald-700 font-medium">
                          <Sprout className="w-3.5 h-3.5 shrink-0" />
                          <span>Goal: {event.target_trees} Trees to Plant</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {event.current_participants_count || event.current_rsvp_count || 0} {event.max_participants ? `/ ${event.max_participants}` : ''} attending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5"
                    >
                      View Details
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRSVP(event.id, 'interested')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isInterested
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Interested
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, 'going')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isGoing
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isGoing && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isGoing ? 'Attending' : 'RSVP Going'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="relative h-56 bg-slate-100">
              <img
                src={selectedEvent.cover_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-slate-900 shadow">
                  {(selectedEvent.event_type || selectedEvent.category).replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedEvent.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{new Date(selectedEvent.start_time).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{selectedEvent.location_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{selectedEvent.current_participants_count || selectedEvent.current_rsvp_count || 0} confirmed attendees</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">About this initiative</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Participant Requirements & Gear</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedEvent.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Map Preview if coordinates present */}
              {selectedEvent.latitude && selectedEvent.longitude && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    Location Map (OpenStreetMap)
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <InteractiveMap
                      center={[selectedEvent.latitude, selectedEvent.longitude]}
                      zoom={14}
                      height="200px"
                      enableClickToPick={false}
                      enableSearch={false}
                      markers={[{
                        id: selectedEvent.id,
                        lat: selectedEvent.latitude,
                        lng: selectedEvent.longitude,
                        title: selectedEvent.title,
                        subtitle: selectedEvent.location_name,
                        variant: 'emerald',
                      }]}
                    />
                  </div>
                </div>
              )}

              {/* Footer RSVP Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Status: <strong className="capitalize text-slate-700">{selectedEvent.user_rsvp_status || 'No RSVP'}</strong>
                </span>
                <div className="flex items-center gap-2">
                  {currentUserId && selectedEvent.organizer_id === currentUserId && (
                    <button
                      onClick={() => handleCancelOrDeleteEvent(selectedEvent.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                    >
                      Cancel Event
                    </button>
                  )}
                  <button
                    onClick={() => handleRSVP(selectedEvent.id, 'interested')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                      selectedEvent.user_rsvp_status === 'interested'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Interested
                  </button>
                  <button
                    onClick={() => handleRSVP(selectedEvent.id, 'going')}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold ${
                      selectedEvent.user_rsvp_status === 'going'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {selectedEvent.user_rsvp_status === 'going' ? 'Going (Cancel)' : 'Attend Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Host Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Host a Green Event</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mobilize volunteers for tree planting, cleanups, or workshops</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mississippi Riverbank Native Canopy Restoration"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={e => setFormData({ ...formData, event_type: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="planting_drive">Planting Drive</option>
                    <option value="cleanup">Cleanup</option>
                    <option value="seedling_swap">Seedling Swap</option>
                    <option value="workshop">Workshop</option>
                    <option value="canopy_audit">Canopy Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Trees</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.target_trees}
                    onChange={e => setFormData({ ...formData, target_trees: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={e => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location Name & Address *</label>
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={e => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g. Mill Ruins Park, Minneapolis, MN"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Map coordinate picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pin Exact Location on OpenStreetMap
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <InteractiveMap
                    center={[formData.latitude, formData.longitude]}
                    zoom={12}
                    height="220px"
                    enableClickToPick={true}
                    enableSearch={true}
                    selectedLocation={{ lat: formData.latitude, lng: formData.longitude }}
                    onLocationSelect={(loc) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: loc.lat,
                        longitude: loc.lng,
                        location_name: prev.location_name || loc.address,
                      }));
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Selected coords: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
                  <span>Click anywhere on the map to drop pin</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe the planting goal, species, meeting point, and what attendees should expect..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Gardening gloves, sturdy shoes, reusable water bottle"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating Event...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
