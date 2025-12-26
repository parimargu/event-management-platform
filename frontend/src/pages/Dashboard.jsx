import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar,
    MapPin,
    Globe,
    Plus,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    ClipboardList
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [pendingManagers, setPendingManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null);
    const [adminComment, setAdminComment] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const eventsRes = await api.get('/events/');
                setEvents(eventsRes.data);

                if (user.role === 'user') {
                    const regRes = await api.get('/registrations/my-registrations');
                    setMyRegistrations(regRes.data);
                }

                if (user.role === 'admin') {
                    const usersRes = await api.get('/users/');
                    setPendingManagers(usersRes.data.filter(u => u.role === 'manager' && !u.is_approved));
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleApproveManager = async (managerId) => {
        try {
            await api.put(`/users/${managerId}/approve`, null, { params: { reason: "Approved by admin" } });
            setPendingManagers(pendingManagers.filter(u => u.id !== managerId));
        } catch (error) {
            console.error("Error approving manager", error);
        }
    };

    const handleRejectManager = async () => {
        if (!selectedManager) return;
        if (!adminComment) {
            alert("Please provide a justification for rejection.");
            return;
        }

        try {
            await api.put(`/users/${selectedManager.id}/reject`, null, { params: { reason: adminComment } });
            setPendingManagers(pendingManagers.filter(u => u.id !== selectedManager.id));
            setSelectedManager(null);
            setAdminComment("");
        } catch (error) {
            console.error("Error rejecting manager", error);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post(`/registrations/${eventId}`);
            setMyRegistrations([...myRegistrations, { event_id: eventId }]);
        } catch (error) {
            alert(error.response?.data?.detail || "Registration failed");
        }
    };

    const isRegistered = (eventId) => {
        return myRegistrations.some(r => r.event_id === eventId);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || event.event_type === filterType;
        const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl shadow-indigo-200"
            >
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-4">
                                Welcome back, {user?.full_name?.split(' ')[0]}!
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                Discover & Join <br />
                                <span className="text-indigo-200">Amazing Events</span>
                            </h1>
                            <p className="text-indigo-10/80 text-lg mt-4 font-medium">
                                Connect with communities, learn new skills, and create unforgettable memories.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap gap-4"
                        >
                            {user.role === 'manager' ? (
                                <Link
                                    to="/events/create"
                                    className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                    Create New Event
                                </Link>
                            ) : user.role === 'user' ? (
                                <Link
                                    to="/my-events"
                                    className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2"
                                >
                                    <ClipboardList size={20} />
                                    My Registrations
                                </Link>
                            ) : (
                                <Link
                                    to="/admin/requests"
                                    className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2"
                                >
                                    <AlertCircle size={20} />
                                    Pending Requests
                                </Link>
                            )}
                            <button className="px-8 py-4 bg-indigo-500/30 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-indigo-500/40 transition-all">
                                Explore All
                            </button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="hidden lg:block relative"
                    >
                        <div className="w-64 h-64 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 flex items-center justify-center shadow-2xl">
                            <Calendar size={100} className="text-white/80" />
                        </div>
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl rotate-12">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Admin Section */}
            {user.role === 'admin' && pendingManagers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 border-amber-100 bg-amber-50/30"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-amber-700">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Manager Approvals</h2>
                                <p className="text-sm text-amber-600/80">You have {pendingManagers.length} pending applications</p>
                            </div>
                        </div>
                        <Link to="/admin/requests" className="text-sm font-bold text-amber-700 hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingManagers.slice(0, 3).map((manager) => (
                            <div key={manager.id} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                            {manager.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{manager.full_name}</p>
                                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{manager.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleApproveManager(manager.id)}
                                        className="flex-1 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedManager(manager)}
                                        className="flex-1 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Filters Section */}
            <div className="glass-card p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search events by title, location, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12 py-4"
                        />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative min-w-[160px]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Globe size={18} />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="input-field pl-12 py-4 text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">All Event Types</option>
                                <option value="online">Online Events</option>
                                <option value="offline">In-Person Events</option>
                            </select>
                        </div>
                        <div className="relative min-w-[160px]">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <Filter size={18} />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-field pl-12 py-4 text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="draft">Drafts</option>
                                <option value="published">Published</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] bg-white border border-slate-100 rounded-[2rem] animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <>
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {paginatedEvents.map((event) => (
                                <motion.div
                                    key={event.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group glass-card overflow-hidden hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col border-slate-100"
                                >
                                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-700"></div>
                                        <div className="absolute top-5 right-5">
                                            <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full backdrop-blur-md border shadow-sm ${event.event_type === 'online'
                                                ? 'bg-blue-500/10 text-blue-600 border-blue-200'
                                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                                }`}>
                                                {event.event_type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-5 left-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm">
                                                <Calendar size={14} />
                                                {new Date(event.start_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                            {event.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                                            {event.description}
                                        </p>

                                        <div className="flex items-center gap-4 mb-8 text-slate-400">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <MapPin size={16} className="text-indigo-500" />
                                                <span className="truncate max-w-[200px]">{event.location || 'Remote'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Link
                                                to={`/events/${event.id}`}
                                                className="flex-1 text-center py-3.5 rounded-2xl text-sm font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
                                            >
                                                View Details
                                            </Link>

                                            {(user.role === 'user' || user.role === 'manager') && event.organizer_id !== user.id && (
                                                isRegistered(event.id) ? (
                                                    <div className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <CheckCircle size={18} />
                                                        <span>Registered</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegister(event.id)}
                                                        className="flex-[1.5] py-3.5 rounded-2xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                                    >
                                                        Join Event
                                                    </button>
                                                )
                                            )}

                                            {user.role === 'manager' && event.organizer_id === user.id && (
                                                <div className="flex-[1.5] text-center py-3.5 rounded-2xl text-sm font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                    Your Event
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 glass-card border-dashed border-2 border-slate-200"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Search size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">No events found</h3>
                            <p className="text-slate-500 mt-2 max-w-xs mx-auto">We couldn't find any events matching your current search or filters.</p>
                            <button
                                onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterStatus("all"); }}
                                className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-200">
                            <p className="text-sm font-medium text-slate-500">
                                Showing <span className="text-slate-900 font-bold">{startIndex + 1}</span> to <span className="text-slate-900 font-bold">{Math.min(startIndex + pageSize, filteredEvents.length)}</span> of <span className="text-slate-900 font-bold">{filteredEvents.length}</span> events
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex items-center gap-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110'
                                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Rejection Modal */}
            <AnimatePresence>
                {selectedManager && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setSelectedManager(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass-card p-8 border-slate-200"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                                    <AlertCircle size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Reject Request</h3>
                            </div>

                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Please provide a clear reason for rejecting <span className="font-bold text-slate-900">{selectedManager.full_name}</span>'s manager application.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Reason for Rejection</label>
                                    <textarea
                                        className="input-field min-h-[140px] resize-none p-4"
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        placeholder="e.g., Insufficient documentation provided..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setSelectedManager(null)}
                                        className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectManager}
                                        className="flex-1 py-4 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-95"
                                    >
                                        Confirm Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
