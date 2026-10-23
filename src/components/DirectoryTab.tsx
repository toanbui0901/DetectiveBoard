import React, { useState } from 'react';
import { DetectiveCase, Lead, PlayerInvestigationState } from '../types/detective.ts';
import { MapPin, CheckCircle, Search, Compass, AlertCircle, Eye, X, BookOpen, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface DirectoryTabProps {
  currentCase: DetectiveCase;
  investigation: PlayerInvestigationState;
  onVisitLead: (leadId: string) => void;
}

export const DirectoryTab: React.FC<DirectoryTabProps> = ({
  currentCase,
  investigation,
  onVisitLead,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeLeadModal, setActiveLeadModal] = useState<Lead | null>(null);

  const categories = [
    'Tất cả',
    'Hiện Trường',
    'Nghi Phạm',
    'Nhân Chứng',
    'Pháp Y & Cơ Quan',
    'Địa Điểm Đô Thị',
  ];

  const cluesUsed = investigation.visitedLeadIds.length;
  const remainingClues = Math.max(0, currentCase.clueQuota - cluesUsed);
  const isOverQuota = cluesUsed > currentCase.clueQuota;

  const filteredLeads = currentCase.leads.filter((lead) => {
    if (selectedCategory !== 'Tất cả' && lead.category !== selectedCategory) {
      return false;
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchAddr = lead.address.toLowerCase().includes(q);
      const matchDist = lead.district.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchDist) return false;
    }
    return true;
  });

  const handleOpenLead = (lead: Lead) => {
    const isAlreadyVisited = investigation.visitedLeadIds.includes(lead.id);

    if (!isAlreadyVisited) {
      // Check if user is exceeding quota
      if (cluesUsed >= currentCase.clueQuota) {
        const confirmExceed = window.confirm(
          `Cảnh báo thám tử: Bạn đã sử dụng hết ${currentCase.clueQuota} manh mối định mức của vụ án này!\n\nNếu tiếp tục điều tra thêm địa điểm "${lead.name}", bạn sẽ bị trừ điểm đánh giá năng lực so với Sherlock Holmes. Bạn có chắc chắn muốn điều tra tiếp không?`
        );
        if (!confirmExceed) return;
      }
      onVisitLead(lead.id);
      soundEngine.playClueFound();
    } else {
      soundEngine.playPageFlip();
    }

    setActiveLeadModal(lead);
  };

  return (
    <div className="space-y-6">
      {/* HUD Clue Budget Banner */}
      <div className="parchment-page p-5 rounded-lg shadow border border-[#d8ccb8] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-sans-ui uppercase tracking-wider font-semibold text-[#8b2b2b] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#8b2b2b]" />
              <span>BẢN ĐỒ & DANH BẠ ĐIỀU TRA LONDON</span>
            </div>
            <p className="text-xs font-newsreader text-[#5e5144]">
              Mỗi địa điểm mới ghé thăm sẽ tiêu tốn 1 lượt manh mối. Các địa điểm đã khám xét có thể xem lại miễn phí bất kỳ lúc nào.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#ede4d1] px-4 py-2.5 rounded border border-[#dacbb1] shrink-0">
            <div className="text-center">
              <div className="text-[11px] font-sans-ui text-[#736353] uppercase">Đã dùng</div>
              <div className="text-base font-cinzel font-bold text-[#1f1a16]">
                {cluesUsed} / {currentCase.clueQuota}
              </div>
            </div>
            <div className="h-7 w-[1px] bg-[#cfbf9f]"></div>
            <div className="text-center">
              <div className="text-[11px] font-sans-ui text-[#736353] uppercase">Holmes giải</div>
              <div className="text-base font-cinzel font-bold text-[#8b2b2b]">
                {currentCase.holmesCluesUsed} lượt
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#dfd4be] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOverQuota ? 'bg-[#a82525]' : cluesUsed > currentCase.clueQuota * 0.7 ? 'bg-[#c59b27]' : 'bg-[#3b7a3d]'
            }`}
            style={{ width: `${Math.min(100, (cluesUsed / currentCase.clueQuota) * 100)}%` }}
          />
        </div>

        {isOverQuota && (
          <div className="flex items-center gap-2 text-xs font-sans-ui text-[#a82525] bg-[#faeaea] p-2.5 rounded border border-[#ebcccc]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Cảnh báo: Bạn đã vượt quá hạn mức {cluesUsed - currentCase.clueQuota} manh mối. Điểm đánh giá cuối cùng sẽ bị trừ 8 điểm cho mỗi lượt vượt.
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#7c6f62]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm theo tên địa điểm, nhân chứng, đường phố..."
            className="w-full pl-9 pr-4 py-2 text-xs font-sans-ui bg-[#191512] border border-[#3b3127] rounded text-[#ded3c2] placeholder-[#6f6254] focus:outline-none focus:border-[#c59b27]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
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
                  : 'bg-[#1f1a16] text-[#9c8e7e] hover:text-[#ded3c2] border border-[#342a22]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => {
          const isVisited = investigation.visitedLeadIds.includes(lead.id);

          return (
            <div
              key={lead.id}
              onClick={() => handleOpenLead(lead)}
              className={`p-4 rounded-lg border transition-all cursor-pointer shadow-sm relative flex flex-col justify-between ${
                isVisited
                  ? 'bg-[#1e1b18] border-[#4f4236] hover:border-[#7c6855]'
                  : 'bg-[#181412] border-[#312720] hover:border-[#c59b27] hover:bg-[#201b17]'
              }`}
            >
              <div className="space-y-2">
                {/* Category & Status */}
                <div className="flex items-center justify-between text-xs font-sans-ui">
                  <span className="text-[#a89886] font-medium">{lead.category}</span>
                  {isVisited ? (
                    <span className="text-[#64b566] flex items-center gap-1 text-[11px] font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Đã khám xét
                    </span>
                  ) : (
                    <span className="text-[#c59b27] text-[11px]">Tốn 1 manh mối</span>
                  )}
                </div>

                {/* Lead Name */}
                <h3 className="text-base font-cinzel font-bold text-[#f5ebd7] group-hover:text-[#c59b27]">
                  {lead.name}
                </h3>

                {/* Address */}
                <div className="flex items-center gap-1 text-xs font-newsreader text-[#8a7c6e]">
                  <MapPin className="w-3 h-3 text-[#c59b27] shrink-0" />
                  <span className="truncate">{lead.address} ({lead.district})</span>
                </div>

                {/* Teaser or Extracted summary */}
                {isVisited ? (
                  <p className="text-xs font-newsreader text-[#ded2be] line-clamp-2 italic pt-1 border-t border-[#342b23]">
                    "{lead.clueFound || lead.description}"
                  </p>
                ) : (
                  <p className="text-xs font-newsreader text-[#736557] line-clamp-2 pt-1 border-t border-[#292019]">
                    Nhấp để đến tận nơi khám xét, thẩm vấn nhân chứng và thu thập bằng chứng vật lý...
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-2.5 border-t border-[#2d241c] flex items-center justify-between text-xs font-sans-ui">
                <span className="text-[11px] text-[#736557]">
                  {lead.district}
                </span>
                <span className={`font-medium ${isVisited ? 'text-[#a89886]' : 'text-[#c59b27]'}`}>
                  {isVisited ? 'Đọc Lại Ghi Chép →' : 'Tiến Hành Khám Xét →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investigation Lead Modal / Reading Desk */}
      {activeLeadModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lead-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setActiveLeadModal(null)}
        >
          <div
            className="parchment-page max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-lg shadow-2xl p-6 md:p-8 space-y-5 border-2 border-[#cfc3aa]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#d8ccb6] pb-3">
              <div>
                <div className="text-xs font-sans-ui text-[#8b2b2b] uppercase tracking-wider font-semibold">
                  {activeLeadModal.category} · {activeLeadModal.district}
                </div>
                <h3 id="modal-lead-title" className="text-2xl font-cinzel font-bold text-[#1a1511] mt-0.5">
                  {activeLeadModal.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-newsreader italic text-[#635344] mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#8b2b2b]" />
                  <span>{activeLeadModal.address}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveLeadModal(null)}
                aria-label="Đóng bảng khám xét"
                className="p-1.5 text-[#736353] hover:text-[#1a1511] hover:bg-[#ebdcc4] rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detailed Narrative */}
            <div className="space-y-4">
              <div className="text-xs font-sans-ui font-semibold uppercase tracking-wider text-[#685748] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8b2b2b]" />
                <span>Nhật Ký Thực Địa Hiện Trường</span>
              </div>

              <div className="font-newsreader text-base text-[#241d18] leading-relaxed space-y-3 p-4 bg-[#fcf9f2] rounded border border-[#dfd4bf]">
                <p>{activeLeadModal.description}</p>
              </div>

              {/* Crucial Clue Banner */}
              {activeLeadModal.clueFound && (
                <div className="p-4 bg-[#ede2cb] rounded border-2 border-[#d0be9b] space-y-1">
                  <div className="text-xs font-sans-ui font-bold text-[#8b2b2b] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8b2b2b]" />
                    <span>Manh Mối Quan Trọng Đã Được Ghi Vào Sổ Tay:</span>
                  </div>
                  <p className="text-sm font-newsreader font-semibold text-[#1c1712]">
                    "{activeLeadModal.clueFound}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#d8ccb6] flex justify-end">
              <button
                onClick={() => setActiveLeadModal(null)}
                className="px-4 py-2 text-xs font-sans-ui font-medium text-[#1c1712] bg-[#d5c6ad] hover:bg-[#c9b79b] rounded transition-colors cursor-pointer"
              >
                Gấp Hồ Sơ & Tiếp Tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
