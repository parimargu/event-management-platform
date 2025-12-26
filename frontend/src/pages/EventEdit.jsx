import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Users,
    Type,
    AlignLeft,
    Clock,
    Globe,
    Save,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';

const EventEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        event_type: 'offline',
        capacity: 0
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                const event = response.data;
                setFormData({
                    title: event.title,
                    description: event.description,
                    start_time: event.start_time.slice(0, 16), // Format for datetime-local
                    end_time: event.end_time.slice(0, 16),
                    location: event.location,
                    event_type: event.event_type,
                    capacity: event.capacity
                });
            } catch (err) {
                setError("Failed to load event details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put(`/events/${id}`, formData);
            navigate(`/events/${id}`);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update event.");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error && !isSaving) return (
        <div className="text-center py-20 glass-card">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">{error}</h3>
            <Link to="/" className="text-indigo-600 mt-4 inline-block font-semibold">Back to Dashboard</Link>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 pb-12"
        >
            <div className="flex items-center justify-between">
                <Link
                    to={`/events/${id}`}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Event</span>
                </Link>
            </div>

            <div className="glass-card p-8 md:p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
                    <p className="text-slate-500 mt-2">Update the details of your event below</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Event Title</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Type size={18} />
                                </div>
                                <input
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    placeholder="e.g. Tech Conference 2024"
                                    className="input-field pl-12"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Description</label>
                            <div className="relative">
                                <div className="absolute top-4 left-4 text-slate-400">
                                    <AlignLeft size={18} />
                                </div>
                                <textarea
                                    name="description"
                                    required
                                    value={formData.description}
                                    placeholder="Describe what your event is about..."
                                    className="input-field pl-12 min-h-[120px] py-3"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Start Date & Time</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        name="start_time"
                                        type="datetime-local"
                                        required
                                        value={formData.start_time}
                                        className="input-field pl-12"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">End Date & Time</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Clock size={18} />
                                    </div>
                                    <input
                                        name="end_time"
                                        type="datetime-local"
                                        required
                                        value={formData.end_time}
                                        className="input-field pl-12"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Location / Meeting Link</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <MapPin size={18} />
                                </div>
                                <input
                                    name="location"
                                    type="text"
                                    required
                                    value={formData.location}
                                    placeholder="e.g. San Francisco, CA or Zoom Link"
                                    className="input-field pl-12"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Type and Capacity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Event Type</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Globe size={18} />
                                    </div>
                                    <select
                                        name="event_type"
                                        value={formData.event_type}
                                        className="input-field pl-12 appearance-none"
                                        onChange={handleChange}
                                    >
                                        <option value="online">Online</option>
                                        <option value="offline">Offline</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Max Capacity</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Users size={18} />
                                    </div>
                                    <input
                                        name="capacity"
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.capacity}
                                        placeholder="100"
                                        className="input-field pl-12"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/events/${id}`)}
                            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 text-lg"
                        >
                            {isSaving ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={24} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EventEdit;
