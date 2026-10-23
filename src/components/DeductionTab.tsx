import React from 'react';
import { DetectiveCase, PlayerInvestigationState } from '../types/detective.ts';
import { HelpCircle, Award, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface DeductionTabProps {
  currentCase: DetectiveCase;
  investigation: PlayerInvestigationState;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onSubmitAccusation: () => void;
  onViewVerdict: () => void;
}

export const DeductionTab: React.FC<DeductionTabProps> = ({
  currentCase,
  investigation,
  onSelectAnswer,
  onSubmitAccusation,
  onViewVerdict,
}) => {
  const answeredCount = Object.keys(investigation.answers).length;
  const totalQuestions = currentCase.questions.length;
  const isFullyAnswered = answeredCount === totalQuestions;
  const isSubmitted = investigation.isSubmitted;

  const cluesUsed = investigation.visitedLeadIds.length;

  return (
    <div className="space-y-6">
      <div className="parchment-page p-6 md:p-8 rounded-lg shadow-md border border-[#d8ccb8] space-y-6">
        {/* Header */}
        <div className="border-b border-[#d8ccb6] pb-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-sans-ui uppercase tracking-wider font-semibold text-[#8b2b2b] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#8b2b2b]" />
                <span>BẢN GIẢI MÃ & PHÁN QUYẾT TỘI PHẠM</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-[#1a1511] mt-0.5">
                Lời Buộc Tội Trước Tòa Án Luân Đôn
              </h2>
            </div>

            <div className="text-left sm:text-right text-xs font-sans-ui text-[#6a5948]">
              <div>
                Đã trả lời: <strong className="text-[#1a1511] text-sm">{answeredCount} / {totalQuestions}</strong> câu hỏi
              </div>
              <div>
                Manh mối đã dùng: <strong className="text-[#8b2b2b]">{cluesUsed}</strong> / {currentCase.clueQuota} định mức
              </div>
            </div>
          </div>

          <p className="text-xs font-newsreader italic text-[#594b3e] leading-relaxed">
            Hãy trả lời chính xác các câu hỏi then chốt dưới đây dựa trên những chứng cứ bạn đã thu thập được từ danh bạ London. Sau khi nộp bài, Sherlock Holmes sẽ công bố lời giải chi tiết và đánh giá thứ hạng thám tử của bạn.
          </p>
        </div>

        {/* If already solved previously */}
        {isSubmitted && (
          <div className="p-4 bg-[#e8f2e8] rounded-lg border border-[#bedbbf] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-sans-ui text-[#275929]">
              <CheckCircle2 className="w-5 h-5 text-[#2e6930] shrink-0" />
              <div>
                <div className="font-semibold text-sm">Vụ án này đã được bạn gửi bản giải mã!</div>
                <div>Điểm số đạt được: {investigation.score} / 100 điểm · Thứ hạng: {investigation.rank}</div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playPageFlip();
                onViewVerdict();
              }}
              className="px-4 py-2 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#2e6930] hover:bg-[#387a3b] rounded transition-colors cursor-pointer shrink-0"
            >
              Xem Chi Tiết Lời Giải Của Holmes
            </button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {currentCase.questions.map((q, qIndex) => {
            const selectedOptionId = investigation.answers[q.id];

            return (
              <div
                key={q.id}
                className="p-5 bg-[#faf6ec] rounded-lg border border-[#ddd2bc] space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[#e5dcce] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-bold text-sm text-[#8b2b2b]">
                      CÂU HỎI {qIndex + 1}:
                    </span>
                    <span className="text-xs font-sans-ui text-[#776655]">
                      ({q.points} điểm)
                    </span>
                  </div>

                  {selectedOptionId ? (
                    <span className="text-[11px] font-sans-ui text-[#2e6930] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã chọn
                    </span>
                  ) : (
                    <span className="text-[11px] font-sans-ui text-[#9c8b79] italic">
                      Chưa trả lời
                    </span>
                  )}
                </div>

                <h3 className="text-base font-newsreader font-bold text-[#1f1914] leading-snug">
                  {q.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;

                    return (
                      <label
                        key={opt.id}
                        onClick={() => {
                          if (!isSubmitted) {
                            soundEngine.playKeyClick();
                            onSelectAnswer(q.id, opt.id);
                          }
                        }}
                        className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#ede2cb] border-[#8b2b2b] text-[#1a1511] shadow-sm'
                            : 'bg-[#fcf9f2] border-[#ded4c1] hover:border-[#b8a78e] text-[#3c3127]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={isSelected}
                          disabled={isSubmitted}
                          onChange={() => {}}
                          className="mt-1 accent-[#8b2b2b] shrink-0"
                        />
                        <span className="text-sm font-newsreader leading-relaxed">
                          {opt.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Accusation Section */}
        <div className="pt-4 border-t border-[#d8ccb6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-newsreader italic text-[#635343]">
            {!isFullyAnswered ? (
              <span className="flex items-center gap-1.5 text-[#8b4f2b]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Vui lòng chọn đáp án cho toàn bộ {totalQuestions} câu hỏi trước khi nộp bản giải mã.
              </span>
            ) : (
              <span>Bạn đã hoàn thành đầy đủ các câu hỏi. Sẵn sàng nhận phán quyết!</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <button
                onClick={() => {
                  soundEngine.playPageFlip();
                  onViewVerdict();
                }}
                className="px-6 py-2.5 text-xs font-sans-ui font-medium text-[#fcf9f2] bg-[#27211b] hover:bg-[#382f27] rounded transition-colors cursor-pointer shadow"
              >
                Mở Lại Bảng Xếp Hạng & Lời Giải
              </button>
            ) : (
              <button
                disabled={!isFullyAnswered}
                onClick={() => {
                  soundEngine.playVerdictChime();
                  onSubmitAccusation();
                }}
                className={`px-6 py-2.5 text-xs font-sans-ui font-medium rounded transition-colors flex items-center gap-2 shadow cursor-pointer ${
                  isFullyAnswered
                    ? 'text-[#fcf9f2] bg-[#8b2b2b] hover:bg-[#a63434]'
                    : 'text-[#877868] bg-[#d5c7b0] cursor-not-allowed opacity-70'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Nộp Bản Giải Mã & Đối Chiếu Với Holmes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
