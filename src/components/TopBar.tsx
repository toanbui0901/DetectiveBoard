import React from 'react';
import { Volume2, VolumeX, FolderArchive, Trophy, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

interface TopBarProps {
  activeView: 'cases_library' | 'investigation';
  activeTab: 'briefing' | 'newspaper' | 'directory' | 'notebook' | 'deduction';
  setActiveTab: (tab: 'briefing' | 'newspaper' | 'directory' | 'notebook' | 'deduction') => void;
  onOpenLibrary: () => void;
  onOpenLeaderboard?: () => void;
  onOpenAdmin?: () => void;
  onOpenRewardStory?: () => void;
  isCaseSolved?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  caseTitle?: string;
  caseNumber?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  activeTab,
  setActiveTab,
  onOpenLibrary,
  onOpenLeaderboard,
  onOpenAdmin,
  onOpenRewardStory,
  isCaseSolved,
  isMuted,
  onToggleMute,
  caseTitle,
  caseNumber,
}) => {
  return (
    <header className="border-b border-[#342b23] bg-[#1a1613] px-4 md:px-8 py-3.5 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenLibrary}
            className="text-left group cursor-pointer focus:outline-none"
            title="Trở về Thư viện Vụ án London"
          >
            <span className="font-cinzel text-lg md:text-xl font-bold tracking-wider text-[#e6ded2] group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
              THÁM TỬ PHỐ BAKER
            </span>
            <div className="text-[11px] font-sans-ui text-[#9c8e7e] tracking-widest uppercase">
              London 1888 · Consulting Detective
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        {activeView === 'investigation' ? (
          <nav className="hidden lg:flex items-center gap-5 text-sm font-sans-ui font-medium text-[#b3a492]">
            <button
              onClick={() => setActiveTab('briefing')}
              className={`hover:text-[#e6ded2] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'briefing'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-semibold'
                  : ''
              }`}
            >
              Hồ Sơ Vụ Án
            </button>
            <button
              onClick={() => setActiveTab('newspaper')}
              className={`hover:text-[#e6ded2] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'newspaper'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-semibold'
                  : ''
              }`}
            >
              Báo The Times
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`hover:text-[#e6ded2] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'directory'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-semibold'
                  : ''
              }`}
            >
              Manh Mối
            </button>
            <button
              onClick={() => setActiveTab('notebook')}
              className={`hover:text-[#e6ded2] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'notebook'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-semibold'
                  : ''
              }`}
            >
              Sổ Tay Điều Tra
            </button>
            <button
              onClick={() => setActiveTab('deduction')}
              className={`hover:text-[#e6ded2] transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'deduction'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37] font-semibold'
                  : ''
              }`}
            >
              Phán Quyết Cuối
            </button>

            {/* If solved, show exclusive reward button right in nav */}
            {isCaseSolved && onOpenRewardStory && (
              <button
                onClick={onOpenRewardStory}
                className="px-2.5 py-1 text-xs text-[#f5ebd7] bg-[#752424] hover:bg-[#8f2c2c] border border-[#a83b3b] rounded flex items-center gap-1.5 cursor-pointer shadow transition-colors animate-pulse"
                title="Đọc bài báo và câu chuyện toàn cảnh của Bác sĩ Watson"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e8b931]" />
                <span>Phần Thưởng Phá Án</span>
              </button>
            )}
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-5 text-xs font-sans-ui text-[#9c8e7e]">
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="hover:text-[#e6ded2] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Bảng Xếp Hạng</span>
              </button>
            )}
            <span aria-hidden="true">·</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-[#e6ded2] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#e0a96d]" />
                <span>Khu Vực Quản Trị</span>
              </button>
            )}
            <span aria-hidden="true">·</span>
            <span>Hạn Mức 8-15 Manh Mối</span>
          </div>
        )}

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
            className="p-2 text-[#9c8e7e] hover:text-[#e6ded2] rounded border border-[#3b3128] hover:border-[#524438] transition-colors cursor-pointer"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenLibrary}
            className="px-3.5 py-1.5 text-xs font-sans-ui font-medium text-[#e6ded2] bg-[#27211b] hover:bg-[#362e26] border border-[#483c31] rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <FolderArchive className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{activeView === 'investigation' ? 'Đổi Vụ Án' : 'Tủ Hồ Sơ'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
