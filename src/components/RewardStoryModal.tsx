import React, { useState } from 'react';
import { DetectiveCase, CaseReward } from '../types/detective.ts';
import { getCaseRewardStory } from '../game/detectiveRules.ts';
import { Newspaper, BookOpen, X, Sparkles, Download, Check, Award, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface RewardStoryModalProps {
  currentCase: DetectiveCase;
  isOpen: boolean;
  onClose: () => void;
}

export const RewardStoryModal: React.FC<RewardStoryModalProps> = ({
  currentCase,
  isOpen,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'newspaper' | 'story'>('newspaper');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reward: CaseReward = getCaseRewardStory(currentCase);

  const handleCopyStory = () => {
    const fullText = `=== ${reward.newspaperSpecial.paperName} ===\n${reward.newspaperSpecial.headline}\n${reward.newspaperSpecial.subheadline}\n\n${reward.newspaperSpecial.article}\n\n=== ${reward.completeStory.title} ===\n${reward.completeStory.author}\n\n` +
      reward.completeStory.chapters.map((ch) => `${ch.chapterTitle}\n${ch.content}`).join('\n\n') +
      `\n\nLời Bạt:\n${reward.completeStory.epilogue}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reward-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#171310] border-2 border-[#8a6820] max-w-4xl w-full my-6 max-h-[92vh] overflow-hidden rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1e1712] border-b border-[#3d2f21] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#382613] border border-[#6b4c1c] flex items-center justify-center text-[#e8b931]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-sans-ui text-[#c59b27] uppercase tracking-widest font-bold">
                PHẦN THƯỞNG PHÁ ÁN · VĂN KHỐ BẢO VẬT PHỐ BAKER
              </div>
              <h2 id="modal-reward-title" className="text-xl md:text-2xl font-cinzel font-bold text-[#f5ebd7]">
                Bài Báo Độc Quyền & Hồi Ký Toàn Cảnh
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStory}
              className="px-3 py-1.5 text-xs font-sans-ui bg-[#2b2118] hover:bg-[#382a1d] text-[#ded4c3] rounded border border-[#483726] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sao chép toàn bộ bài báo và câu chuyện"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-[#c59b27]" />}
              <span>{copied ? 'Đã Lưu!' : 'Sao Chép Văn Bản'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8f8070] hover:text-[#f5ebd7] rounded transition-colors cursor-pointer"
              aria-label="Đóng phần thưởng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-[#14100d] border-b border-[#2e2319] px-6 py-2.5 flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playPageFlip();
              setActiveView('newspaper');
            }}
            className={`px-4 py-2 text-xs font-sans-ui rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeView === 'newspaper'
                ? 'bg-[#c59b27] text-[#14110e] font-bold shadow'
                : 'text-[#9c8d7c] hover:text-[#ded4c3] hover:bg-[#221a14]'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Bài Báo Thời Sự Đặc Biệt</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playPageFlip();
              setActiveView('story');
            }}
            className={`px-4 py-2 text-xs font-sans-ui rounded transition-colors flex items-center gap-2 cursor-pointer ${
              activeView === 'story'
                ? 'bg-[#c59b27] text-[#14110e] font-bold shadow'
                : 'text-[#9c8d7c] hover:text-[#ded4c3] hover:bg-[#221a14]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hồi Ký Bác Sĩ Watson (Câu Chuyện Hoàn Chỉnh)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
          {/* 1. NEWSPAPER VIEW */}
          {activeView === 'newspaper' && (
            <div className="parchment-page p-6 md:p-10 rounded-lg border-2 border-[#2b221a] shadow-inner text-[#1f1914] space-y-6">
              {/* Newspaper Masthead */}
              <div className="text-center border-b-4 border-[#1f1914] pb-4 space-y-1">
                <div className="text-[11px] font-sans-ui uppercase tracking-widest text-[#5c4a3b] font-semibold">
                  ẤN BẢN ĐẶC BIỆT NỬA ĐÊM · PHÁT HÀNH TRÊN TOÀN ĐẾ QUỐC ANH
                </div>
                <h1 className="text-3xl md:text-5xl font-cinzel font-black tracking-tight text-[#1f1914]">
                  {reward.newspaperSpecial.paperName}
                </h1>
                <div className="flex items-center justify-between text-[11px] font-sans-ui border-t border-b border-[#1f1914] py-1 mt-2 text-[#4a3b2e]">
                  <span>{reward.newspaperSpecial.issueDate}</span>
                  <span>GIÁ BÁN: MỘT PENNY (1d)</span>
                  <span>SỐ HIỆU: ĐẠI ÁN #{String(currentCase.number).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Breaking Headline */}
              <div className="text-center space-y-2 border-b-2 border-[#1f1914] pb-4">
                <h2 className="text-xl md:text-3xl font-cinzel font-bold text-[#8b2b2b] leading-tight">
                  {reward.newspaperSpecial.headline}
                </h2>
                <p className="text-sm font-newsreader italic text-[#4a3b2e] max-w-2xl mx-auto">
                  {reward.newspaperSpecial.subheadline}
                </p>
              </div>

              {/* Newspaper Body in vintage columns */}
              <div className="text-sm font-newsreader leading-relaxed text-[#2d241c] space-y-4 whitespace-pre-line text-justify columns-1 md:columns-2 gap-8 pt-2">
                {reward.newspaperSpecial.article}
              </div>

              <div className="border-t border-[#1f1914] pt-3 text-[11px] font-sans-ui text-center text-[#6e5d4e] italic">
                Bản quyền tin tức thuộc Hãng Thông Tấn Trung Tâm London & Phóng viên hiện trường Scotland Yard.
              </div>
            </div>
          )}

          {/* 2. COMPLETE STORY VIEW */}
          {activeView === 'story' && (
            <div className="parchment-page p-6 md:p-12 rounded-lg border-2 border-[#2b221a] shadow-inner text-[#1f1914] space-y-8">
              {/* Title Section */}
              <div className="text-center space-y-2 border-b-2 border-[#1f1914] pb-6">
                <div className="text-xs font-sans-ui uppercase tracking-widest text-[#8b2b2b] font-bold">
                  TUYỂN TẬP GHI CHÉP CHƯA TỪNG CÔNG BỐ
                </div>
                <h1 className="text-2xl md:text-4xl font-cinzel font-bold text-[#1f1914]">
                  {reward.completeStory.title}
                </h1>
                <p className="text-sm font-newsreader italic text-[#594738]">
                  {reward.completeStory.author}
                </p>
              </div>

              {/* Chapters */}
              <div className="space-y-8">
                {reward.completeStory.chapters.map((ch, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-lg md:text-xl font-cinzel font-bold text-[#8b2b2b] border-b border-[#dfd2bb] pb-1.5">
                      {ch.chapterTitle}
                    </h3>
                    <p className="text-base font-newsreader text-[#2d241c] leading-relaxed whitespace-pre-line text-justify first-letter:text-4xl first-letter:font-cinzel first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-[#8b2b2b]">
                      {ch.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Epilogue */}
              <div className="p-6 bg-[#f2e7d3] rounded-lg border-l-4 border-[#8b2b2b] space-y-2">
                <div className="text-xs font-sans-ui uppercase font-bold text-[#8b2b2b]">
                  Lời Bạt Của Sherlock Holmes
                </div>
                <p className="text-sm font-newsreader italic text-[#3a2f24] leading-relaxed">
                  {reward.completeStory.epilogue}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#1e1712] border-t border-[#3d2f21] p-4 flex items-center justify-between text-xs font-sans-ui text-[#9c8d7c]">
          <span>Phần thưởng danh dự dành cho thám tử đã hoàn thành giải mã vụ án.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2d2319] hover:bg-[#3b2e22] text-[#ded4c3] rounded cursor-pointer transition-colors"
          >
            Đóng Lại
          </button>
        </div>
      </div>
    </div>
  );
};
