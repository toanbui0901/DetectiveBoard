import React, { useState } from 'react';
import { DetectiveCase, DifficultyLevel } from '../types/detective.ts';
import { Sparkles, X, Brain, Wand2, Compass, AlertCircle, CheckCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface AIGenerateModalProps {
  onClose: () => void;
  onCaseGenerated: (newCase: DetectiveCase) => void;
}

export const AIGenerateModal: React.FC<AIGenerateModalProps> = ({
  onClose,
  onCaseGenerated,
}) => {
  const collectionPresets = [
    {
      id: 'the-thames-murders',
      name: 'The Thames Murders & Other Cases (Kinh Điển)',
      desc: 'Án mạng sương mù sông Thames, dinh thự cổ, độc dược và phòng khóa kín kinh điển phong cách Arthur Conan Doyle.',
    },
    {
      id: 'jack-the-ripper',
      name: 'Jack the Ripper & West End Adventures',
      desc: 'Săn lùng kẻ sát nhân bóng ma tại Whitechapel, thư nặc danh mực đỏ, bóng tối Đông London và âm mưu quý tộc.',
    },
    {
      id: 'carlton-house',
      name: 'Carlton House & Queen\'s Park',
      desc: 'Bi kịch trong các câu lạc bộ thượng lưu Mayfair, dạ tiệc ngoại giao và các vụ thanh trừng bí mật trong công viên hoàng gia.',
    },
    {
      id: 'baker-street-irregulars',
      name: 'The Baker Street Irregulars',
      desc: 'Mạng lưới thám tử thiếu niên đường phố London, mật mã vẽ bằng than và các vụ trộm cắp bến tàu ngầm.',
    },
    {
      id: 'detective-modern',
      name: 'Detective: A Modern Crime Board Game',
      desc: 'Cơ sở dữ liệu Antares Database, xét nghiệm ADN, camera an ninh CCTV và dấu vết kỹ thuật số hiện đại.',
    },
    {
      id: 'chronicles-of-crime',
      name: 'Chronicles of Crime',
      desc: 'Điều tra đa chiều, phân tích vật chứng vi thể và công nghệ quét thực tế ảo kết hợp logic thẩm vấn.',
    },
    {
      id: 'micromacro-city',
      name: 'MicroMacro: Crime City',
      desc: 'Suy luận không gian - thời gian, truy vết đường chạy trốn của nghi phạm qua các ngã tư và bản đồ đường phố.',
    },
    {
      id: 'ace-attorney',
      name: 'Ace Attorney',
      desc: 'Đấu trí pháp đình nảy lửa, phản bác mâu thuẫn nhân chứng, lật ngược thế cờ và bóc trần hung thủ thật sự.',
    },
    {
      id: 'obra-dinn',
      name: 'Return of the Obra Dinn',
      desc: 'Đồng hồ Memento Mortem tái hiện khoảnh khắc tử kiếp, suy luận danh tính 60 sinh mạng trên con tàu ma mất tích.',
    },
    {
      id: 'disco-elysium',
      name: 'Disco Elysium',
      desc: 'Tâm lý học trinh thám kiệt xuất tại Martinaise, vết đạn bắn tỉa bí ẩn, thám tử RCM và âm mưu công đoàn bến cảng.',
    },
  ];


  const [selectedCollection, setSelectedCollection] = useState(collectionPresets[0].name);
  const [themeInput, setThemeInput] = useState('Bí ẩn phòng thí nghiệm bí mật');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Trung Bình');
  const [clueQuota, setClueQuota] = useState(11);
  const [promptExtra, setPromptExtra] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    soundEngine.playKeyClick();

    try {
      const response = await fetch('/api/cases/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: selectedCollection,
          theme: themeInput,
          difficulty,
          clueQuota: Number(clueQuota) || 11,
          promptExtra,
        }),
      });

      const data = await response.json();
      if (data.success && data.case) {
        soundEngine.playVerdictChime();
        onCaseGenerated(data.case);
        onClose();
      } else {
        setErrorMsg(data.message || 'Không thể tạo vụ án bằng AI.');
      }
    } catch (err: unknown) {
      setErrorMsg('Lỗi kết nối máy chủ backend khi tạo vụ án.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ai-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="parchment-page max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 md:p-8 space-y-6 border-2 border-[#cfc3aa]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#1f1914] pb-4">
          <div>
            <div className="text-xs font-sans-ui text-[#8b2b2b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8b2b2b]" />
              <span>CÔNG CỤ BIÊN KỊCH TỰ ĐỘNG · BACKEND AI GENERATOR</span>
            </div>
            <h2 id="modal-ai-title" className="text-2xl font-cinzel font-bold text-[#1a1511] mt-1">
              Khởi Tạo Hồ Sơ Vụ Án Bằng AI
            </h2>
            <p className="text-xs font-newsreader italic text-[#635344] mt-0.5">
              Mô hình AI sẽ tự động biên kịch hồ sơ hoàn chỉnh gồm tóm tắt, bản tin báo chí, 4-6 địa điểm điều tra chi tiết, câu hỏi giải mã và lời giải phá án.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng tạo AI"
            className="p-1.5 text-[#736353] hover:text-[#1a1511] hover:bg-[#ebdcc4] rounded transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#faeaea] border border-[#ebcccc] text-[#a82525] text-xs font-sans-ui rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6 text-xs font-sans-ui text-[#2b221a]">
          {/* Board Game Collection Selector */}
          <div className="space-y-2">
            <label className="font-bold text-xs uppercase tracking-wider block text-[#1a1511]">
              1. Chọn Dòng Board Game Nguồn Cảm Hứng
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-[#cfbe9f] rounded bg-[#f7f2e6]">
              {collectionPresets.map((col) => {
                const isSelected = selectedCollection === col.name;
                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      soundEngine.playKeyClick();
                      setSelectedCollection(col.name);
                    }}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#ede2cb] border-[#8b2b2b] text-[#1a1511] shadow-sm'
                        : 'bg-white/80 border-[#ded3be] hover:border-[#b8a78e] text-[#3c3127]'
                    }`}
                  >
                    <div className="font-cinzel font-bold text-xs text-[#8b2b2b] flex items-center justify-between">
                      <span>{col.name}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#8b2b2b]" />}
                    </div>
                    <p className="text-[11px] font-newsreader italic text-[#635344] mt-1 leading-snug">
                      {col.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme & Difficulty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="font-semibold block mb-1">2. Chủ Đề / Hiện Trường Bí Ẩn</label>
              <input
                type="text"
                required
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Ví dụ: Án mạng phòng tranh Piccadilly, Vụ cướp xe thư tín Dover..."
                className="w-full p-2.5 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Độ Khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full p-2.5 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              >
                <option value="Dễ">Dễ</option>
                <option value="Trung Bình">Trung Bình</option>
                <option value="Hóc Búa">Hóc Búa</option>
                <option value="Kỳ Tài">Kỳ Tài</option>
              </select>
            </div>
          </div>

          {/* Clue Quota Slider */}
          <div className="p-3 bg-[#ede4d1] rounded border border-[#dacbb1] space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#8b2b2b]" />
                Hạn Mức Manh Mối Quy Định Cho Màn Chơi:
              </span>
              <span className="font-cinzel text-base font-bold text-[#8b2b2b]">
                {clueQuota} Manh Mối
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={15}
              value={clueQuota}
              onChange={(e) => setClueQuota(Number(e.target.value))}
              className="w-full accent-[#8b2b2b] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-sans-ui text-[#736353]">
              <span>8 (Nhanh & Tinh gọn)</span>
              <span>11 (Chuẩn mực Consulting Detective)</span>
              <span>15 (Đại án phức tạp)</span>
            </div>
          </div>

          {/* Extra Prompt / Creative Notes */}
          <div>
            <label className="font-semibold block mb-1">
              3. Ghi Chú Sáng Tạo Bổ Sung (Tùy chọn)
            </label>
            <input
              type="text"
              value={promptExtra}
              onChange={(e) => setPromptExtra(e.target.value)}
              placeholder="Ví dụ: Cho thêm chi tiết về một nhân chứng mù, hoặc hung khí giấu trong chiếc đồng hồ cổ..."
              className="w-full p-2.5 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t-2 border-[#1f1914] flex justify-end gap-3 items-center">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 border border-[#a8967f] text-[#2d231b] hover:bg-[#ede3cf] rounded transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#8b2b2b] hover:bg-[#a63434] text-white rounded font-medium flex items-center gap-2 transition-colors cursor-pointer shadow disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin" />
                  <span>AI Đang Soạn Hồ Sơ Vụ Án...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Vụ Án Bằng AI Backend</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
