import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Shield, Lock, Activity, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-rose-100 p-4 rounded-full">
            <Shield className="w-10 h-10 text-rose-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Security Console</h1>
        <p className="text-center text-slate-500 mb-8">Authenticate to access telemetry data</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secure Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
          >
            {loading ? 'Authenticating...' : <><Lock className="w-4 h-4" /> Secure Login</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: hData } = await supabase.from('history').select('*').order('date', { ascending: true });
      if (hData) setHistory(hData);

      const { data: tData } = await supabase.from('tasks').select('*').order('time', { ascending: true });
      if (tData) setTasks(tData);
    }
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const totals = history.reduce((acc, curr) => {
    acc.completed += curr.completed_tasks;
    acc.missed += curr.missed_tasks;
    return acc;
  }, { completed: 0, missed: 0 });

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-rose-600" />
              <span className="font-bold text-xl text-slate-900">Rose Track Admin</span>
            </div>
            <button onClick={handleSignOut} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tracked Days</p>
              <p className="text-3xl font-bold text-slate-900">{history.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Completed</p>
              <p className="text-3xl font-bold text-slate-900">{totals.completed}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-rose-100 p-4 rounded-full">
              <XCircle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Missed</p>
              <p className="text-3xl font-bold text-slate-900">{totals.missed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Completion Telemetry (Last 30 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="completion_score" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Recent Synced Tasks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Task</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Synced At</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-200">
                {tasks.slice(0, 20).map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{task.date}</td>
                    <td className="px-6 py-4 text-slate-600">{task.time}</td>
                    <td className="px-6 py-4 text-slate-900">{task.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'MISSED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(task.synced_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
