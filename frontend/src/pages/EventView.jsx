import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Edit,
    Trash2,
    Power,
    CheckCircle,
    Clock,
    Globe,
    User
} from 'lucide-react';

const EventView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data);

                if (user.role === 'user') {
                    const regRes = await api.get('/registrations/my-registrations');
                    const myRegs = regRes.data;
                    const registered = myRegs.some(r => r.event_id === parseInt(id));
                    setIsRegistered(registered);
                }
            } catch (err) {
                setError("Failed to load event details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, user]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await api.delete(`/events/${id}`);
                navigate('/');
            } catch (err) {
                alert("Failed to delete event.");
                console.error(err);
            }
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm("Are you sure you want to deactivate this event?")) {
            try {
                await api.put(`/events/${id}/deactivate`);
                navigate('/');
            } catch (err) {
                alert("Failed to deactivate event.");
                console.error(err);
            }
        }
    };

    const handleRegister = async () => {
        try {
            await api.post(`/registrations/${id}`);
            setIsRegistered(true);
        } catch (error) {
            alert(error.response?.data?.detail || "Registration failed");
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-20 glass-card">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">{error}</h3>
            <Link to="/" className="text-indigo-600 mt-4 inline-block font-semibold">Back to Dashboard</Link>
        </div>
    );

    if (!event) return (
        <div className="text-center py-20 glass-card">
            <h3 className="text-xl font-bold text-slate-900">Event not found</h3>
            <Link to="/" className="text-indigo-600 mt-4 inline-block font-semibold">Back to Dashboard</Link>
        </div>
    );

    const isOrganizer = user.role === 'manager' && user.id === event.organizer_id;
    const isAdmin = user.role === 'admin';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 pb-12"
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Events</span>
                </Link>

                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <button
                            onClick={handleDeactivate}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all font-bold text-sm"
                        >
                            <Power size={18} />
                            <span>Deactivate</span>
                        </button>
                    )}
                    {isOrganizer && (
                        <>
                            <Link
                                to={`/events/${id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-bold text-sm"
                            >
                                <Edit size={18} />
                                <span>Edit</span>
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-sm"
                            >
                                <Trash2 size={18} />
                                <span>Delete</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Event Hero Card */}
            <div className="glass-card overflow-hidden">
                <div className="h-64 bg-indigo-600 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold uppercase tracking-wider">
                                {event.event_type}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${event.status === 'published' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                                }`}>
                                {event.status}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{event.title}</h1>
                    </div>
                </div>

                <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Clock size={20} className="text-indigo-600" />
                                About this Event
                            </h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                                {event.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Location</h4>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                                        {event.event_type === 'online' ? <Globe size={20} /> : <MapPin size={20} />}
                                    </div>
                                    <p className="text-slate-700 font-semibold">{event.location || 'Remote / Online'}</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Capacity</h4>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-slate-700 font-semibold">{event.capacity} Attendees</p>
                                        <p className="text-xs text-slate-500">Limited spots available</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 sticky top-8">
                            <h3 className="text-lg font-bold text-indigo-900 mb-6">Event Details</h3>

                            <div className="space-y-6 mb-8">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Date</p>
                                        <p className="text-slate-900 font-bold">{new Date(event.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Time</p>
                                        <p className="text-slate-900 font-bold">{new Date(event.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>

                            {user.role === 'user' && (
                                isRegistered ? (
                                    <div className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100">
                                        <CheckCircle size={20} />
                                        <span>You're Registered</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRegister}
                                        className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                    >
                                        Register Now
                                    </button>
                                )
                            )}

                            {isOrganizer && (
                                <Link
                                    to={`/events/${id}/registrations`}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-indigo-600 border border-indigo-200 font-bold hover:bg-indigo-50 transition-all"
                                >
                                    <Users size={20} />
                                    <span>Manage Attendees</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EventView;
