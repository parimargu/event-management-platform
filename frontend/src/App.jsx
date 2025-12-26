import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventCreate from './pages/EventCreate';
import EventView from './pages/EventView';
import EventEdit from './pages/EventEdit';
import EventRegistrations from './pages/EventRegistrations';
import BecomeManager from './pages/BecomeManager';
import AdminManagerRequests from './pages/AdminManagerRequests';
import MyEvents from './pages/MyEvents';
import MyProfile from './pages/MyProfile';
import ManageUsers from './pages/ManageUsers';
import MyManagerRequest from './pages/MyManagerRequest';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes wrapped in Layout */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/events/create"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EventCreate />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/events/:id"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EventView />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/events/:id/edit"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EventEdit />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/events/:id/registrations"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <EventRegistrations />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/become-manager"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <BecomeManager />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/requests"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <AdminManagerRequests />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-events"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <MyEvents />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <MyProfile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ManageUsers />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/my-manager-request"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <MyManagerRequest />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
