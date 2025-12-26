import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Building2,
    FileText,
    ExternalLink,
    Check,
    X,
    AlertCircle,
    Loader2,
    ShieldCheck,
    MessageSquare,
    Clock,
    UserCheck,
    UserX
} from 'lucide-react';

const AdminManagerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminComment, setAdminComment] = useState("");
    const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/users/pending-managers');
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedRequest || !actionType) return;
        if (actionType === 'reject' && !adminComment) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            const endpoint = `/users/${selectedRequest.id}/${actionType}`;
            // Send reason as query parameter for both approve and reject
            await api.put(endpoint, null, { params: { reason: adminComment || '' } });

            // Remove from list
            setRequests(requests.filter(r => r.id !== selectedRequest.id));
            closeModal();
        } catch (error) {
            console.error(`Error ${actionType}ing request`, error);
            alert(`Failed to ${actionType} request.`);
        }
    };

    const openModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setAdminComment("");
    };

    const closeModal = () => {
        setSelectedRequest(null);
        setActionType(null);
        setAdminComment("");
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-8 pb-12"
        >
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Manager Applications</h1>
                <p className="text-slate-500 mt-2">Review and approve requests from users to become event managers</p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No pending manager applications at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {requests.map((req, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                key={req.id}
                                className="glass-card p-6 md:p-8 group hover:border-indigo-200 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                                {req.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{req.full_name}</h3>
                                                <p className="text-slate-500 flex items-center gap-1.5">
                                                    <Mail size={14} />
                                                    {req.email}
                                                </p>
                                            </div>
                                            <span className={`ml-auto md:ml-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${req.is_company ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {req.is_company ? <Building2 size={14} /> : <User size={14} />}
                                                {req.is_company ? "Company" : "Individual"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <FileText size={12} />
                                                    Additional Details
                                                </p>
                                                <p className="text-slate-700 text-sm leading-relaxed">
                                                    {req.additional_details || "No details provided."}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <ShieldCheck size={12} />
                                                    Verification Document
                                                </p>
                                                {req.id_proof_url ? (
                                                    <a
                                                        href={`http://localhost:8000${req.id_proof_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-indigo-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                                                    >
                                                        <ExternalLink size={16} />
                                                        View ID Proof
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-400 text-sm italic">No document uploaded.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3">
                                        <button
                                            onClick={() => openModal(req, 'approve')}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                        >
                                            <Check size={18} />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => openModal(req, 'reject')}
                                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-red-600 border border-red-100 font-bold hover:bg-red-50 transition-all"
                                        >
                                            <X size={18} />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-md p-8 relative z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionType === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {actionType === 'approve' ? <UserCheck size={20} /> : <UserX size={20} />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 capitalize">{actionType} Request</h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <p className="text-slate-600 mb-6">
                                Are you sure you want to {actionType} <span className="font-bold text-slate-900">{selectedRequest.full_name}</span>'s application?
                            </p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                                        <MessageSquare size={14} />
                                        {actionType === 'reject' ? 'Reason for Rejection (Required)' : 'Comment (Optional)'}
                                    </label>
                                    <textarea
                                        className="input-field min-h-[120px] py-3"
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        placeholder={actionType === 'reject' ? "e.g. ID proof is not clear..." : "e.g. Welcome to the team!"}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAction}
                                        disabled={actionType === 'reject' && !adminComment}
                                        className={`flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-100'
                                            }`}
                                    >
                                        Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
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

export default AdminManagerRequests;
