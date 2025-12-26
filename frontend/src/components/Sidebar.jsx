import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    User,
    Settings,
    LogOut,
    LayoutDashboard,
    Users,
    ClipboardList,
    PlusCircle,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ onMobileClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const NavItem = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            onClick={onMobileClose}
            className={`group flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${isActive(to)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                }`}
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon size={20} className={isActive(to) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} />}
                <span>{children}</span>
            </div>
            {isActive(to) && <ChevronRight size={16} />}
        </Link>
    );

    return (
        <div className="flex flex-col w-72 bg-white border-r border-slate-200 h-full">
            <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Calendar size={24} />
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Evently</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto py-6 px-4 custom-scrollbar">
                <nav className="space-y-2">
                    <div className="pb-2">
                        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                            Main Menu
                        </p>
                    </div>
                    <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>

                    {/* Links for non-admin users only */}
                    {user?.role !== 'admin' && (
                        <>
                            <div className="pt-6 pb-2">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                    Personal
                                </p>
                            </div>
                            <NavItem to="/my-events" icon={ClipboardList}>My Events</NavItem>
                            <NavItem to="/my-profile" icon={User}>My Profile</NavItem>

                            {(user?.role === 'user' || user?.role === 'manager') && (
                                <NavItem to="/my-manager-request" icon={Settings}>Manager Request</NavItem>
                            )}
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <div className="pt-6 pb-2">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                    Administration
                                </p>
                            </div>
                            <NavItem to="/admin/users" icon={Users}>Manage Users</NavItem>
                            <NavItem to="/admin/requests" icon={PlusCircle}>Manager Requests</NavItem>
                        </>
                    )}

                    {user?.role === 'user' && (
                        <>
                            <div className="pt-6 pb-2">
                                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                    Actions
                                </p>
                            </div>
                            <NavItem to="/become-manager" icon={PlusCircle}>Become Manager</NavItem>
                        </>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.full_name}</p>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                <ShieldCheck size={10} />
                                {user?.role}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
