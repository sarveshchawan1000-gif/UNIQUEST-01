import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusPlace, CampusClub, LostAndFoundItem } from '../../types';
import {
  INITIAL_CAMPUS_PLACES,
  INITIAL_CAMPUS_CLUBS,
  INITIAL_LOST_AND_FOUND,
} from '../../lib/studentLifeData';
import {
  Building2,
  Users2,
  SearchCheck,
  MapPin,
  Clock,
  Phone,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Tag,
  ShieldAlert,
} from 'lucide-react';

export const CampusClubsView: React.FC = () => {
  const { showToast } = useApp();

  type SubTab = 'directory' | 'clubs' | 'lost-found';
  const [activeTab, setActiveTab] = useState<SubTab>('directory');

  const [places] = useState<CampusPlace[]>(INITIAL_CAMPUS_PLACES);
  const [clubs, setClubs] = useState<CampusClub[]>(() => {
    const saved = localStorage.getItem('uniquest_clubs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CAMPUS_CLUBS;
      }
    }
    return INITIAL_CAMPUS_CLUBS;
  });

  const [lostFound, setLostFound] = useState<LostAndFoundItem[]>(() => {
    const saved = localStorage.getItem('uniquest_lost_found');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LOST_AND_FOUND;
      }
    }
    return INITIAL_LOST_AND_FOUND;
  });

  const [search, setSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Report form
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [reportLocation, setReportLocation] = useState('');
  const [reportCategory, setReportCategory] = useState<LostAndFoundItem['category']>('Electronics');
  const [reportDesc, setReportDesc] = useState('');
  const [reportContact, setReportContact] = useState('student@college.edu');

  useEffect(() => {
    localStorage.setItem('uniquest_clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem('uniquest_lost_found', JSON.stringify(lostFound));
  }, [lostFound]);

  const handleToggleClubMembership = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id !== clubId) return c;
        const nextState = !c.isMember;
        showToast(
          nextState ? 'success' : 'info',
          nextState ? `Joined ${c.name}!` : `Left ${c.name}.`
        );
        return { ...c, isMember: nextState };
      })
    );
  };

  const handleToggleClaimStatus = (itemId: string) => {
    setLostFound((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextClaim = !item.claimed;
        showToast('info', nextClaim ? 'Marked as claimed.' : 'Reopened listing.');
        return { ...item, claimed: nextClaim };
      })
    );
  };

  const handleReportItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportLocation.trim()) return;

    const newItem: LostAndFoundItem = {
      id: `lf-${Date.now()}`,
      title: reportTitle.trim(),
      type: reportType,
      location: reportLocation.trim(),
      date: new Date().toISOString().split('T')[0],
      category: reportCategory,
      description: reportDesc.trim() || 'No additional description provided.',
      contactEmail: reportContact.trim(),
      claimed: false,
    };

    setLostFound((prev) => [newItem, ...prev]);
    setIsReportModalOpen(false);
    setReportTitle('');
    setReportLocation('');
    setReportDesc('');
    showToast('success', `Submitted ${reportType} listing for "${newItem.title}".`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Campus Information & Student Life
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Directory of campus facilities, student organizations & events, and lost-and-found board.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Places</span>
            </button>

            <button
              onClick={() => setActiveTab('clubs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'clubs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              <span>Clubs & Orgs</span>
            </button>

            <button
              onClick={() => setActiveTab('lost-found')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'lost-found'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5" />
              <span>Lost & Found</span>
            </button>
          </div>

          {activeTab === 'lost-found' && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Campus Safety & Emergency Dispatch:</strong> Dial (555) 019-9111 • Blue Light Escort Service: (555) 019-SAFE (24/7 on campus)
          </span>
        </div>
        <span className="text-[10px] text-amber-700 font-mono hidden sm:inline">
          Station: Campus Center Tower
        </span>
      </div>

      {/* 1. CAMPUS DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div
              key={place.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{place.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {place.category}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{place.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{place.hours}</span>
                </div>
                {place.contact && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{place.contact}</span>
                  </div>
                )}
              </div>

              {place.notes && (
                <p className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  {place.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. CLUBS DIRECTORY TAB */}
      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                    {club.category}
                  </span>
                  {club.isMember && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Member
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{club.name}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {club.description}
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lead: <strong>{club.lead}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{club.meetingTime}</span>
                  </div>
                </div>

                {club.upcomingEvent && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Upcoming Event
                    </span>
                    <strong className="text-slate-900 block">{club.upcomingEvent.title}</strong>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{club.upcomingEvent.date}</span>
                      <span>{club.upcomingEvent.location}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleToggleClubMembership(club.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    club.isMember
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {club.isMember ? 'Leave Club' : 'Join Society'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LOST & FOUND TAB */}
      {activeTab === 'lost-found' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lostFound.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white border transition-all ${
                  item.claimed
                    ? 'border-slate-200 opacity-60'
                    : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.type === 'found'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>

                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact: {item.contactEmail}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      item.claimed ? 'text-slate-400' : 'text-emerald-700'
                    }`}
                  >
                    {item.claimed ? 'Item Claimed & Closed' : 'Open Listing'}
                  </span>

                  <button
                    onClick={() => handleToggleClaimStatus(item.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    {item.claimed ? 'Reopen' : 'Mark as Claimed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900">Post Lost or Found Listing</h2>
            <form onSubmit={handleReportItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReportType('lost')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                      reportType === 'lost'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('found')}
                    className={`py-1.5 text-xs font-semibold rounded-xl border cursor-pointer ${
                      reportType === 'found'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    I Found an Item
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Lenovo ThinkPad Charger (65W)"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Du Bois Library 2nd floor silent area"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  placeholder="Distinctive marks, stickers, color..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={reportContact}
                  onChange={(e) => setReportContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
