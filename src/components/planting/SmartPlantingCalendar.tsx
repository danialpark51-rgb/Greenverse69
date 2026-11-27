import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  toggleCalendarEventCompleted,
  deleteCalendarEvent,
  fetchUserPlants
} from '../../services/plantIntelligenceService';
import { DbCalendarEvent, DbUserPlant } from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sprout,
  Droplets,
  Scissors,
  Layers,
  Bug,
  Tag,
  AlertCircle,
  X
} from 'lucide-react';

const CATEGORIES: Array<DbCalendarEvent['event_category']> = [
  'Sowing',
  'Seed Starting',
  'Planting',
  'Transplanting',
  'Watering',
  'Fertilizing',
  'Pruning',
  'Harvesting',
  'Pest Check',
  'Custom'
];

export const SmartPlantingCalendar: React.FC = () => {
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<DbCalendarEvent[]>([]);
  const [userPlants, setUserPlants] = useState<DbUserPlant[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DbCalendarEvent['event_category']>('Planting');
  const [newPlantId, setNewPlantId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [evs, plants] = await Promise.all([
      fetchCalendarEvents(user?.id),
      fetchUserPlants(user?.id),
    ]);
    setEvents(evs);
    setUserPlants(plants);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Calendar Grid Navigation Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const currentMonthShortcut = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const handleDateClick = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(formatted);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter an event title.');
      return;
    }
    if (!user?.id) {
      setFormError('You must be logged in to save events.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await createCalendarEvent({
      user_id: user.id,
      plant_id: newPlantId || null,
      title: newTitle.trim(),
      event_category: newCategory,
      event_date: selectedDateStr,
      notes: newNotes.trim() || null,
      is_completed: false,
      reminder_enabled: false,
    });

    setIsSubmitting(false);
    if (res.success && res.data) {
      setEvents((prev) => [...prev, res.data!]);
      setShowAddModal(false);
      setNewTitle('');
      setNewNotes('');
      setNewPlantId('');
    } else {
      setFormError(res.error || 'Failed to save event.');
    }
  };

  const handleToggleComplete = async (eventId: string, current: boolean) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, is_completed: !current } : ev))
    );
    await toggleCalendarEventCompleted(eventId, !current, user?.id);
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    await deleteCalendarEvent(eventId, user?.id);
  };

  // Selected Day's Events
  const selectedDayEvents = events.filter((ev) => ev.event_date === selectedDateStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-forest-700" />
            Smart Planting & Stewardship Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Plan seed starts, transplanting, irrigation schedules, pruning windows, and harvest milestones with RLS isolation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={currentMonthShortcut}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Add Task / Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth} className="p-1.5 h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold text-sm text-slate-900 min-w-36 text-center">
                  {monthNames[month]} {year}
                </span>
                <Button variant="outline" size="sm" onClick={nextMonth} className="p-1.5 h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="emerald" className="text-xs">
                {events.length} Planned Events
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-medium text-[11px] text-slate-400 mb-2">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Blank days before start */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 bg-slate-50/50 rounded-lg border border-transparent" />
                ))}

                {/* Actual days */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = dateString === selectedDateStr;
                  const dayEvents = events.filter((e) => e.event_date === dateString);
                  const isToday = new Date().toISOString().split('T')[0] === dateString;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => handleDateClick(dayNum)}
                      className={`h-16 p-1.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-forest-600 bg-forest-50/40 ring-1 ring-forest-500'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center text-[10px]'
                              : isSelected
                              ? 'text-forest-900'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-lime-500" />
                        )}
                      </div>

                      {/* Mini event tags */}
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 1).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${
                              ev.is_completed
                                ? 'bg-slate-100 text-slate-400 line-through'
                                : 'bg-lime-100 text-forest-800'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 1 && (
                          <div className="text-[9px] text-slate-400 font-mono">
                            +{dayEvents.length - 1} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Agenda (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="border-b border-sage-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Day Schedule</CardTitle>
                  <CardDescription className="text-xs font-mono text-forest-700 font-semibold">
                    {selectedDateStr}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              {loading ? (
                <div className="text-center py-6 text-slate-400">Loading events...</div>
              ) : selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Sprout className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-600">No events scheduled</p>
                  <p className="text-[11px] mt-0.5">Click "Add" above to plan a task for this date.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-lg border transition-all ${
                        ev.is_completed
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-sage-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={ev.is_completed}
                            onChange={() => handleToggleComplete(ev.id, ev.is_completed)}
                            className="mt-0.5 w-4 h-4 rounded text-forest-700 border-slate-300 cursor-pointer"
                          />
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                ev.is_completed ? 'line-through text-slate-500' : 'text-slate-800'
                              }`}
                            >
                              {ev.title}
                            </p>
                            <Badge variant="slate" size="sm" className="mt-1 text-[9px]">
                              {ev.event_category}
                            </Badge>
                            {ev.notes && (
                              <p className="text-[11px] text-slate-500 mt-1">{ev.notes}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-soft-xl border border-sage-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-sage-50 border-b border-sage-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-forest-700" />
                Schedule Planting Task for {selectedDateStr}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sow heirloom tomatoes, Fertilize berry patch"
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Associate Plant (Optional)</label>
                  <select
                    value={newPlantId}
                    onChange={(e) => setNewPlantId(e.target.value)}
                    className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {userPlants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.common_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Sow 1cm deep under row cover, water lightly."
                  className="w-full px-3 py-2 border border-sage-300 rounded-lg text-slate-800"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
