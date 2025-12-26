import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    Shield,
    ShieldCheck,
    ShieldAlert,
    MoreVertical,
    Eye,
    UserMinus,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    MapPin,
    Calendar,
    AlignLeft,
    Linkedin,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Globe,
    Filter
} from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) {
            return;
        }

        try {
            await api.put(`/users/${userId}/deactivate`);
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
        } catch (error) {
            console.error("Error deactivating user", error);
            alert('Failed to deactivate user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
            className="max-w-7xl mx-auto space-y-8 pb-12"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-2">Oversee all platform users, roles, and account statuses</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 py-2.5 w-full md:w-72"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700">Show:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-indigo-600 focus:outline-none cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode='popLayout'>
                                {paginatedUsers.map((user, index) => (
                                    <motion.tr
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={user.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{user.full_name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin'
                                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                : user.role === 'manager'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {user.role === 'admin' ? <Shield size={12} /> : user.role === 'manager' ? <ShieldCheck size={12} /> : <User size={12} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.is_active
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-red-50 text-red-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {user.is_active && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Deactivate User"
                                                    >
                                                        <UserMinus size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to <span className="font-bold text-slate-900">{Math.min(endIndex, filteredUsers.length)}</span> of <span className="font-bold text-slate-900">{filteredUsers.length}</span> users
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page >= currentPage + 1)) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === page
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                                : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card w-full max-w-2xl p-0 overflow-hidden relative z-10"
                        >
                            {/* Modal Header */}
                            <div className="bg-indigo-600 p-8 text-white relative">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold">
                                        {selectedUser.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedUser.full_name}</h3>
                                        <p className="text-indigo-100 flex items-center gap-1.5 mt-1">
                                            <Mail size={16} />
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Info</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Phone size={16} />
                                                    </div>
                                                    <span className="font-medium">{selectedUser.phone || 'No phone provided'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Shield size={16} />
                                                    </div>
                                                    <span className="font-medium capitalize">{selectedUser.role}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Globe size={16} />
                                                    </div>
                                                    <span className="font-medium">
                                                        {selectedUser.city ? `${selectedUser.city}, ${selectedUser.country}` : 'No location set'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-medium">{selectedUser.gender || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-700">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <span className="font-medium">{selectedUser.dob || 'No date of birth'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About</h4>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                                    {selectedUser.about_me || "This user hasn't added a bio yet."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Presence</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedUser.linkedin_url && (
                                                    <a href={selectedUser.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                                                        <Linkedin size={20} />
                                                    </a>
                                                )}
                                                {selectedUser.twitter_url && (
                                                    <a href={selectedUser.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all">
                                                        <Twitter size={20} />
                                                    </a>
                                                )}
                                                {selectedUser.instagram_url && (
                                                    <a href={selectedUser.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600 rounded-xl transition-all">
                                                        <Instagram size={20} />
                                                    </a>
                                                )}
                                                {selectedUser.facebook_url && (
                                                    <a href={selectedUser.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                                                        <Facebook size={20} />
                                                    </a>
                                                )}
                                                {selectedUser.youtube_url && (
                                                    <a href={selectedUser.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                                                        <Youtube size={20} />
                                                    </a>
                                                )}
                                                {!(selectedUser.linkedin_url || selectedUser.twitter_url || selectedUser.instagram_url || selectedUser.facebook_url || selectedUser.youtube_url) && (
                                                    <p className="text-sm text-slate-400 italic">No social links provided.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-8 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all"
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

export default ManageUsers;
