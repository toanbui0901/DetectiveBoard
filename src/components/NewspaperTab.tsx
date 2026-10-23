import React from 'react';
import { NewspaperClipping } from '../types/detective.ts';
import { Newspaper, Calendar, MapPin, Feather } from 'lucide-react';

interface NewspaperTabProps {
  clipping: NewspaperClipping;
  caseTitle: string;
}

export const NewspaperTab: React.FC<NewspaperTabProps> = ({ clipping, caseTitle }) => {
  return (
    <div className="space-y-6">
      <div className="parchment-page p-6 md:p-10 rounded-lg shadow-lg border-2 border-[#cfc3aa] space-y-6">
        {/* Masthead Header */}
        <div className="text-center border-b-2 border-[#1c1814] pb-4 space-y-1">
          <div className="text-[10px] font-sans-ui uppercase tracking-[0.3em] text-[#635446]">
            Ấn Bản Thủ Đô Luân Đôn · Độc Quyền Báo Giới
          </div>
          <h1 className="text-3xl md:text-5xl font-cinzel font-black tracking-widest text-[#15120f] uppercase">
            {clipping.source || 'THE LONDON TIMES'}
          </h1>
          <div className="flex items-center justify-between text-[11px] font-newsreader italic border-t border-b border-[#28221c] py-1 text-[#42372e] mt-2">
            <span>Số phát hành 32.418</span>
            <span>{clipping.date || 'London, 1888'}</span>
            <span>Giá: One Penny (1d)</span>
          </div>
        </div>

        {/* Newspaper Article Content */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-xl md:text-2xl font-cinzel font-bold text-[#1f1914] leading-snug">
              {clipping.title}
            </h2>
            <div className="text-xs font-newsreader italic text-[#706051]">
              Tin điện khẩn gửi về từ Ban Biên tập Pháp đình & An ninh Trật tự
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#d8ccb6] text-sm font-newsreader text-[#261f19] leading-relaxed text-justify">
            <div className="space-y-3">
              <p className="first-letter:text-4xl first-letter:font-cinzel first-letter:float-left first-letter:mr-2 first-letter:font-bold first-letter:text-[#8b2b2b]">
                {clipping.content}
              </p>
              <p>
                Phóng viên chuyên trách tội phạm của chúng tôi cho biết: Cảnh sát Scotland Yard đang đặt toàn bộ lực lượng điều tra trong tình trạng báo động cao độ. Các nhân chứng được yêu cầu cung cấp mọi chi tiết khả nghi dù là nhỏ nhất về hiện trường và các đối tượng lân cận.
              </p>
            </div>

            <div className="space-y-3 border-l-0 md:border-l border-[#d8ccb6] md:pl-6">
              <div className="p-3 bg-[#ede4d1] rounded border border-[#dacbb1] space-y-1">
                <span className="text-[11px] font-sans-ui font-semibold text-[#8b2b2b] uppercase tracking-wider block">
                  Mẩu Tin Quảng Cáo & Thông Cáo Nhỏ
                </span>
                <p className="text-xs font-newsreader italic text-[#4f4236]">
                  "Nếu ai có manh mối về kẻ mang dấu hiệu khả nghi tại các bến tàu hoặc khách sạn trung tâm, xin hãy liên hệ ngay với Văn phòng Scotland Yard hoặc gửi thư mật tới số 221B Baker Street. Phần thưởng hậu hĩnh từ gia quyến đang chờ đợi người cung cấp tin xác thực."
                </p>
              </div>

              <p className="text-xs text-[#524538]">
                Bình luận của chuyên mục: Trong những vụ án bí ẩn như thế này tại London thời Victoria, kẻ phạm tội thường để lại những sơ hở tưởng chừng vô hại trên các đồ vật hàng ngày hoặc trong các cuốn sổ giao dịch tại ngân hàng và tiệm cầm đồ.
              </p>
            </div>
          </div>
        </div>

        {/* Footer of the newspaper clipping */}
        <div className="border-t border-[#29221b] pt-3 flex items-center justify-between text-[11px] font-sans-ui text-[#796959]">
          <span>Lưu trữ tư liệu tại Tòa soạn Phố Fleet, Luân Đôn</span>
          <span className="italic">Bản in gốc được phục chế cho hồ sơ {caseTitle}</span>
        </div>
      </div>
    </div>
  );
};
