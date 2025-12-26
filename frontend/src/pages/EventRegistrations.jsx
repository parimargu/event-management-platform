import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Mail,
    Hash,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Search,
    AlertCircle,
    X,
    Check,
    MoreVertical
} from 'lucide-react';

const EventRegistrations = () => {
    const { id } = useParams();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReg, setSelectedReg] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const response = await api.get(`/registrations/events/${id}`);
                setRegistrations(response.data);
            } catch (err) {
                setError("Failed to load registrations.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [id]);

    const handleConfirm = async (regId) => {
        try {
            await api.put(`/registrations/${regId}/confirm`);
            setRegistrations(registrations.map(r =>
                r.id === regId ? { ...r, status: 'approved', rejection_reason: null } : r
            ));
        } catch (error) {
            console.error("Error confirming registration", error);
            alert("Failed to confirm registration");
        }
    };

    const handleReject = async () => {
        if (!selectedReg || !rejectReason) return;
        try {
            await api.put(`/registrations/${selectedReg.id}/reject`, null, { params: { reason: rejectReason } });
            setRegistrations(registrations.map(r =>
                r.id === selectedReg.id ? { ...r, status: 'rejected', rejection_reason: rejectReason } : r
            ));
            setSelectedReg(null);
            setRejectReason("");
        } catch (error) {
            console.error("Error rejecting registration", error);
            alert("Failed to reject registration");
        }
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.confirmation_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-12"
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Registered Attendees</h1>
                        <p className="text-slate-500 mt-2">Manage and review all registrations for this event</p>
                    </div>

                    <div className="relative max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="input-field pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <User size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">No registrations found matching your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-8 md:-mx-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Attendee</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmation ID</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode='popLayout'>
                                    {filteredRegistrations.map((reg) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={reg.id}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {reg.user?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{reg.user?.full_name || 'N/A'}</p>
                                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {reg.user?.email || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg w-fit">
                                                    <Hash size={14} />
                                                    {reg.confirmation_id || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                            reg.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                'bg-red-50 text-red-600 border border-red-100'
                                                        }`}>
                                                        {reg.status === 'approved' && <CheckCircle size={14} />}
                                                        {reg.status === 'pending' && <Clock size={14} />}
                                                        {reg.status === 'rejected' && <XCircle size={14} />}
                                                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                                    </span>
                                                    {reg.rejection_reason && (
                                                        <p className="text-xs text-red-500 max-w-[200px] truncate" title={reg.rejection_reason}>
                                                            {reg.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm text-slate-600 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {new Date(reg.registration_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {reg.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleConfirm(reg.id)}
                                                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedReg(reg)}
                                                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {selectedReg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReg(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-md p-8 relative z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Reject Registration</h3>
                                <button
                                    onClick={() => setSelectedReg(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <p className="text-slate-600 mb-6">
                                Please provide a reason for rejecting <span className="font-bold text-slate-900">{selectedReg.user?.full_name}</span>.
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason</label>
                                    <textarea
                                        className="input-field min-h-[120px] py-3"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="e.g. Event is at full capacity for this role..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedReg(null)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={!rejectReason}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default EventRegistrations;
