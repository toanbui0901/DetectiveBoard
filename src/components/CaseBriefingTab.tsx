import React from 'react';
import { DetectiveCase, PlayerInvestigationState } from '../types/detective.ts';
import { Compass, BookOpen, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface CaseBriefingTabProps {
  currentCase: DetectiveCase;
  investigation: PlayerInvestigationState;
  onGoToDirectory: () => void;
}

export const CaseBriefingTab: React.FC<CaseBriefingTabProps> = ({
  currentCase,
  investigation,
  onGoToDirectory,
}) => {
  const cluesUsed = investigation.visitedLeadIds.length;
  const remainingClues = Math.max(0, currentCase.clueQuota - cluesUsed);
  const isOverQuota = cluesUsed > currentCase.clueQuota;

  return (
    <div className="space-y-6">
      {/* Top Ledger Header */}
      <div className="parchment-page p-6 md:p-8 rounded-lg shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8cdb8] pb-3 text-xs font-sans-ui text-[#7d6f60]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#8b2b2b] uppercase tracking-wider">
              HỒ SƠ ĐIỀU TRA SỐ {String(currentCase.number).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentCase.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Độ khó: {currentCase.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-[#8b2b2b]">{currentCase.category}</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-[#1f1a16] leading-tight">
            {currentCase.title}
          </h2>
          <div className="text-xs font-newsreader italic text-[#705f50] mt-1">
            Ghi chép của Bác sĩ John H. Watson · Tham chiếu: {currentCase.originalLore}
          </div>
        </div>

        {/* Clue Limit & Benchmark HUD Banner */}
        <div className="parchment-inset p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-sans-ui font-semibold text-[#1f1a16] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#8b2b2b]" />
              <span>HẠN MỨC MANH MỐI: {currentCase.clueQuota} LƯỢT ĐIỀU TRA</span>
            </div>
            <p className="text-xs font-newsreader text-[#5e5144]">
              Sherlock Holmes chỉ cần <strong className="text-[#8b2b2b]">{currentCase.holmesCluesUsed} manh mối</strong> để phá án hoàn tất.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-sans-ui text-[#6d5e50]">
              Tiến độ của bạn: <strong className="text-[#1f1a16] text-sm">{cluesUsed} / {currentCase.clueQuota}</strong>
            </div>
            <div className="text-xs font-sans-ui">
              {isOverQuota ? (
                <span className="text-[#a82525] font-semibold flex items-center sm:justify-end gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Vượt hạn mức {cluesUsed - currentCase.clueQuota} lượt (Bị trừ điểm)
                </span>
              ) : (
                <span className="text-[#2e6930]">Còn lại {remainingClues} manh mối định mức</span>
              )}
            </div>
          </div>
        </div>

        {/* Watson's Narrative Case Briefing */}
        <div className="pt-2 space-y-3">
          <div className="text-xs font-sans-ui uppercase tracking-wider text-[#796857] font-semibold flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#8b2b2b]" />
            <span>Lời Mở Đầu Vụ Án Từ Phòng Khách 221B Baker Street</span>
          </div>

          <div className="font-newsreader text-base text-[#241d17] leading-relaxed space-y-3 border-l-2 border-[#8b2b2b]/40 pl-4 py-1 italic bg-[#fcf9f2]">
            {currentCase.initialBriefing}
          </div>
        </div>

        {/* Essential Case Facts (Victim, Crime Scene, Initial Suspects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#d8cdb8]">
          <div className="p-3.5 bg-[#f5ede0] rounded border border-[#dfd4c0] space-y-1">
            <span className="text-xs font-sans-ui font-semibold text-[#8b2b2b] uppercase tracking-wider">
              Nạn Nhân & Người Bị Hại
            </span>
            <p className="text-sm font-newsreader font-medium text-[#1e1914]">
              {currentCase.victim}
            </p>
          </div>

          <div className="p-3.5 bg-[#f5ede0] rounded border border-[#dfd4c0] space-y-1">
            <span className="text-xs font-sans-ui font-semibold text-[#8b2b2b] uppercase tracking-wider">
              Hiện Trường Trọng Yếu
            </span>
            <p className="text-sm font-newsreader font-medium text-[#1e1914]">
              {currentCase.crimeScene}
            </p>
          </div>
        </div>

        {/* Detective Advice Box */}
        <div className="p-4 bg-[#ede5d4] rounded border border-[#d8cdb6] space-y-2">
          <div className="text-xs font-sans-ui font-semibold text-[#3b3026]">
            Nguyên Tắc Điều Tra Phố Baker:
          </div>
          <p className="text-xs font-newsreader text-[#4f4337] leading-relaxed">
            "Khi đã loại trừ những điều không thể, những gì còn lại, dù kỳ quặc đến đâu, cũng chính là sự thật." — Mỗi địa điểm bạn chọn ghé thăm sẽ tiêu tốn 1 lượt manh mối từ hạn mức. Hãy bắt đầu từ hiện trường chính, thu thập lời khai và đối chiếu với bản tin báo The Times trước khi quyết định bước tiếp!
          </p>
        </div>

        {/* Action Button to Directory */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playPageFlip();
              onGoToDirectory();
            }}
            className="px-5 py-2.5 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#8b2b2b] hover:bg-[#a63434] rounded transition-colors flex items-center gap-2 cursor-pointer shadow"
          >
            <span>Mở Danh Bạ London & Tìm Manh Mối</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
