import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Building2,
    FileText,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    ShieldCheck,
    ArrowRight,
    Info
} from 'lucide-react';

const BecomeManager = () => {
    const [isCompany, setIsCompany] = useState(false);
    const [additionalDetails, setAdditionalDetails] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please upload an ID proof.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Upload file first
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await api.post('/users/upload-id-proof', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const filePath = uploadResponse.data.file_path;

            // Then submit manager request with file path
            await api.post('/users/request-upgrade', {
                is_company: isCompany,
                additional_details: additionalDetails,
                id_proof_url: filePath
            });

            navigate('/', { state: { message: "Request submitted successfully! Please wait for admin approval." } });
        } catch (error) {
            console.error("Error submitting request", error);
            setError(error.response?.data?.detail || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 pb-12"
        >
            <div className="text-center space-y-4 mb-10">
                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Become an Event Manager</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    Join our platform as a manager to create and host your own amazing events.
                </p>
            </div>

            <div className="glass-card p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Account Type */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1">Account Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setIsCompany(false)}
                                className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${!isCompany
                                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!isCompany ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Individual</p>
                                    <p className="text-xs opacity-80">Personal account</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsCompany(true)}
                                className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${isCompany
                                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompany ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <Building2 size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">Company</p>
                                    <p className="text-xs opacity-80">Business account</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Professional Background</label>
                        <div className="relative">
                            <div className="absolute top-4 left-4 text-slate-400">
                                <FileText size={18} />
                            </div>
                            <textarea
                                className="input-field pl-12 py-4 min-h-[150px]"
                                value={additionalDetails}
                                onChange={(e) => setAdditionalDetails(e.target.value)}
                                placeholder="Tell us about your experience in event management..."
                                required
                            />
                        </div>
                    </div>

                    {/* ID Proof Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1">Government ID Proof</label>
                        <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all text-center ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:border-indigo-200'
                            }`}>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            <div className="space-y-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                    {file ? <CheckCircle size={32} /> : <Upload size={32} />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">
                                        {file ? file.name : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Valid Government ID (Image or PDF)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-4 rounded-2xl bg-amber-50 text-amber-700 text-sm">
                            <Info size={18} className="shrink-0 mt-0.5" />
                            <p>Your ID proof is required for verification purposes and will be handled securely.</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
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
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Submit Application</span>
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default BecomeManager;
