import React from 'react';
import { DetectiveCase, PlayerInvestigationState } from '../types/detective.ts';
import { Feather, BookOpen, CheckCircle, ArrowRight, Save } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface NotebookTabProps {
  currentCase: DetectiveCase;
  investigation: PlayerInvestigationState;
  onNotesChange: (notes: string) => void;
  onGoToDeduction: () => void;
}

export const NotebookTab: React.FC<NotebookTabProps> = ({
  currentCase,
  investigation,
  onNotesChange,
  onGoToDeduction,
}) => {
  const visitedLeads = currentCase.leads.filter((lead) =>
    investigation.visitedLeadIds.includes(lead.id)
  );

  return (
    <div className="space-y-6">
      <div className="parchment-page p-6 md:p-8 rounded-lg shadow border border-[#d8ccb8] space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8ccb6] pb-4">
          <div>
            <div className="text-xs font-sans-ui uppercase tracking-wider font-semibold text-[#8b2b2b] flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-[#8b2b2b]" />
              <span>SỔ TAY GHI CHÉP & PHÁC THẢO SUY LUẬN</span>
            </div>
            <h2 className="text-2xl font-cinzel font-bold text-[#1a1511] mt-0.5">
              Chứng Cứ Thu Thập & Giả Thuyết Phá Án
            </h2>
          </div>

          <div className="text-xs font-sans-ui text-[#685748]">
            Đã thu thập: <strong>{visitedLeads.length}</strong> manh mối thực địa
          </div>
        </div>

        {/* 2-Column Split: Evidence Log & Personal Scratchpad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Discovered Evidence Feed */}
          <div className="space-y-3">
            <div className="text-xs font-sans-ui uppercase font-semibold text-[#665444] tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#8b2b2b]" />
              <span>Biên Bản Khám Xét Hiện Trường ({visitedLeads.length})</span>
            </div>

            {visitedLeads.length === 0 ? (
              <div className="p-6 bg-[#ede3cf] rounded border border-[#dfd2ba] text-center space-y-2">
                <p className="text-sm font-newsreader italic text-[#635343]">
                  Bạn chưa khám xét địa điểm nào trên danh bạ London.
                </p>
                <p className="text-xs font-sans-ui text-[#7e6d5b]">
                  Hãy chuyển sang tab "Danh Bạ & Manh Mối" để bắt đầu hành trình điều tra!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {visitedLeads.map((lead, idx) => (
                  <div
                    key={lead.id}
                    className="p-3.5 bg-[#fbf7ee] rounded border border-[#dfd4c0] space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px] font-sans-ui text-[#7d6c5b]">
                      <span className="font-semibold text-[#8b2b2b]">
                        #{idx + 1} · {lead.category}
                      </span>
                      <span>{lead.district}</span>
                    </div>

                    <h4 className="text-sm font-cinzel font-bold text-[#1f1914]">
                      {lead.name}
                    </h4>

                    {lead.clueFound ? (
                      <p className="text-xs font-newsreader italic text-[#261f18] bg-[#f0e6d1] p-2 rounded border border-[#d9c9ad]">
                        "{lead.clueFound}"
                      </p>
                    ) : (
                      <p className="text-xs font-newsreader text-[#5e4f40] line-clamp-2">
                        {lead.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Interactive Notes Pad */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between text-xs font-sans-ui uppercase font-semibold text-[#665444] tracking-wider">
              <div className="flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#8b2b2b]" />
                <span>Nhật Ký Suy Luận Cá Nhân (Tự động lưu)</span>
              </div>
              <span className="text-[10px] text-[#786653] lowercase italic">
                ghi chú riêng của thám tử
              </span>
            </div>

            <div className="flex-1 min-h-[320px] relative">
              <textarea
                value={investigation.notes}
                onChange={(e) => {
                  soundEngine.playKeyClick();
                  onNotesChange(e.target.value);
                }}
                placeholder="Ghi chép giả thuyết của bạn ở đây...
- Ai là kẻ có động cơ lớn nhất?
- Lời khai nào mâu thuẫn với vật chứng?
- Thủ đoạn hung thủ đã sử dụng để ngụy tạo chứng cứ ngoại phạm?
- Vật chứng mấu chốt để vạch trần kẻ phạm tội?"
                className="w-full h-full min-h-[320px] p-4 font-newsreader text-sm bg-[#faf6ec] border border-[#cfbe9f] rounded-lg text-[#1f1914] placeholder-[#8a7a69] focus:outline-none focus:border-[#8b2b2b] leading-relaxed resize-y shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Footer Shortcut to Deduction */}
        <div className="pt-4 border-t border-[#d8ccb6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-newsreader italic text-[#6d5c4b]">
            "Bản chất của suy luận là loại bỏ những chi tiết nhiễu để nhìn thấy sợi chỉ đỏ của sự thật."
          </div>

          <button
            onClick={() => {
              soundEngine.playPageFlip();
              onGoToDeduction();
            }}
            className="px-5 py-2.5 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#8b2b2b] hover:bg-[#a63434] rounded transition-colors flex items-center gap-2 cursor-pointer shadow shrink-0"
          >
            <span>Tiến Hành Phán Quyết & Giải Mã</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
