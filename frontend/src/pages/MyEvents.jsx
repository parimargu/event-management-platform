import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    QrCode,
    ExternalLink,
    AlertCircle,
    Ticket,
    X,
    Hash
} from 'lucide-react';

const MyEvents = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegistration, setSelectedRegistration] = useState(null);

    useEffect(() => {
        const fetchMyRegistrations = async () => {
            try {
                const response = await api.get('/registrations/my-registrations');
                setRegistrations(response.data);
            } catch (err) {
                setError("Failed to load your registered events.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyRegistrations();
    }, []);

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
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">My Registered Events</h1>
                <p className="text-slate-500 mt-2">Manage your registrations and access your event tickets</p>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">You haven't registered for any events yet.</p>
                    <Link to="/" className="btn-primary mt-6 inline-flex items-center gap-2">
                        Browse Events
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {registrations.map((reg, index) => (
                            <motion.div
                                key={reg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card overflow-hidden flex flex-col"
                            >
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                reg.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {reg.status === 'approved' && <CheckCircle size={14} />}
                                            {reg.status === 'pending' && <Clock size={14} />}
                                            {reg.status === 'rejected' && <XCircle size={14} />}
                                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                        </span>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            ID: {reg.event_id}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            Registered on {new Date(reg.registration_date).toLocaleDateString()}
                                        </p>
                                        {reg.confirmation_id && (
                                            <div className="flex items-center gap-2 text-slate-600 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                                                <Hash size={14} className="text-slate-400" />
                                                {reg.confirmation_id}
                                            </div>
                                        )}
                                    </div>

                                    {reg.rejection_reason && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                            <p className="text-xs text-red-600 font-medium">
                                                <span className="font-bold">Reason:</span> {reg.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                                    <Link
                                        to={`/events/${reg.event_id}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-indigo-600 border border-indigo-100 font-bold text-sm hover:bg-indigo-50 transition-all"
                                    >
                                        <ExternalLink size={16} />
                                        <span>Details</span>
                                    </Link>
                                    {reg.status === 'approved' && reg.confirmation_id && (
                                        <button
                                            onClick={() => setSelectedRegistration(reg)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                                        >
                                            <QrCode size={16} />
                                            <span>Ticket</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* QR Code Modal */}
            <AnimatePresence>
                {selectedRegistration && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedRegistration(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-sm p-8 relative z-10 text-center"
                        >
                            <button
                                onClick={() => setSelectedRegistration(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>

                            <div className="mb-8">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                    <Ticket size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Event Ticket</h3>
                                <p className="text-slate-500 text-sm mt-1">Show this at the entrance</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 shadow-sm inline-block">
                                    <QRCodeSVG
                                        value={selectedRegistration.confirmation_id}
                                        size={180}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confirmation ID</p>
                                    <p className="text-lg font-mono font-bold text-slate-900">{selectedRegistration.confirmation_id}</p>
                                </div>

                                <button
                                    onClick={() => setSelectedRegistration(null)}
                                    className="w-full py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyEvents;
