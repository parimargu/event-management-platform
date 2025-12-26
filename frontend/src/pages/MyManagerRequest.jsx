import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Eye,
    X,
    ShieldCheck,
    Building2,
    User,
    MessageSquare,
    ArrowRight,
    Info
} from 'lucide-react';

const MyManagerRequest = () => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showProofModal, setShowProofModal] = useState(false);

    useEffect(() => {
        fetchRequest();
    }, []);

    const fetchRequest = async () => {
        try {
            const response = await api.get('/users/my-manager-request');
            setRequest(response.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("No manager request found. You haven't requested to become an Event Manager yet.");
            } else {
                setError("Failed to load request details.");
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto py-12 px-4"
            >
                <div className="glass-card p-12 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                        <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">No Request Found</h2>
                        <p className="text-slate-500 max-w-md mx-auto">{error}</p>
                    </div>
                    <a
                        href="/become-manager"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        Apply Now
                        <ArrowRight size={18} />
                    </a>
                </div>
            </motion.div>
        );
    }

    const getStatusConfig = () => {
        if (request.is_approved) return {
            icon: <CheckCircle2 size={24} />,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            label: 'Approved',
            message: 'Congratulations! Your request has been approved. You can now create and manage events.'
        };
        if (request.rejection_reason) return {
            icon: <XCircle size={24} />,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100',
            label: 'Rejected',
            message: `Your request was not approved. Reason: ${request.rejection_reason}`
        };
        return {
            icon: <Clock size={24} />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            label: 'Pending Review',
            message: 'Your request is currently being reviewed by our administrative team.'
        };
    };

    const status = getStatusConfig();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-12"
        >
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Manager Application</h1>
                <p className="text-slate-500 mt-2">Track the status of your event manager request</p>
            </div>

            {/* Status Card */}
            <div className={`glass-card p-8 border-l-4 ${status.border} shadow-sm`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${status.bg} ${status.color} flex items-center justify-center`}>
                            {status.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                            <h3 className={`text-2xl font-bold ${status.color}`}>{status.label}</h3>
                        </div>
                    </div>
                    <div className="flex-1 max-w-md">
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {status.message}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Details Section */}
                <div className="md:col-span-2 space-y-8">
                    <div className="glass-card p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                            <Info size={20} className="text-indigo-600" />
                            <h3 className="text-xl font-bold text-slate-900">Application Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck size={12} />
                                    Account Type
                                </p>
                                <div className="flex items-center gap-2 text-slate-700 font-bold">
                                    {request.is_company ? <Building2 size={18} className="text-indigo-500" /> : <User size={18} className="text-indigo-500" />}
                                    {request.is_company ? 'Company' : 'Individual'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={12} />
                                    ID Verification
                                </p>
                                {request.id_proof_url ? (
                                    <button
                                        onClick={() => setShowProofModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-indigo-600 font-bold text-sm hover:bg-slate-100 transition-all"
                                    >
                                        <Eye size={16} />
                                        View Document
                                    </button>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No document uploaded</p>
                                )}
                            </div>

                            <div className="sm:col-span-2 space-y-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare size={12} />
                                    Additional Information
                                </p>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {request.additional_details || "No additional details provided."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-8">
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                            <MessageSquare size={20} className="text-indigo-600" />
                            <h3 className="text-xl font-bold text-slate-900">Admin Feedback</h3>
                        </div>

                        {request.admin_comment || request.rejection_reason ? (
                            <div className="space-y-4">
                                {request.rejection_reason && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Rejection Reason</p>
                                        <p className="text-red-600 text-sm font-medium bg-red-50 p-4 rounded-2xl border border-red-100">
                                            {request.rejection_reason}
                                        </p>
                                    </div>
                                )}
                                {request.admin_comment && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments</p>
                                        <p className="text-slate-700 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {request.admin_comment}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-400 text-sm italic">No feedback yet. Your application is in the queue.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ID Proof Modal */}
            <AnimatePresence>
                {showProofModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProofModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-4xl p-0 overflow-hidden relative z-10"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Verification Document</h3>
                                </div>
                                <button
                                    onClick={() => setShowProofModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="p-4 bg-slate-100 flex justify-center min-h-[60vh]">
                                {request.id_proof_url?.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={`http://localhost:8000${request.id_proof_url}`}
                                        className="w-full h-[70vh] rounded-xl border-none shadow-lg"
                                        title="ID Proof PDF"
                                    />
                                ) : (
                                    <img
                                        src={`http://localhost:8000${request.id_proof_url}`}
                                        alt="ID Proof"
                                        className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EDocument Preview Not Available%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                )}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setShowProofModal(false)}
                                    className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MyManagerRequest;
