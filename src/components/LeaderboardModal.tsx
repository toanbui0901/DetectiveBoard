import React, { useState, useEffect } from 'react';
import { LeaderboardUser } from '../types/detective.ts';
import { Trophy, Award, X, Sparkles, Target, CheckCircle2, Search, Shield, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'cases' | 'efficiency'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          }
        }
      } catch (e) {
        console.warn('Failed to load leaderboard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedList = [...leaderboard]
    .filter((u) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.roleTitle.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.totalScore - a.totalScore;
      if (sortBy === 'cases') return b.casesSolved - a.casesSolved;
      if (sortBy === 'efficiency') return b.clueEfficiency - a.clueEfficiency;
      return 0;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#191512] border border-[#3d3228] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#31271f] flex items-center justify-between bg-[#151210]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2d2218] border border-[#523d2b] flex items-center justify-center text-[#c59b27]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-sans-ui text-[#c59b27] uppercase tracking-wider font-semibold">
                BẢNG VINH DANH THÁM TỬ · CỐ VẤN SCOTLAND YARD
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-[#f5ebd7]">
                Bảng Xếp Hạng Năng Lực Phá Án
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playPageFlip();
              onClose();
            }}
            className="text-[#968877] hover:text-[#f0e6d2] p-1.5 rounded transition-colors cursor-pointer"
            aria-label="Đóng bảng xếp hạng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="p-4 bg-[#1e1915] border-b border-[#2d241c] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans-ui text-[#8f8070]">Sắp xếp theo:</span>
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1.5 text-xs font-sans-ui rounded transition-colors cursor-pointer ${
                sortBy === 'score'
                  ? 'bg-[#c59b27] text-[#14110e] font-semibold'
                  : 'bg-[#29221b] text-[#a19280] hover:bg-[#342b22]'
              }`}
            >
              Tổng Điểm
            </button>
            <button
              onClick={() => setSortBy('cases')}
              className={`px-3 py-1.5 text-xs font-sans-ui rounded transition-colors cursor-pointer ${
                sortBy === 'cases'
                  ? 'bg-[#c59b27] text-[#14110e] font-semibold'
                  : 'bg-[#29221b] text-[#a19280] hover:bg-[#342b22]'
              }`}
            >
              Số Vụ Án Đã Phá
            </button>
            <button
              onClick={() => setSortBy('efficiency')}
              className={`px-3 py-1.5 text-xs font-sans-ui rounded transition-colors cursor-pointer ${
                sortBy === 'efficiency'
                  ? 'bg-[#c59b27] text-[#14110e] font-semibold'
                  : 'bg-[#29221b] text-[#a19280] hover:bg-[#342b22]'
              }`}
            >
              Hiệu Suất Manh Mối
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7162]" />
            <input
              type="text"
              placeholder="Tìm tên thám tử..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14110f] border border-[#3b3026] text-xs font-sans-ui text-[#ded4c3] pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-[#c59b27]"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-[#998b7a] font-newsreader italic">
              Đang tải bảng ghi danh từ văn khố Scotland Yard...
            </div>
          ) : sortedList.length === 0 ? (
            <div className="py-16 text-center text-[#998b7a] font-newsreader italic">
              Không tìm thấy hồ sơ thám tử phù hợp.
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedList.map((entry, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;

                return (
                  <div
                    key={entry.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all ${
                      isTop1
                        ? 'bg-[#261f18] border-[#8a6820] shadow-md'
                        : isTop2
                        ? 'bg-[#221c17] border-[#5a4837]'
                        : isTop3
                        ? 'bg-[#1f1915] border-[#443629]'
                        : 'bg-[#181412] border-[#2c231b] hover:border-[#3d3227]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Position */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-cinzel font-bold text-sm shrink-0 ${
                          isTop1
                            ? 'bg-[#c59b27] text-[#14110e] shadow'
                            : isTop2
                            ? 'bg-[#a39482] text-[#14110e]'
                            : isTop3
                            ? 'bg-[#825e38] text-[#f5ebd7]'
                            : 'bg-[#26201a] text-[#8e7e6e] border border-[#3b3026]'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      {/* Detective Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-cinzel font-bold text-base text-[#f5ebd7]">
                            {entry.fullName}
                          </h4>
                          <span className="text-[11px] font-sans-ui text-[#8e8071]">
                            (@{entry.username})
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs font-sans-ui text-[#9a8c7b]">
                          <span className="text-[#c59b27] font-medium">{entry.rankBadge}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#a89988]">{entry.rankTitle}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#2b221a] justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Vụ Án Đã Phá</div>
                        <div className="text-sm font-semibold font-sans-ui text-[#ded4c3]">
                          {entry.casesSolved} hồ sơ
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Hiệu Suất</div>
                        <div className="text-sm font-semibold font-sans-ui text-[#60a5fa]">
                          {entry.clueEfficiency}%
                        </div>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-[10px] font-sans-ui text-[#8a7a6a] uppercase">Tổng Điểm</div>
                        <div className="text-base font-cinzel font-bold text-[#c59b27]">
                          {entry.totalScore} đ
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#31271f] bg-[#151210] flex items-center justify-between text-xs font-sans-ui text-[#827464]">
          <span>Quy chuẩn tính điểm: Thưởng +15 điểm khi giải nhanh hơn Sherlock Holmes, phạt vượt hạn mức manh mối.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2d241c] hover:bg-[#3d3126] text-[#ded4c3] rounded cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
