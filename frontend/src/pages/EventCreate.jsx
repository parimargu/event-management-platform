import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    Plus,
    ArrowLeft,
    Loader2
} from 'lucide-react';

const EventCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        event_type: 'online',
        capacity: 100
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/events/', formData);
            navigate('/');
        } catch (error) {
            alert('Failed to create event');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 pb-12"
        >
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            <div className="glass-card p-8 md:p-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
                    <p className="text-slate-500 mt-2">Fill in the details below to host your next amazing event</p>
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
                                        placeholder="100"
                                        className="input-field pl-12"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <Plus size={24} />
                                    <span>Create Event</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default EventCreate;
