import React, { useState, useEffect } from 'react';
import { DetectiveCase, User, UserRole, UserToken, LeaderboardUser } from '../types/detective.ts';
import {
  ShieldCheck,
  Lock,
  LogOut,
  FolderOpen,
  Users,
  Trophy,
  Sparkles,
  Plus,
  RotateCcw,
  Trash2,
  KeyRound,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  Shield,
  FileText,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';
import { sortCasesByDifficulty } from '../game/detectiveRules.ts';

interface AdminPortalProps {
  cases: DetectiveCase[];
  onSelectCase: (caseId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAIModal: () => void;
  onResetDefaults: () => void;
  onDeleteCase: (caseId: string) => void;
  onCloseAdmin: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  cases,
  onSelectCase,
  onOpenCreateModal,
  onOpenAIModal,
  onResetDefaults,
  onDeleteCase,
  onCloseAdmin,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('scotland_yard_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin Tab: 'cases' | 'users' | 'tokens' | 'leaderboard'
  const [activeTab, setActiveTab] = useState<'cases' | 'users' | 'tokens' | 'leaderboard'>('cases');

  // Users & Tokens state
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Case filtering
  const [caseSearch, setCaseSearch] = useState('');
  const [caseDifficulty, setCaseDifficulty] = useState('Tất cả');

  // Modals for adding user or issuing token
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('detective');

  // New token form state
  const [tokenUserId, setTokenUserId] = useState('');
  const [tokenName, setTokenName] = useState('Khóa Điều Tra Cơ Quan');
  const [tokenQuota, setTokenQuota] = useState(500);
  const [tokenExpiryDays, setTokenExpiryDays] = useState(60);

  // Copy notification state
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Fetch users & leaderboard when logged in
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [usersRes, lbRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/leaderboard'),
      ]);
      if (usersRes.ok) {
        const uData = await usersRes.json();
        if (uData.success && Array.isArray(uData.users)) setUsers(uData.users);
      }
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        if (lbData.success && Array.isArray(lbData.leaderboard)) setLeaderboard(lbData.leaderboard);
      }
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    soundEngine.playKeyClick();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('scotland_yard_admin_user', JSON.stringify(data.user));
        soundEngine.playVictory();
      } else {
        setLoginError(data.message || 'Tài danh hoặc mật mã không chính xác.');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối máy chủ điều tra. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = (role: 'admin' | 'holmes') => {
    if (role === 'admin') {
      setUsernameInput('admin');
      setPasswordInput('bakerstreet1888');
    } else {
      setUsernameInput('holmes');
      setPasswordInput('bakerstreet');
    }
  };

  const handleLogout = () => {
    soundEngine.playPageFlip();
    setCurrentUser(null);
    localStorage.removeItem('scotland_yard_admin_user');
  };

  // Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          fullName: newFullName,
          email: newEmail,
          role: newRole,
          permissions:
            newRole === 'superadmin' || newRole === 'admin'
              ? ['play_cases', 'create_manual_cases', 'generate_ai_cases', 'edit_delete_cases', 'manage_users', 'manage_tokens']
              : newRole === 'investigator'
              ? ['play_cases', 'create_manual_cases', 'generate_ai_cases']
              : ['play_cases'],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundEngine.playVictory();
        setShowAddUserModal(false);
        setNewUsername('');
        setNewFullName('');
        setNewEmail('');
        fetchData();
      } else {
        alert(data.message || 'Không thể tạo tài khoản.');
      }
    } catch (e) {
      alert('Lỗi kết nối máy chủ.');
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (user: User) => {
    const updatedStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus }),
      });
      if (res.ok) {
        soundEngine.playKeyClick();
        fetchData();
      }
    } catch {}
  };

  // Delete user
  const handleDeleteUser = async (user: User) => {
    if (user.role === 'superadmin') {
      alert('Không thể xóa tài khoản Cố Vấn Tối Cao Scotland Yard.');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa điều tra viên "${user.fullName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        soundEngine.playPaperTear();
        fetchData();
      }
    } catch {}
  };

  // Adjust user tokens
  const handleTopupTokens = async (userId: string, amount: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/adjust-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        soundEngine.playVictory();
        fetchData();
      }
    } catch {}
  };

  // Issue Token
  const handleIssueToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenUserId) {
      alert('Vui lòng chọn người dùng nhận token.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${tokenUserId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenName,
          quotaLimit: tokenQuota,
          expiresDays: tokenExpiryDays,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        soundEngine.playVictory();
        setShowAddTokenModal(false);
        fetchData();
      } else {
        alert(data.message || 'Không thể cấp token.');
      }
    } catch {
      alert('Lỗi máy chủ cấp token.');
    }
  };

  // Revoke Token
  const handleRevokeToken = async (userId: string, tokenId: string) => {
    if (!window.confirm('Bạn có chắc muốn thu hồi quyền sử dụng token này không?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/tokens/${tokenId}`, { method: 'DELETE' });
      if (res.ok) {
        soundEngine.playPaperTear();
        fetchData();
      }
    } catch {}
  };

  // Copy token key
  const handleCopyToken = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Filtered and sorted cases (strictly Easy to Hard)
  const sortedCases = sortCasesByDifficulty(
    cases.filter((c) => {
      if (caseSearch) {
        const q = caseSearch.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchLore = c.originalLore.toLowerCase().includes(q);
        const matchCollection = c.collection?.toLowerCase().includes(q);
        if (!matchTitle && !matchLore && !matchCollection) return false;
      }
      if (caseDifficulty !== 'Tất cả' && c.difficulty !== caseDifficulty) return false;
      return true;
    })
  );

  // All tokens aggregated for token management view
  const allTokens = users.flatMap((u) =>
    (u.tokens || []).map((t) => ({
      ...t,
      userName: u.fullName,
      userRole: u.roleTitle,
    }))
  );

  // --------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN (if not authenticated)
  // --------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#120f0d] text-[#ded4c3] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-[#1a1512] border border-[#3d3126] rounded-xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#2c2219] border border-[#5a4430] flex items-center justify-center text-[#c59b27] shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-[11px] font-sans-ui text-[#c59b27] uppercase tracking-widest font-bold">
              SCOTLAND YARD · SỞ CHỈ HUY VĂN KHỐ
            </div>
            <h2 className="text-2xl font-cinzel font-bold text-[#f5ebd7]">
              Cổng Quản Trị Hệ Thống
            </h2>
            <p className="text-xs font-newsreader italic text-[#9e8f7e]">
              Khu vực dành riêng cho Quản trị viên và Điều tra viên cấp cao để biên kịch vụ án, quản lý người dùng và cấp phát mã token an ninh.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-[#381616] border border-[#6b2c2c] rounded text-xs font-sans-ui text-[#fca5a5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-sans-ui text-[#b3a391] mb-1 font-medium">
                Tài Danh / Email Đăng Nhập:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ví dụ: admin hoặc holmes"
                required
                className="w-full bg-[#120f0d] border border-[#3b2e23] rounded p-2.5 text-sm font-sans-ui text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-ui text-[#b3a391] mb-1 font-medium">
                Mật Mã An Ninh:
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#120f0d] border border-[#3b2e23] rounded p-2.5 text-sm font-sans-ui text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-[#c59b27] hover:bg-[#d8ab30] text-[#14110e] font-sans-ui font-semibold text-sm rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Đang Xác Thực...' : 'Đăng Nhập Quản Trị'}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-2 border-t border-[#2e241c] space-y-2">
            <div className="text-[11px] font-sans-ui text-[#7d6f5f] text-center">
              Tài khoản thử nghiệm nhanh (1-Click Fill):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans-ui">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 bg-[#231b15] hover:bg-[#2d231b] border border-[#3d2f22] rounded text-[#c59b27] cursor-pointer text-center"
              >
                Quản Trị Viên (admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('holmes')}
                className="p-2 bg-[#231b15] hover:bg-[#2d231b] border border-[#3d2f22] rounded text-[#baa895] cursor-pointer text-center"
              >
                Sherlock Holmes
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onCloseAdmin}
              className="text-xs font-sans-ui text-[#8a7a69] hover:text-[#ded4c3] flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Tủ Hồ Sơ (Dành cho Người Chơi)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#14110f] text-[#ded4c3] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#1b1613] border-b border-[#352a20] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#2e2318] border border-[#5a4430] flex items-center justify-center text-[#c59b27]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-sans-ui text-[#c59b27] uppercase tracking-wider font-semibold">
              HỆ THỐNG QUẢN TRỊ SCOTLAND YARD · BACKEND COMMAND
            </div>
            <div className="text-base font-cinzel font-bold text-[#f5ebd7] flex items-center gap-2">
              <span>{currentUser.fullName}</span>
              <span className="text-[11px] font-sans-ui font-normal px-2 py-0.5 rounded bg-[#2c2219] text-[#c59b27] border border-[#483726]">
                {currentUser.roleTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans-ui">
          <div className="hidden sm:flex items-center gap-1.5 text-[#a89988] bg-[#221b16] px-3 py-1.5 rounded border border-[#3a2e22]">
            <KeyRound className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Hạn mức Token:</span>
            <strong className="text-[#f5ebd7]">{currentUser.tokenBalance}</strong>
          </div>

          <button
            onClick={onCloseAdmin}
            className="px-3 py-1.5 bg-[#2a2119] hover:bg-[#382b20] text-[#ded4c3] rounded border border-[#443527] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Trở về giao diện người chơi trinh thám"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Xem Giao Diện Chơi</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-[#381c1a] hover:bg-[#4a2422] text-[#fca5a5] rounded border border-[#5c2b28] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Đăng xuất khỏi tài khoản quản trị"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Nav Tabs */}
      <div className="bg-[#181310] border-b border-[#2e241c] px-6">
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playKeyClick();
              setActiveTab('cases');
            }}
            className={`px-4 py-3 text-xs font-sans-ui font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'cases'
                ? 'border-[#c59b27] text-[#c59b27] bg-[#221b16]'
                : 'border-transparent text-[#968675] hover:text-[#ded4c3]'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Quản Lý Hồ Sơ Vụ Án ({cases.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playKeyClick();
              setActiveTab('users');
            }}
            className={`px-4 py-3 text-xs font-sans-ui font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'users'
                ? 'border-[#c59b27] text-[#c59b27] bg-[#221b16]'
                : 'border-transparent text-[#968675] hover:text-[#ded4c3]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý User & Phân Quyền ({users.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playKeyClick();
              setActiveTab('tokens');
            }}
            className={`px-4 py-3 text-xs font-sans-ui font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'tokens'
                ? 'border-[#c59b27] text-[#c59b27] bg-[#221b16]'
                : 'border-transparent text-[#968675] hover:text-[#ded4c3]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Quản Lý Token ({allTokens.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playKeyClick();
              setActiveTab('leaderboard');
            }}
            className={`px-4 py-3 text-xs font-sans-ui font-medium border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-[#c59b27] text-[#c59b27] bg-[#221b16]'
                : 'border-transparent text-[#968675] hover:text-[#ded4c3]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bảng Xếp Hạng User</span>
          </button>
        </div>
      </div>

      {/* Tab Content Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ================================================================= */}
        {/* TAB 1: QUẢN LÝ HỒ SƠ VỤ ÁN */}
        {/* ================================================================= */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            {/* Header Actions: Dedicated place for the 3 case management buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#1a1512] rounded-lg border border-[#352a20]">
              <div>
                <h3 className="text-xl font-cinzel font-bold text-[#f5ebd7]">
                  Kho Hồ Sơ Vụ Án Trinh Thám
                </h3>
                <p className="text-xs font-newsreader italic text-[#a39483] mt-0.5">
                  Tất cả các hồ sơ được tự động sắp xếp theo thứ tự độ khó từ <strong>Dễ</strong> đến <strong>Kỳ Tài</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* AI Generator Button */}
                <button
                  onClick={() => {
                    soundEngine.playPageFlip();
                    onOpenAIModal();
                  }}
                  className="px-3.5 py-2 text-xs font-sans-ui font-medium text-white bg-[#8b2b2b] hover:bg-[#a63434] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Sparkles className="w-4 h-4 text-[#e5d8be]" />
                  <span>AI Tạo Vụ Án (Backend AI)</span>
                </button>

                {/* Manual Add Case Button */}
                <button
                  onClick={() => {
                    soundEngine.playPageFlip();
                    onOpenCreateModal();
                  }}
                  className="px-3.5 py-2 text-xs font-sans-ui font-medium text-[#171412] bg-[#c59b27] hover:bg-[#d8ab30] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Soạn Hồ Sơ Mới</span>
                </button>

                {/* Reset Defaults Button */}
                <button
                  onClick={() => {
                    if (window.confirm('Khôi phục danh mục vụ án gốc ban đầu?')) {
                      onResetDefaults();
                    }
                  }}
                  className="px-3 py-2 text-xs font-sans-ui text-[#9e9080] hover:text-[#dcd2be] border border-[#3b3128] hover:border-[#524438] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Khôi phục danh mục vụ án gốc"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi Phục Gốc</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3 bg-[#17120f] p-3 rounded border border-[#2d231b]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d6f5f]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tiêu đề, dòng board game..."
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                  className="w-full bg-[#120f0d] border border-[#362b21] rounded pl-8 pr-3 py-1.5 text-xs font-sans-ui text-[#ded4c3] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-sans-ui">
                <span className="text-[#8f7f6f]">Lọc độ khó:</span>
                <select
                  value={caseDifficulty}
                  onChange={(e) => setCaseDifficulty(e.target.value)}
                  className="bg-[#120f0d] border border-[#362b21] rounded px-3 py-1.5 text-xs text-[#ded4c3] focus:outline-none focus:border-[#c59b27]"
                >
                  <option value="Tất cả">Tất cả độ khó</option>
                  <option value="Dễ">Dễ</option>
                  <option value="Trung Bình">Trung Bình</option>
                  <option value="Hóc Búa">Hóc Búa</option>
                  <option value="Kỳ Tài">Kỳ Tài</option>
                </select>
              </div>
            </div>

            {/* Cases Table */}
            <div className="bg-[#17120f] rounded-lg border border-[#2d231b] overflow-hidden">
              <table className="w-full text-left text-xs font-sans-ui">
                <thead className="bg-[#1e1713] text-[#a39483] border-b border-[#2e231a] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4"># Số Hiệu</th>
                    <th className="py-3 px-4">Tiêu Đề & Bối Cảnh</th>
                    <th className="py-3 px-4">Dòng Game</th>
                    <th className="py-3 px-4">Độ Khó</th>
                    <th className="py-3 px-4">Hạn Mức</th>
                    <th className="py-3 px-4">Holmes</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241c16]">
                  {sortedCases.map((c) => {
                    const diffColors: Record<string, string> = {
                      'Dễ': 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
                      'Trung Bình': 'text-amber-300 bg-amber-950/40 border-amber-800/50',
                      'Hóc Búa': 'text-orange-400 bg-orange-950/40 border-orange-800/50',
                      'Kỳ Tài': 'text-rose-400 bg-rose-950/40 border-rose-800/50',
                    };

                    return (
                      <tr key={c.id} className="hover:bg-[#1f1915] transition-colors">
                        <td className="py-3 px-4 font-cinzel font-bold text-[#c59b27]">
                          #{String(c.number).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-semibold text-[#f5ebd7] truncate">{c.title}</div>
                          <div className="text-[11px] text-[#8e8071] truncate italic font-newsreader">
                            {c.victim} · {c.crimeScene}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#baa996]">
                          {c.collection || 'Consulting Detective'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${diffColors[c.difficulty] || ''}`}>
                            {c.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#ded4c3]">
                          {c.clueQuota} manh mối
                        </td>
                        <td className="py-3 px-4 text-[#8e8071]">
                          {c.holmesCluesUsed} lượt
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              onSelectCase(c.id);
                              onCloseAdmin();
                            }}
                            className="px-2.5 py-1 bg-[#2b221a] hover:bg-[#3b2e23] text-[#ded4c3] rounded border border-[#443628] cursor-pointer inline-flex items-center gap-1"
                            title="Mở hồ sơ kiểm tra"
                          >
                            <Eye className="w-3 h-3 text-[#c59b27]" />
                            <span>Mở Điều Tra</span>
                          </button>
                          {c.isCustom && (
                            <button
                              onClick={() => onDeleteCase(c.id)}
                              className="px-2.5 py-1 bg-[#3a1818] hover:bg-[#502222] text-[#fca5a5] rounded border border-[#6b2a2a] cursor-pointer inline-flex items-center gap-1"
                              title="Xóa hồ sơ này"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: QUẢN LÝ USER & PHÂN QUYỀN */}
        {/* ================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#1a1512] rounded-lg border border-[#352a20]">
              <div>
                <h3 className="text-xl font-cinzel font-bold text-[#f5ebd7]">
                  Danh Sách Điều Tra Viên & Phân Quyền
                </h3>
                <p className="text-xs font-newsreader italic text-[#a39483] mt-0.5">
                  Quản lý quyền hạn truy cập (Superadmin, Admin, Investigator, Detective) và hạn mức tài nguyên.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-2 text-xs font-sans-ui font-medium text-[#171412] bg-[#c59b27] hover:bg-[#d8ab30] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Điều Tra Viên Mới</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#17120f] rounded-lg border border-[#2d231b] overflow-hidden">
              <table className="w-full text-left text-xs font-sans-ui">
                <thead className="bg-[#1e1713] text-[#a39483] border-b border-[#2e231a] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Điều Tra Viên</th>
                    <th className="py-3 px-4">Tài Danh / Email</th>
                    <th className="py-3 px-4">Chức Danh & Quyền</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4">Token Balance</th>
                    <th className="py-3 px-4">Đã Phá Án</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241c16]">
                  {users.map((u) => {
                    const roleBadges: Record<string, string> = {
                      superadmin: 'bg-[#5c2a12] text-[#fca5a5] border-[#8a3f1c]',
                      admin: 'bg-[#4a3614] text-[#fde047] border-[#785720]',
                      investigator: 'bg-[#1e3448] text-[#93c5fd] border-[#2e5272]',
                      detective: 'bg-[#26211c] text-[#a89b8c] border-[#3d342c]',
                    };

                    return (
                      <tr key={u.id} className="hover:bg-[#1f1915] transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#f5ebd7]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#2a2017] border border-[#483727] flex items-center justify-center text-[11px] font-bold text-[#c59b27]">
                              {u.fullName.charAt(0)}
                            </div>
                            <span>{u.fullName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#8f8070]">
                          <div>@{u.username}</div>
                          <div className="text-[10px] text-[#6d6154]">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${roleBadges[u.role] || ''}`}>
                            {u.roleTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.status === 'active' ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" /> Tạm đình chỉ
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#c59b27]">
                          {u.tokenBalance}
                        </td>
                        <td className="py-3 px-4 text-[#ded4c3]">
                          {u.casesSolved} vụ án
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleTopupTokens(u.id, 100)}
                            className="px-2 py-1 bg-[#261f17] hover:bg-[#382d22] text-[#c59b27] border border-[#443525] rounded text-[11px] cursor-pointer"
                            title="Nạp thêm 100 Tokens"
                          >
                            +100 Tokens
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-2 py-1 bg-[#221b16] hover:bg-[#2e241e] text-[#a39483] border border-[#3b2f24] rounded text-[11px] cursor-pointer"
                          >
                            {u.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-2 py-1 bg-[#3a1919] hover:bg-[#4d2222] text-[#fca5a5] border border-[#5e2929] rounded text-[11px] cursor-pointer"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: QUẢN LÝ TOKEN */}
        {/* ================================================================= */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#1a1512] rounded-lg border border-[#352a20]">
              <div>
                <h3 className="text-xl font-cinzel font-bold text-[#f5ebd7]">
                  Trung Tâm Quản Lý Mã Token An Ninh & API
                </h3>
                <p className="text-xs font-newsreader italic text-[#a39483] mt-0.5">
                  Cấp phát, theo dõi lưu lượng sử dụng và thu hồi mã khóa điều tra của các nhân sự.
                </p>
              </div>

              <button
                onClick={() => {
                  if (users.length > 0 && !tokenUserId) setTokenUserId(users[0].id);
                  setShowAddTokenModal(true);
                }}
                className="px-3.5 py-2 text-xs font-sans-ui font-medium text-[#171412] bg-[#c59b27] hover:bg-[#d8ab30] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Phát Hành Token Mới</span>
              </button>
            </div>

            {/* Token Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#181310] border border-[#2d231b] rounded-lg space-y-1">
                <div className="text-[11px] font-sans-ui text-[#8f8070] uppercase">Tổng Số Token Đã Cấp</div>
                <div className="text-2xl font-cinzel font-bold text-[#f5ebd7]">{allTokens.length} khóa</div>
              </div>
              <div className="p-4 bg-[#181310] border border-[#2d231b] rounded-lg space-y-1">
                <div className="text-[11px] font-sans-ui text-[#8f8070] uppercase">Khóa Đang Hoạt Động</div>
                <div className="text-2xl font-cinzel font-bold text-emerald-400">
                  {allTokens.filter((t) => t.status === 'active').length} khóa
                </div>
              </div>
              <div className="p-4 bg-[#181310] border border-[#2d231b] rounded-lg space-y-1">
                <div className="text-[11px] font-sans-ui text-[#8f8070] uppercase">Tổng Lượt Sử Dụng Khóa</div>
                <div className="text-2xl font-cinzel font-bold text-[#c59b27]">
                  {allTokens.reduce((acc, t) => acc + (t.usageCount || 0), 0)} lượt
                </div>
              </div>
            </div>

            {/* Token Table */}
            <div className="bg-[#17120f] rounded-lg border border-[#2d231b] overflow-hidden">
              <table className="w-full text-left text-xs font-sans-ui">
                <thead className="bg-[#1e1713] text-[#a39483] border-b border-[#2e231a] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tên Khóa Token</th>
                    <th className="py-3 px-4">Mã Key (Masked)</th>
                    <th className="py-3 px-4">Chủ Sở Hữu</th>
                    <th className="py-3 px-4">Hạn Định (Quota)</th>
                    <th className="py-3 px-4">Hết Hạn</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#241c16]">
                  {allTokens.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1f1915] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#f5ebd7]">
                        <div className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#c59b27]" />
                          <span>{t.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#a89b8b]">
                        <div className="flex items-center gap-1.5">
                          <span>{t.tokenKey.slice(0, 8)}••••••••</span>
                          <button
                            onClick={() => handleCopyToken(t.tokenKey, t.id)}
                            className="p-1 hover:text-[#f5ebd7] cursor-pointer"
                            title="Sao chép toàn bộ Token Key"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedTokenId === t.id && (
                            <span className="text-[10px] text-emerald-400">Đã chép!</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#ded4c3]">
                        <div>{t.userName}</div>
                        <div className="text-[10px] text-[#7d7062]">{t.userRole}</div>
                      </td>
                      <td className="py-3 px-4 text-[#ded4c3]">
                        {t.usageCount} / {t.quotaLimit} lượt
                      </td>
                      <td className="py-3 px-4 text-[#8f8070]">
                        {new Date(t.expiresAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        {t.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-400 border border-rose-800/50">
                            Đã thu hồi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {t.status === 'active' && (
                          <button
                            onClick={() => handleRevokeToken(t.userId, t.id)}
                            className="px-2.5 py-1 bg-[#3a1919] hover:bg-[#4d2222] text-[#fca5a5] border border-[#5e2929] rounded text-[11px] cursor-pointer"
                          >
                            Thu Hồi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: BẢNG XẾP HẠNG USER */}
        {/* ================================================================= */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="p-5 bg-[#1a1512] rounded-lg border border-[#352a20]">
              <h3 className="text-xl font-cinzel font-bold text-[#f5ebd7]">
                Bảng Tổng Sắp Thành Tích & Xếp Hạng Thám Tử
              </h3>
              <p className="text-xs font-newsreader italic text-[#a39483] mt-0.5">
                Ghi nhận các chiến tích phá án, hiệu suất tiêu thụ manh mối và thứ bậc vinh danh tại Scotland Yard.
              </p>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((lb, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={lb.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all ${
                      isTop1
                        ? 'bg-[#261f18] border-[#8a6820] shadow-md'
                        : isTop2
                        ? 'bg-[#221c17] border-[#5a4837]'
                        : isTop3
                        ? 'bg-[#1f1915] border-[#443629]'
                        : 'bg-[#181412] border-[#2c231b]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-cinzel font-bold text-sm shrink-0 ${
                          isTop1
                            ? 'bg-[#c59b27] text-[#14110e]'
                            : isTop2
                            ? 'bg-[#a39482] text-[#14110e]'
                            : isTop3
                            ? 'bg-[#825e38] text-[#f5ebd7]'
                            : 'bg-[#26201a] text-[#8e7e6e] border border-[#3b3026]'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-cinzel font-bold text-base text-[#f5ebd7]">
                            {lb.fullName}
                          </h4>
                          <span className="text-[11px] font-sans-ui text-[#8e8071]">
                            (@{lb.username})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-sans-ui text-[#9a8c7b] mt-0.5">
                          <span className="text-[#c59b27] font-medium">{lb.rankBadge}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#a89988]">{lb.rankTitle}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2b221a] justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Vụ Án Phá Xong</div>
                        <div className="text-sm font-semibold font-sans-ui text-[#ded4c3]">
                          {lb.casesSolved} vụ án
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Hiệu Suất Manh Mối</div>
                        <div className="text-sm font-semibold font-sans-ui text-[#60a5fa]">
                          {lb.clueEfficiency}%
                        </div>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Tổng Điểm</div>
                        <div className="text-base font-cinzel font-bold text-[#c59b27]">
                          {lb.totalScore} đ
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* MODAL: THÊM USER MỚI */}
      {/* ================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b1512] border border-[#3e3023] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-cinzel font-bold text-[#f5ebd7]">
              Thêm Điều Tra Viên Mới
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-sans-ui">
              <div>
                <label className="block text-[#b3a391] mb-1">Họ và Tên Đầy Đủ:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Arthur Hastings"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div>
                <label className="block text-[#b3a391] mb-1">Tài Danh (Username):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: hastings"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div>
                <label className="block text-[#b3a391] mb-1">Thư Điện Tử (Email):</label>
                <input
                  type="email"
                  required
                  placeholder="hastings@scotlandyard.police.uk"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div>
                <label className="block text-[#b3a391] mb-1">Phân Quyền / Cấp Bậc:</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                >
                  <option value="detective">Thám Tử Phố Baker (Chỉ giải án & xem tài liệu)</option>
                  <option value="investigator">Điều Tra Viên Cao Cấp (Quyền tạo hồ sơ & AI)</option>
                  <option value="admin">Quản Trị Viên (Toàn quyền quản lý vụ án & token)</option>
                  <option value="superadmin">Chánh Án Scotland Yard (Quyền lực tối cao)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 bg-[#2b221a] hover:bg-[#382c22] text-[#c7b9a7] rounded cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c59b27] hover:bg-[#d8ab30] text-[#14110e] font-semibold rounded cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PHÁT HÀNH TOKEN MỚI */}
      {/* ================================================================= */}
      {showAddTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b1512] border border-[#3e3023] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-cinzel font-bold text-[#f5ebd7]">
              Phát Hành Token An Ninh Mới
            </h3>

            <form onSubmit={handleIssueToken} className="space-y-3.5 text-xs font-sans-ui">
              <div>
                <label className="block text-[#b3a391] mb-1">Chọn Điều Tra Viên Thụ Hưởng:</label>
                <select
                  value={tokenUserId}
                  onChange={(e) => setTokenUserId(e.target.value)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} (@{u.username}) — {u.roleTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#b3a391] mb-1">Tên Nhãn Khóa Token:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Baker Street Field Token"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#b3a391] mb-1">Hạn Định Lượt (Quota):</label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    value={tokenQuota}
                    onChange={(e) => setTokenQuota(Number(e.target.value))}
                    className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <div>
                  <label className="block text-[#b3a391] mb-1">Hiệu Lực (Ngày):</label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={tokenExpiryDays}
                    onChange={(e) => setTokenExpiryDays(Number(e.target.value))}
                    className="w-full bg-[#130f0d] border border-[#3b2e22] rounded p-2 text-[#f5ebd7] focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTokenModal(false)}
                  className="px-3 py-1.5 bg-[#2b221a] hover:bg-[#382c22] text-[#c7b9a7] rounded cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#c59b27] hover:bg-[#d8ab30] text-[#14110e] font-semibold rounded cursor-pointer"
                >
                  Phát Hành Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
