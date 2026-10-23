import React, { useState } from 'react';
import { DetectiveCase, DifficultyLevel, CaseCategory, Lead } from '../types/detective.ts';
import { X, Plus, Trash2, Save, FileText, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio.ts';

interface CreateCaseModalProps {
  onClose: () => void;
  onCaseCreated: (newCase: DetectiveCase) => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  onClose,
  onCaseCreated,
}) => {
  const [title, setTitle] = useState('');
  const [originalLore, setOriginalLore] = useState('Hồ sơ điều tra bí mật London');
  const [date, setDate] = useState('Tháng 10 năm 1892 - London');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Trung Bình');
  const [category, setCategory] = useState<CaseCategory>('Án Mạng Bí Ẩn');
  const [clueQuota, setClueQuota] = useState(11);
  const [holmesCluesUsed, setHolmesCluesUsed] = useState(5);
  const [synopsis, setSynopsis] = useState('');
  const [initialBriefing, setInitialBriefing] = useState('');
  const [victim, setVictim] = useState('');
  const [crimeScene, setCrimeScene] = useState('');
  const [newsTitle, setNewsTitle] = useState('Bản Tin Vụ Án Chấn Động');
  const [newsContent, setNewsContent] = useState('Một vụ trọng án xảy ra đêm qua tại trung tâm London...');

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: `lead-${Date.now()}-1`,
      name: 'Hiện trường vụ án',
      category: 'Hiện Trường' as const,
      address: 'Số 15 Phố Victoria, Westminster',
      district: 'Trung tâm London',
      description: 'Nạn nhân được phát hiện gục trên bàn làm việc khóa kín cửa...',
      clueFound: 'Vết bột trắng lạ trên mép ly trà.',
    },
    {
      id: `lead-${Date.now()}-2`,
      name: 'Phòng nghi phạm chính',
      category: 'Nghi Phạm' as const,
      address: 'Khu nhà trọ Soho',
      district: 'Soho',
      description: 'Khám xét ngăn kéo tìm thấy một cuốn sổ ghi nợ...',
      clueFound: 'Chiếc chìa khóa vạn năng dính vết dầu máy.',
    },
    {
      id: `lead-${Date.now()}-3`,
      name: 'Khoa Pháp y Bệnh viện St. Bartholomew',
      category: 'Pháp Y & Cơ Quan' as const,
      address: 'Bệnh viện St. Bartholomew, Smithfield',
      district: 'Thành phố London',
      description: 'Bác sĩ pháp y xác nhận độc chất ngấm qua đường tiêu hóa...',
      clueFound: 'Chất độc thuộc loại chiết xuất hiếm từ thảo mộc châu Á.',
    },
  ]);

  const [questions, setQuestions] = useState([
    {
      id: `q-${Date.now()}-1`,
      question: 'Ai là kẻ chủ mưu thực sự của vụ án?',
      points: 50,
      options: [
        { id: 'opt-a', text: 'Người quản gia trung thành', isCorrect: true, explanation: 'Chính xác! Lòng tham đã thúc đẩy hắn ra tay.' },
        { id: 'opt-b', text: 'Người bạn thân của nạn nhân', isCorrect: false, explanation: 'Sai. Anh ta có chứng cứ ngoại phạm.' },
      ],
    },
    {
      id: `q-${Date.now()}-2`,
      question: 'Thủ đoạn hạ sát nạn nhân là gì?',
      points: 50,
      options: [
        { id: 'opt-c', text: 'Đầu độc qua tách trà thảo mộc', isCorrect: true, explanation: 'Chính xác!' },
        { id: 'opt-d', text: 'Hung khí nhọn giấu trong tay áo', isCorrect: false, explanation: 'Sai.' },
      ],
    },
  ]);

  const [holmesCulprit, setHolmesCulprit] = useState('');
  const [holmesMotive, setHolmesMotive] = useState('');
  const [holmesMethod, setHolmesMethod] = useState('');
  const [holmesCritique, setHolmesCritique] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddLead = () => {
    soundEngine.playKeyClick();
    setLeads([
      ...leads,
      {
        id: `lead-${Date.now()}-${leads.length + 1}`,
        name: `Địa điểm mới #${leads.length + 1}`,
        category: 'Nhân Chứng',
        address: 'Luân Đôn',
        district: 'Trung tâm London',
        description: 'Mô tả chi tiết những gì thám tử khám xét và nghe ngóng được...',
        clueFound: 'Manh mối quan trọng phát hiện được...',
      },
    ]);
  };

  const handleRemoveLead = (idx: number) => {
    if (leads.length <= 3) {
      alert('Vụ án cần có tối thiểu 3 địa điểm điều tra.');
      return;
    }
    soundEngine.playKeyClick();
    setLeads(leads.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề vụ án.');
      return;
    }
    if (!synopsis.trim()) {
      setErrorMsg('Vui lòng nhập tóm tắt vụ án.');
      return;
    }
    if (!initialBriefing.trim()) {
      setErrorMsg('Vui lòng nhập lời mở đầu vụ án từ Dr. Watson.');
      return;
    }

    setIsSubmitting(true);
    soundEngine.playKeyClick();

    const newCasePayload: Partial<DetectiveCase> = {
      title,
      originalLore,
      date,
      difficulty,
      category,
      clueQuota: Number(clueQuota) || 10,
      holmesCluesUsed: Number(holmesCluesUsed) || 5,
      synopsis,
      initialBriefing,
      victim: victim || 'Nạn nhân giấu tên',
      crimeScene: crimeScene || 'Trung tâm London',
      newspaperClipping: {
        title: newsTitle || 'Bản tin vụ án',
        date: date || 'London, 1890',
        content: newsContent || 'Nội dung bản tin...',
        source: 'The Daily Telegraph',
      },
      leads,
      questions,
      holmesSolution: {
        summary: `Vụ án do ${holmesCulprit || 'thủ phạm'} gây ra vì ${holmesMotive || 'động cơ bí ẩn'}.`,
        culprit: holmesCulprit || 'Thủ phạm giấu mặt',
        motive: holmesMotive || 'Tài chính và tư thù',
        method: holmesMethod || 'Thủ đoạn tinh vi',
        holmesCritique: holmesCritique || 'Sherlock Holmes đã tìm ra lời giải qua việc phân tích các vật chứng mấu chốt.',
      },
      isCustom: true,
    };

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCasePayload),
      });
      const data = await response.json();

      if (data.success && data.case) {
        soundEngine.playClueFound();
        onCaseCreated(data.case);
        onClose();
      } else {
        setErrorMsg(data.message || 'Không thể lưu hồ sơ vụ án lên máy chủ.');
      }
    } catch (err: unknown) {
      console.warn('Backend POST error, adding locally:', err);
      // Fallback local creation if server offline
      const localCase: DetectiveCase = {
        id: `case-${Date.now()}`,
        number: 13,
        ...newCasePayload,
      } as DetectiveCase;
      onCaseCreated(localCase);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-create-case-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="parchment-page max-w-4xl w-full my-8 max-h-[92vh] overflow-y-auto rounded-lg shadow-2xl p-6 md:p-8 space-y-6 border-2 border-[#cfc3aa]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#1f1914] pb-4">
          <div>
            <div className="text-xs font-sans-ui text-[#8b2b2b] uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8b2b2b]" />
              <span>CẬP NHẬT MÀN CHƠI MỚI · BACKEND DATABASE EXPANSION</span>
            </div>
            <h2 id="modal-create-case-title" className="text-2xl font-cinzel font-bold text-[#1a1511] mt-1">
              Biên Soạn Hồ Sơ Vụ Án Mới
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng soạn thảo"
            className="p-1.5 text-[#736353] hover:text-[#1a1511] hover:bg-[#ebdcc4] rounded transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#faeaea] border border-[#ebcccc] text-[#a82525] text-xs font-sans-ui rounded">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans-ui text-[#2b221a]">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Tiêu Đề Vụ Án *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Vụ Án Thỏi Vàng Của Huân Tước Mayfair"
                className="w-full p-2.5 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Nguồn Cảm Hứng / Tham Chiếu</label>
              <input
                type="text"
                value={originalLore}
                onChange={(e) => setOriginalLore(e.target.value)}
                placeholder="Ví dụ: Dựa trên truyện Sherlock Holmes kinh điển"
                className="w-full p-2.5 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold block mb-1">Độ Khó</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              >
                <option value="Dễ">Dễ</option>
                <option value="Trung Bình">Trung Bình</option>
                <option value="Hóc Búa">Hóc Búa</option>
                <option value="Kỳ Tài">Kỳ Tài</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Thể Loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              >
                <option value="Án Mạng Bí Ẩn">Án Mạng Bí Ẩn</option>
                <option value="Trộm Cắp & Báu Vật">Trộm Cắp & Báu Vật</option>
                <option value="Tống Tiền & Âm Mưu">Tống Tiền & Âm Mưu</option>
                <option value="Vụ Mất Tích">Vụ Mất Tích</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Hạn Mức Manh Mối (8-15) *</label>
              <input
                type="number"
                min={8}
                max={15}
                value={clueQuota}
                onChange={(e) => setClueQuota(Number(e.target.value))}
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Sherlock Holmes Giải (lượt)</label>
              <input
                type="number"
                min={3}
                max={8}
                value={holmesCluesUsed}
                onChange={(e) => setHolmesCluesUsed(Number(e.target.value))}
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Nạn Nhân & Người Bị Hại</label>
              <input
                type="text"
                value={victim}
                onChange={(e) => setVictim(e.target.value)}
                placeholder="Ví dụ: Hầu tước George Hamilton"
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Hiện Trường Trọng Yếu</label>
              <input
                type="text"
                value={crimeScene}
                onChange={(e) => setCrimeScene(e.target.value)}
                placeholder="Ví dụ: Thư viện dinh thự Belgravia"
                className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Tóm Tắt Sơ Lược Vụ Án (Synopsis) *</label>
            <input
              type="text"
              required
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Một đoạn ngắn 1-2 câu tóm tắt nội dung để hiển thị trên danh mục tủ hồ sơ..."
              className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Lời Mở Đầu Vụ Án (Watson Briefing) *</label>
            <textarea
              required
              rows={4}
              value={initialBriefing}
              onChange={(e) => setInitialBriefing(e.target.value)}
              placeholder="Lời dẫn truyện của Dr. Watson khi khách hàng hoặc cảnh sát gõ cửa 221B Baker Street trong sương mù London..."
              className="w-full p-3 bg-[#fbf8f0] border border-[#cfbe9f] rounded font-newsreader text-sm text-[#1f1914] focus:outline-none focus:border-[#8b2b2b]"
            />
          </div>

          {/* Leads Section */}
          <div className="pt-4 border-t border-[#d8ccb6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-cinzel font-bold text-sm text-[#1a1511]">
                DANH BẠ CÁC ĐỊA ĐIỂM & MANH MỐI ({leads.length})
              </span>
              <button
                type="button"
                onClick={handleAddLead}
                className="px-3 py-1.5 bg-[#d8ccb6] hover:bg-[#c9baa2] text-[#1c1712] rounded flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Địa Điểm</span>
              </button>
            </div>

            <div className="space-y-3">
              {leads.map((lead, idx) => (
                <div key={lead.id} className="p-3 bg-[#f7f2e6] rounded border border-[#dfd4c0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#8b2b2b]">Địa Điểm #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLead(idx)}
                      className="text-[#a82525] hover:text-[#d32f2f] cursor-pointer"
                      title="Xóa địa điểm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Tên địa điểm..."
                      value={lead.name}
                      onChange={(e) => {
                        const updated = [...leads];
                        updated[idx].name = e.target.value;
                        setLeads(updated);
                      }}
                      className="p-1.5 bg-white border border-[#cfbe9f] rounded"
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ..."
                      value={lead.address}
                      onChange={(e) => {
                        const updated = [...leads];
                        updated[idx].address = e.target.value;
                        setLeads(updated);
                      }}
                      className="p-1.5 bg-white border border-[#cfbe9f] rounded"
                    />
                    <input
                      type="text"
                      placeholder="Vật chứng tìm thấy..."
                      value={lead.clueFound || ''}
                      onChange={(e) => {
                        const updated = [...leads];
                        updated[idx].clueFound = e.target.value;
                        setLeads(updated);
                      }}
                      className="p-1.5 bg-white border border-[#cfbe9f] rounded font-semibold text-[#8b2b2b]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Mô tả thực địa khám xét và lời khai..."
                    value={lead.description}
                    onChange={(e) => {
                      const updated = [...leads];
                      updated[idx].description = e.target.value;
                      setLeads(updated);
                    }}
                    className="w-full p-2 bg-white border border-[#cfbe9f] rounded font-newsreader text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Holmes Solution */}
          <div className="pt-4 border-t border-[#d8ccb6] space-y-3">
            <span className="font-cinzel font-bold text-sm text-[#1a1511] block">
              LỜI GIẢI CỦA SHERLOCK HOLMES
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Thủ phạm thực sự..."
                value={holmesCulprit}
                onChange={(e) => setHolmesCulprit(e.target.value)}
                className="p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded"
              />
              <input
                type="text"
                placeholder="Động cơ chính..."
                value={holmesMotive}
                onChange={(e) => setHolmesMotive(e.target.value)}
                className="p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded"
              />
              <input
                type="text"
                placeholder="Thủ đoạn thực hiện..."
                value={holmesMethod}
                onChange={(e) => setHolmesMethod(e.target.value)}
                className="p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Lời nhận xét của Sherlock Holmes sau khi giải mã vụ án..."
              value={holmesCritique}
              onChange={(e) => setHolmesCritique(e.target.value)}
              className="w-full p-2 bg-[#fbf8f0] border border-[#cfbe9f] rounded font-newsreader text-xs"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t-2 border-[#1f1914] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#a8967f] text-[#2d231b] hover:bg-[#ede3cf] rounded transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#8b2b2b] hover:bg-[#a63434] text-white rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Lưu...' : 'Lưu Vào Database Backend'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
