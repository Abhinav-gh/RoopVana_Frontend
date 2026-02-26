import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, BarChart3, Coins, Clock, ArrowLeft, Trash2,
  Check, X, RefreshCw, Search, Shield
} from 'lucide-react';
import adminApi, {
  AdminStats, AdminUser, UsageDoc, GenerationRequest, CreditRequest
} from '@/services/adminApi';
import { toast } from 'sonner';

const AdminPage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'requests' | 'credits'>('overview');
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usage, setUsage] = useState<UsageDoc[]>([]);
  const [genRequests, setGenRequests] = useState<GenerationRequest[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [approveCredits, setApproveCredits] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      await adminApi.checkAdmin();
      setIsAdmin(true);
      await loadAllData();
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      const [statsRes, usersRes, usageRes, reqRes, creditRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getUsage(),
        adminApi.getRequests(50),
        adminApi.getCreditRequests(),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setUsage(usageRes.usage);
      setGenRequests(reqRes.requests);
      setCreditRequests(creditRes.requests);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load admin data');
    }
  };

  const handleSetCredits = async (uid: string) => {
    const val = parseInt(creditInputs[uid] || '0', 10);
    if (isNaN(val) || val < 0) { toast.error('Invalid credit amount'); return; }
    try {
      await adminApi.setCredits(uid, val);
      toast.success(`Credits set to ${val}`);
      setCreditInputs((p) => ({ ...p, [uid]: '' }));
      window.dispatchEvent(new CustomEvent('credits-updated'));
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!confirm(`Delete user ${email}? This is irreversible.`)) return;
    try {
      await adminApi.deleteUser(uid);
      toast.success('User deleted');
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReviewCreditRequest = async (id: string, status: 'approved' | 'denied') => {
    try {
      const credits = status === 'approved' ? parseInt(approveCredits[id] || '0', 10) : 0;
      await adminApi.reviewCreditRequest(id, status, credits);
      toast.success(`Request ${status}`);
      setApproveCredits((p) => ({ ...p, [id]: '' }));
      window.dispatchEvent(new CustomEvent('credits-updated'));
      await loadAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Merge users + usage
  const mergedUsers = users.map((u) => {
    const usageDoc = usage.find((d) => d.uid === u.uid);
    return { ...u, credits: usageDoc?.credits ?? 0, totalGenerations: usageDoc?.totalGenerations ?? 0 };
  });

  const filteredUsers = mergedUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = creditRequests.filter((r) => r.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="login-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Shield className="w-16 h-16 text-destructive opacity-50" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to App
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="font-display text-xl font-semibold">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
          </div>
          <button
            onClick={loadAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
              { label: 'Total Generations', value: stats.totalGenerations, icon: BarChart3, color: 'text-green-400' },
              { label: 'Active Users', value: stats.activeUsers, icon: Users, color: 'text-emerald-400' },
              { label: 'Credits in Circulation', value: stats.totalCreditsInCirculation, icon: Coins, color: 'text-amber-400' },
              { label: 'Pending Requests', value: stats.pendingCreditRequests, icon: Clock, color: 'text-orange-400' },
            ].map((card) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border/50 pb-2">
          {(['overview', 'users', 'requests', 'credits'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'users' && `👥 Users (${users.length})`}
              {tab === 'requests' && `📋 Generations (${genRequests.length})`}
              {tab === 'credits' && `📩 Credit Requests (${pendingRequests.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Generations</h2>
            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Prompt</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Time</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genRequests.slice(0, 20).map((r) => (
                      <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="px-4 py-3 text-foreground truncate max-w-[150px]">{r.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            r.type === 'text-to-image' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[250px]" title={r.prompt}>
                          {r.prompt.substring(0, 60)}{r.prompt.length > 60 ? '...' : ''}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{(r.generationTimeMs / 1000).toFixed(1)}s</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {genRequests.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No generation requests yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by email or UID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">UID</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Credits</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Generations</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Last Sign In</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Set Credits</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.uid} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="px-4 py-3 text-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs truncate max-w-[100px]" title={u.uid}>
                          {u.uid.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${u.credits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {u.credits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.totalGenerations}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={creditInputs[u.uid] || ''}
                              onChange={(e) => setCreditInputs((p) => ({ ...p, [u.uid]: e.target.value }))}
                              className="w-16 px-2 py-1 rounded bg-muted/50 border border-border/50 text-xs text-foreground outline-none focus:border-primary/50"
                            />
                            <button
                              onClick={() => handleSetCredits(u.uid)}
                              className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
                            >
                              Set
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteUser(u.uid, u.email)}
                            className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Prompt</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Improved Prompt</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Language</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Time</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {genRequests.map((r) => (
                    <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-4 py-3 text-foreground truncate max-w-[120px]">{r.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.type === 'text-to-image' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]" title={r.prompt}>
                        {r.prompt.substring(0, 50)}...
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]" title={r.improvedPrompt}>
                        {r.improvedPrompt.substring(0, 50)}...
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.language}</td>
                      <td className="px-4 py-3 text-muted-foreground">{(r.generationTimeMs / 1000).toFixed(1)}s</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {r.timestamp ? new Date(r.timestamp).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {genRequests.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No generation requests yet</p>
            )}
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Pending Credit Requests ({pendingRequests.length})
            </h2>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No pending credit requests</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl border border-border/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{r.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">UID: {r.userId}</p>
                        <p className="text-sm text-muted-foreground mt-2 italic">"{r.message}"</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Credits"
                          value={approveCredits[r.id] || ''}
                          onChange={(e) => setApproveCredits((p) => ({ ...p, [r.id]: e.target.value }))}
                          className="w-20 px-2 py-1.5 rounded bg-muted/50 border border-border/50 text-sm text-foreground outline-none focus:border-primary/50"
                        />
                        <button
                          onClick={() => handleReviewCreditRequest(r.id, 'approved')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleReviewCreditRequest(r.id, 'denied')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                        >
                          <X className="w-3 h-3" /> Deny
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <h2 className="text-lg font-semibold text-foreground mt-8">
              All Credit Requests ({creditRequests.length})
            </h2>
            <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Message</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditRequests.map((r) => (
                      <tr key={r.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="px-4 py-3 text-foreground">{r.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.message}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
