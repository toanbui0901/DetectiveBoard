import React from 'react';
import { DetectiveCase, ScoreResult } from '../types/detective.ts';
import { Award, CheckCircle2, XCircle, X, ChevronRight, UserCheck, BookOpen, RotateCcw, Sparkles, Newspaper } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface VerdictModalProps {
  currentCase: DetectiveCase;
  result: ScoreResult;
  onClose: () => void;
  onOpenLibrary: () => void;
  onOpenRewardStory?: () => void;
}

export const VerdictModal: React.FC<VerdictModalProps> = ({
  currentCase,
  result,
  onClose,
  onOpenLibrary,
  onOpenRewardStory,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-verdict-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="parchment-page max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 md:p-10 space-y-6 border-2 border-[#cfc3aa]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#1f1914] pb-4">
          <div>
            <div className="text-xs font-sans-ui text-[#8b2b2b] uppercase tracking-widest font-semibold">
              KẾT QUẢ ĐIỀU TRA · TÒA ÁN THỰC ĐỊA SCOTLAND YARD
            </div>
            <h2 id="modal-verdict-title" className="text-2xl md:text-3xl font-cinzel font-bold text-[#1a1511] mt-1">
              Phán Quyết Vụ Án: {currentCase.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bản phán quyết"
            className="p-1.5 text-[#736353] hover:text-[#1a1511] hover:bg-[#ebdcc4] rounded transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scorecard Hero Banner */}
        <div className="parchment-inset p-6 rounded-lg border-2 border-[#d0be9b] text-center space-y-3">
          <div className="text-xs font-sans-ui uppercase tracking-widest text-[#7a6856] font-semibold">
            ĐÁNH GIÁ NĂNG LỰC SUY LUẬN
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl md:text-6xl font-cinzel font-black text-[#8b2b2b]">
              {result.totalScore}
            </span>
            <span className="text-xl font-cinzel text-[#6b5847]">/ 100 ĐIỂM</span>
          </div>

          {/* Rank Badge */}
          <div className="inline-block py-1 px-4 bg-[#e5d8be] rounded border border-[#c4b394] text-xs md:text-sm font-sans-ui font-bold text-[#2d2218]">
            {result.rankBadge} · {result.rankTitle}
          </div>

          {/* Commentary */}
          <p className="text-sm font-newsreader italic text-[#423528] max-w-xl mx-auto leading-relaxed pt-1">
            "{result.commentary}"
          </p>

          {/* Special Reward Unlocked Banner */}
          {onOpenRewardStory && (
            <div className="pt-2">
              <button
                onClick={() => {
                  soundEngine.playVictory();
                  onOpenRewardStory();
                }}
                className="w-full py-3 px-5 bg-[#8b2b2b] hover:bg-[#a63434] text-[#fbf6ec] rounded-lg border-2 border-[#d0be9b] font-sans-ui font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-[#e8b931]" />
                <span>📜 MỞ PHẦN THƯỞNG: Đọc Bài Báo & Câu Chuyện Hoàn Chỉnh</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats Comparison strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-[#dfd1b8] text-xs font-sans-ui text-[#5e4f40]">
            <div className="p-2 bg-[#f8f3e6] rounded">
              <div className="text-[10px] uppercase text-[#887766]">Điểm câu hỏi</div>
              <div className="font-bold text-[#1f1914] text-sm">{result.rawQuestionScore} / {result.maxQuestionScore}</div>
            </div>
            <div className="p-2 bg-[#f8f3e6] rounded">
              <div className="text-[10px] uppercase text-[#887766]">Manh mối bạn dùng</div>
              <div className="font-bold text-[#1f1914] text-sm">{result.cluesUsed} / {result.clueQuota}</div>
            </div>
            <div className="p-2 bg-[#f8f3e6] rounded">
              <div className="text-[10px] uppercase text-[#887766]">Sherlock Holmes</div>
              <div className="font-bold text-[#8b2b2b] text-sm">{result.holmesBenchmark} lượt</div>
            </div>
            <div className="p-2 bg-[#f8f3e6] rounded">
              <div className="text-[10px] uppercase text-[#887766]">Thưởng / Phạt manh mối</div>
              <div className={`font-bold text-sm ${result.penaltyOrBonus >= 0 ? 'text-[#2e6930]' : 'text-[#a82525]'}`}>
                {result.penaltyOrBonus > 0 ? `+${result.penaltyOrBonus}` : result.penaltyOrBonus} điểm
              </div>
            </div>
          </div>
        </div>

        {/* Sherlock Holmes Master Breakdown Monologue */}
        <div className="space-y-3">
          <div className="text-xs font-sans-ui uppercase tracking-wider font-semibold text-[#8b2b2b] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#8b2b2b]" />
            <span>Lời Giải & Phân Tích Của Sherlock Holmes</span>
          </div>

          <div className="p-5 bg-[#fcf9f2] rounded-lg border border-[#ded3be] space-y-3 text-sm font-newsreader text-[#261f18] leading-relaxed">
            <div>
              <strong className="text-[#8b2b2b] uppercase text-xs font-sans-ui block mb-0.5">
                Chân tướng kẻ thủ ác:
              </strong>
              <p className="font-semibold text-base text-[#1a140f]">
                {currentCase.holmesSolution.culprit}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#e8ddca]">
              <div>
                <strong className="text-[#8b2b2b] uppercase text-xs font-sans-ui block mb-0.5">
                  Động cơ gây án:
                </strong>
                <p>{currentCase.holmesSolution.motive}</p>
              </div>

              <div>
                <strong className="text-[#8b2b2b] uppercase text-xs font-sans-ui block mb-0.5">
                  Thủ đoạn & Hung khí:
                </strong>
                <p>{currentCase.holmesSolution.method}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e8ddca]">
              <strong className="text-[#8b2b2b] uppercase text-xs font-sans-ui block mb-0.5">
                Toàn cảnh sự thật:
              </strong>
              <p>{currentCase.holmesSolution.summary}</p>
            </div>

            {currentCase.holmesSolution.holmesCritique && (
              <div className="pt-2 border-t border-[#e8ddca] italic text-[#57493d]">
                <strong className="text-[#8b2b2b] uppercase text-xs font-sans-ui not-italic block mb-0.5">
                  Nhận xét từ Holmes:
                </strong>
                "{currentCase.holmesSolution.holmesCritique}"
              </div>
            )}
          </div>
        </div>

        {/* Detailed Player Answers */}
        <div className="space-y-3">
          <div className="text-xs font-sans-ui uppercase tracking-wider font-semibold text-[#2d2218] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#2d2218]" />
            <span>Chi Tiết Câu Trả Lời Của Bạn</span>
          </div>

          <div className="space-y-3">
            {result.detailedAnswers.map((item, idx) => (
              <div
                key={item.questionId}
                className={`p-4 rounded border text-xs font-sans-ui space-y-1.5 ${
                  item.isCorrect
                    ? 'bg-[#f4faf4] border-[#c0dfc2]'
                    : 'bg-[#faf2f2] border-[#ebcccc]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2d2218]">
                    Câu {idx + 1}: {item.question}
                  </span>
                  <span className={`font-semibold flex items-center gap-1 ${
                    item.isCorrect ? 'text-[#2e6930]' : 'text-[#a82525]'
                  }`}>
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đúng (+{item.pointsAwarded}đ)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Chưa chính xác (0đ)
                      </>
                    )}
                  </span>
                </div>

                <div className="text-xs font-newsreader text-[#3d3126]">
                  Lựa chọn của bạn: <strong>"{item.selectedOptionText}"</strong>
                </div>

                <div className="text-xs font-newsreader italic text-[#57493d] pt-1 border-t border-black/5">
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t-2 border-[#1f1914] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundEngine.playPageFlip();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-sans-ui font-medium text-[#2d231b] border border-[#a8967f] hover:bg-[#ede3cf] rounded transition-colors cursor-pointer"
          >
            Xem Lại Sổ Tay & Danh Bạ
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onOpenRewardStory && (
              <button
                onClick={() => {
                  soundEngine.playVictory();
                  onOpenRewardStory();
                }}
                className="px-4 py-2 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#c59b27] hover:bg-[#d8ab30] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Đọc Bài Báo & Hồi Ký</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playPageFlip();
                onOpenLibrary();
              }}
              className="px-5 py-2 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#8b2b2b] hover:bg-[#a63434] rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <span>Trở Về Tủ Hồ Sơ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
