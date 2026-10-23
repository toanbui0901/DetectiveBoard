import React, { useState } from 'react';
import { DetectiveCase, PlayerInvestigationState } from '../types/detective.ts';
import { Search, Compass, Scroll, ChevronRight, Award, Trophy, ShieldCheck, Lock } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';
import { sortCasesByDifficulty } from '../game/detectiveRules.ts';

interface CaseLibraryProps {
  cases: DetectiveCase[];
  investigations: Record<string, PlayerInvestigationState>;
  onSelectCase: (caseId: string) => void;
  onOpenLeaderboard: () => void;
  onOpenAdmin: () => void;
}

export const CaseLibrary: React.FC<CaseLibraryProps> = ({
  cases,
  investigations,
  onSelectCase,
  onOpenLeaderboard,
  onOpenAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Tất cả');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedCollection, setSelectedCollection] = useState<string>('Tất cả');
  const [onlyUnsolved, setOnlyUnsolved] = useState(false);

  const collections = [
    'Tất cả',
    'The Thames Murders & Other Cases (Kinh Điển)',
    'Jack the Ripper & West End Adventures',
    'Carlton House & Queen\'s Park',
    'The Baker Street Irregulars',
    'Detective: A Modern Crime Board Game',
    'Chronicles of Crime',
    'MicroMacro: Crime City',
    'Ace Attorney',
    'Return of the Obra Dinn',
    'Disco Elysium',
  ];


  const categories = [
    'Tất cả',
    'Án Mạng Bí Ẩn',
    'Trộm Cắp & Báu Vật',
    'Tống Tiền & Âm Mưu',
    'Vụ Mất Tích',
  ];

  const difficulties = ['Tất cả', 'Dễ', 'Trung Bình', 'Hóc Búa', 'Kỳ Tài'];

  const filteredCases = sortCasesByDifficulty(
    cases.filter((c) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSynopsis = c.synopsis.toLowerCase().includes(q);
        const matchVictim = c.victim.toLowerCase().includes(q);
        const matchLore = c.originalLore.toLowerCase().includes(q);
        const matchCollection = c.collection?.toLowerCase().includes(q);
        if (!matchTitle && !matchSynopsis && !matchVictim && !matchLore && !matchCollection) return false;
      }
      if (selectedDifficulty !== 'Tất cả' && c.difficulty !== selectedDifficulty) return false;
      if (selectedCategory !== 'Tất cả' && c.category !== selectedCategory) return false;
      if (selectedCollection !== 'Tất cả') {
        if (c.collection !== selectedCollection && !c.collection?.includes(selectedCollection)) return false;
      }
      if (onlyUnsolved) {
        const inv = investigations[c.id];
        if (inv && inv.isSubmitted) return false;
      }
      return true;
    })
  );

  const solvedCount = Object.values(investigations).filter((inv) => inv.isSubmitted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Title & Introduction Section */}
      <div className="border-b border-[#352c24] pb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-sans-ui text-[#c59b27] uppercase tracking-widest font-semibold">
              Cơ quan Điều tra Phố Baker · Tuyển Tập Board Game Trinh Thám Kinh Điển & Hiện Đại
            </div>
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-[#f5ebd7] tracking-wide mt-1">
              Tủ Hồ Sơ Vụ Án (Consulting Detective & Hiện Đại)
            </h1>
            <p className="text-sm font-newsreader italic text-[#a89989] mt-2 max-w-3xl leading-relaxed">
              Tuyển tập các vụ án từ các dòng board game trinh thám lừng danh thế giới: <em>The Thames Murders</em>, <em>Jack the Ripper & West End</em>, <em>Carlton House & Queen's Park</em>, <em>The Baker Street Irregulars</em>, cùng các dữ liệu phá án hiện đại từ <em>Detective: Modern Crime</em>, <em>Chronicles of Crime</em> và <em>MicroMacro: Crime City</em>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Leaderboard Button */}
            <button
              onClick={() => {
                soundEngine.playPageFlip();
                onOpenLeaderboard();
              }}
              className="px-3.5 py-2 text-xs font-sans-ui font-medium text-[#ded4c3] bg-[#2a221b] hover:bg-[#382d24] border border-[#483a2e] hover:border-[#635140] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              title="Bảng xếp hạng năng lực suy luận của các thám tử"
            >
              <Trophy className="w-4 h-4 text-[#c59b27]" />
              <span>Bảng Xếp Hạng</span>
            </button>

            {/* Admin Backend Button */}
            <button
              onClick={() => {
                soundEngine.playPageFlip();
                onOpenAdmin();
              }}
              className="px-3.5 py-2 text-xs font-sans-ui font-medium text-[#f5ebd7] bg-[#3b201f] hover:bg-[#4d2a28] border border-[#6b312e] hover:border-[#8f413d] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              title="Khu vực đăng nhập quản lý hồ sơ và phân quyền Scotland Yard"
            >
              <ShieldCheck className="w-4 h-4 text-[#e0a96d]" />
              <span>Khu Vực Quản Trị (Admin)</span>
            </button>
          </div>
        </div>


        {/* Clean unboxed statistics bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-sans-ui text-[#918373]">
          <span>Tổng số hồ sơ: {cases.length} vụ án</span>
          <span aria-hidden="true">·</span>
          <span>Đã giải mã: {solvedCount} / {cases.length}</span>
          <span aria-hidden="true">·</span>
          <span>Hạn mức: 8 đến 15 manh mối</span>
          <span aria-hidden="true">·</span>
          <span>Tích hợp AI sáng tác độc quyền</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4 bg-[#191512] p-4 rounded border border-[#2f2620]">
        {/* Collections filter tabs */}
        <div className="space-y-1.5">
          <div className="text-xs font-sans-ui text-[#8a7c6e] font-medium">Bộ cờ / Dòng game:</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {collections.map((col) => (
              <button
                key={col}
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedCollection(col);
                }}
                className={`px-3 py-1.5 text-xs font-sans-ui rounded transition-colors cursor-pointer ${
                  selectedCollection === col
                    ? 'bg-[#c59b27] text-[#171412] font-semibold'
                    : 'bg-[#221c17] text-[#9c8e7e] hover:text-[#ded4c3] hover:bg-[#2c241e]'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#796c5f]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm vụ án, tên nạn nhân, địa danh London..."
              className="w-full pl-9 pr-4 py-2 text-xs font-sans-ui bg-[#120f0d] border border-[#342921] rounded text-[#ded4c3] placeholder-[#6d6154] focus:outline-none focus:border-[#c59b27]"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-sans-ui text-[#9c8e7e] whitespace-nowrap">Độ khó:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="py-2 px-3 text-xs font-sans-ui bg-[#120f0d] border border-[#342921] rounded text-[#ded4c3] focus:outline-none focus:border-[#c59b27]"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Unsolved checkbox */}
          <label className="flex items-center gap-2 text-xs font-sans-ui text-[#b3a492] cursor-pointer select-none shrink-0 self-center">
            <input
              type="checkbox"
              checked={onlyUnsolved}
              onChange={(e) => setOnlyUnsolved(e.target.checked)}
              className="accent-[#c59b27] rounded"
            />
            <span>Chỉ hiện vụ án chưa giải</span>
          </label>
        </div>

        {/* Category Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-sans-ui text-[#7d6f60] mr-2">Thể loại:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playKeyClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 text-xs font-sans-ui rounded transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#c59b27] text-[#171412] font-semibold'
                  : 'bg-[#221c17] text-[#9c8e7e] hover:text-[#ded4c3] hover:bg-[#2c241e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-[#181412] rounded border border-[#2f2721] space-y-3">
          <Compass className="w-10 h-10 text-[#685c4f] mx-auto" />
          <h3 className="text-lg font-cinzel text-[#ded4c3]">Không tìm thấy hồ sơ phù hợp</h3>
          <p className="text-xs font-sans-ui text-[#8a7c6e]">
            Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc độ khó và thể loại.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => {
            const inv = investigations[c.id];
            const isSolved = inv && inv.isSubmitted;
            const cluesUsed = inv ? inv.visitedLeadIds.length : 0;

            return (
              <div
                key={c.id}
                onClick={() => {
                  soundEngine.playPageFlip();
                  onSelectCase(c.id);
                }}
                className="group cabinet-panel cabinet-panel-hover rounded-lg p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl relative overflow-hidden"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Editorial Number & Category without pill badges */}
                  <div className="flex items-center justify-between text-xs font-sans-ui text-[#9a8a79] border-b border-[#2e261f] pb-2.5">
                    <span className="font-semibold text-[#c59b27] tracking-wider">
                      HỒ SƠ #{String(c.number).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span>{c.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#baa996]">{c.difficulty}</span>
                    </div>
                  </div>

                  {/* Title, Collection & Lore */}
                  <div>
                    {c.collection && (
                      <div className="text-[11px] font-sans-ui font-semibold text-[#c59b27] tracking-wide mb-1">
                        {c.collection}
                      </div>
                    )}
                    <h3 className="text-xl font-cinzel font-bold text-[#f5ebd7] group-hover:text-[#c59b27] transition-colors leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs font-newsreader italic text-[#877869] mt-0.5 line-clamp-1">
                      {c.originalLore}
                    </p>
                  </div>

                  {/* Clean Metadata Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-sans-ui text-[#9e9080]">
                    <span>Hạn mức: {c.clueQuota} manh mối</span>
                    <span aria-hidden="true">·</span>
                    <span>Holmes: {c.holmesCluesUsed} lượt</span>
                    <span aria-hidden="true">·</span>
                    <span className="line-clamp-1">{c.crimeScene}</span>
                  </div>

                  {/* Synopsis */}
                  <p className="text-xs font-newsreader text-[#bbb09e] line-clamp-3 leading-relaxed">
                    {c.synopsis}
                  </p>
                </div>

                {/* Card Footer: Status & Action */}
                <div className="mt-5 pt-3.5 border-t border-[#2e261f] flex items-center justify-between">
                  {isSolved ? (
                    <div className="flex items-center gap-1.5 text-xs font-sans-ui text-[#c59b27]">
                      <Award className="w-3.5 h-3.5 text-[#c59b27]" />
                      <span className="font-medium">Đã phá án ({inv.score}đ · {inv.rank})</span>
                    </div>
                  ) : cluesUsed > 0 ? (
                    <div className="text-xs font-sans-ui text-[#8fa4b8]">
                      Đang điều tra ({cluesUsed}/{c.clueQuota} manh mối)
                    </div>
                  ) : (
                    <div className="text-xs font-sans-ui text-[#6d6153]">
                      Hồ sơ chưa mở
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs font-sans-ui font-medium text-[#c59b27] group-hover:translate-x-0.5 transition-transform">
                    <span>{isSolved ? 'Xem Lại' : cluesUsed > 0 ? 'Tiếp Tục' : 'Điều Tra'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
