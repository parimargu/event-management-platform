import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Phone,
    MapPin,
    Calendar,
    Linkedin,
    Youtube,
    Facebook,
    Twitter,
    Instagram,
    AlignLeft,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Globe,
    UserCircle
} from 'lucide-react';

const MyProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        gender: '',
        dob: '',
        linkedin_url: '',
        youtube_url: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        about_me: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                city: user.city || '',
                state: user.state || '',
                country: user.country || '',
                gender: user.gender || '',
                dob: user.dob || '',
                linkedin_url: user.linkedin_url || '',
                youtube_url: user.youtube_url || '',
                facebook_url: user.facebook_url || '',
                twitter_url: user.twitter_url || '',
                instagram_url: user.instagram_url || '',
                about_me: user.about_me || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.put('/users/me', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to update profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-12"
        >
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 mt-2">Manage your personal information and social presence</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="glass-card p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <UserCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Gender</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="input-field pl-12 appearance-none"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="glass-card p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <MapPin size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Location</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="San Francisco"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">State / Province</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="California"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Country</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Globe size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="United States"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="glass-card p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Social Presence</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">LinkedIn</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Linkedin size={18} />
                                </div>
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Twitter / X</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Twitter size={18} />
                                </div>
                                <input
                                    type="url"
                                    name="twitter_url"
                                    value={formData.twitter_url}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Instagram</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Instagram size={18} />
                                </div>
                                <input
                                    type="url"
                                    name="instagram_url"
                                    value={formData.instagram_url}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">YouTube</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Youtube size={18} />
                                </div>
                                <input
                                    type="url"
                                    name="youtube_url"
                                    value={formData.youtube_url}
                                    onChange={handleChange}
                                    className="input-field pl-12"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Me */}
                <div className="glass-card p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <AlignLeft size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">About Me</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                        <textarea
                            name="about_me"
                            value={formData.about_me}
                            onChange={handleChange}
                            rows="4"
                            className="input-field py-3 min-h-[120px]"
                            placeholder="Tell us a bit about yourself..."
                        />
                    </div>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-3 font-bold"
                        >
                            <CheckCircle size={20} />
                            <span>Profile updated successfully!</span>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 font-bold"
                        >
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-10 py-4 flex items-center gap-2 text-lg"
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={24} />
                                <span>Save Profile</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default MyProfile;
