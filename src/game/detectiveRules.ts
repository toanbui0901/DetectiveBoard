import { DetectiveCase, PlayerInvestigationState, ScoreResult, CaseReward } from '../types/detective.ts';

export function calculateScore(
  answers: Record<string, string>,
  caseData: DetectiveCase,
  visitedLeadIds: string[]
): ScoreResult {
  let rawQuestionScore = 0;
  let maxQuestionScore = 0;

  const detailedAnswers = caseData.questions.map((q) => {
    maxQuestionScore += q.points;
    const selectedOptionId = answers[q.id];
    const selectedOption = q.options.find((opt) => opt.id === selectedOptionId);
    const isCorrect = !!selectedOption?.isCorrect;
    const pointsAwarded = isCorrect ? q.points : 0;
    rawQuestionScore += pointsAwarded;

    return {
      questionId: q.id,
      question: q.question,
      selectedOptionText: selectedOption ? selectedOption.text : '(Chưa chọn câu trả lời)',
      isCorrect,
      explanation: selectedOption?.explanation || 'Không có câu trả lời nào được ghi nhận.',
      pointsAwarded,
    };
  });

  const cluesUsed = visitedLeadIds.length;
  const clueQuota = caseData.clueQuota;
  const holmesBenchmark = caseData.holmesCluesUsed;

  // Điểm thưởng / phạt theo phong cách Sherlock Holmes Consulting Detective:
  // Nếu dùng ít hơn hoặc bằng số manh mối của Holmes: +5 điểm mỗi manh mối tiết kiệm được so với Holmes
  // Nếu vượt quá hạn mức manh mối của vụ án: -8 điểm mỗi manh mối vượt quota
  // Nếu nằm giữa Holmes và Quota: không bị phạt quota nhưng Holmes vẫn đi trước!
  let penaltyOrBonus = 0;
  if (cluesUsed <= holmesBenchmark) {
    const savedBelowHolmes = holmesBenchmark - cluesUsed;
    penaltyOrBonus = savedBelowHolmes * 5;
  } else if (cluesUsed > clueQuota) {
    const exceeded = cluesUsed - clueQuota;
    penaltyOrBonus = -(exceeded * 8);
  } else {
    // Trong khoảng (holmesBenchmark, clueQuota]:
    // Nhẹ nhàng thưởng điểm nếu tiết kiệm được so với hạn mức tối đa
    const savedBelowQuota = clueQuota - cluesUsed;
    penaltyOrBonus = Math.floor(savedBelowQuota * 2);
  }

  // Tổng điểm chuẩn hóa trên thang 100
  // Tính tỷ lệ câu hỏi đúng trước
  const questionRatio = maxQuestionScore > 0 ? (rawQuestionScore / maxQuestionScore) * 100 : 0;
  let totalScore = Math.round(questionRatio + penaltyOrBonus);
  if (totalScore < 0) totalScore = 0;
  if (totalScore > 100) totalScore = 100;

  const rankInfo = getRank(totalScore);

  let commentary = '';
  if (totalScore >= 90) {
    commentary = `Tuyệt đỉnh suy luận! Sherlock Holmes đích thân cất tẩu thuốc và ngả mũ kính phục. Bạn không chỉ vạch trần chân tướng mà còn phá án với tốc độ đáng kinh ngạc.`;
  } else if (totalScore >= 75) {
    commentary = `Tư duy phá án xuất sắc! Tiến sĩ Watson đã ghi chép lại chiến công của bạn vào cuốn nhật ký lưu niệm. Bạn tiệm cận đẳng cấp của các thám tử hàng đầu nước Anh.`;
  } else if (totalScore >= 55) {
    commentary = `Thành tích đáng nể! Thanh tra Lestrade của Scotland Yard gửi lời cảm ơn chân thành vì sự hỗ trợ đắc lực giúp phá giải hồ sơ hóc búa này.`;
  } else if (totalScore >= 35) {
    commentary = `Bạn đã nắm được một phần chân tướng nhưng còn bỏ sót các chi tiết then chốt hoặc tốn quá nhiều manh mối lan man trên đường phố London.`;
  } else {
    commentary = `Bạn đã bị đánh lừa bởi những bằng chứng giả và lạc lối trong màn sương mù dày đặc của London thời Victoria. Hãy rà soát lại hồ sơ!`;
  }

  return {
    rawQuestionScore,
    maxQuestionScore,
    penaltyOrBonus,
    totalScore,
    cluesUsed,
    clueQuota,
    holmesBenchmark,
    rank: rankInfo.rank,
    rankTitle: rankInfo.title,
    rankBadge: rankInfo.badge,
    commentary,
    detailedAnswers,
  };
}

export function getRank(score: number): { rank: string; title: string; badge: string } {
  if (score >= 90) {
    return {
      rank: 'MASTER_SLEUTH',
      title: 'Thám Tử Bậc Thầy (Đẳng Cấp Sherlock Holmes)',
      badge: '👑 Huân Chương Phố Baker',
    };
  }
  if (score >= 75) {
    return {
      rank: 'DISTINGUISHED_CONSULTANT',
      title: 'Cố Vấn Xuất Sắc (Đồng Đội Watson & Mycroft)',
      badge: '🎖️ Huy Hiệu Diogenes Club',
    };
  }
  if (score >= 55) {
    return {
      rank: 'SCOTLAND_YARD_INSPECTOR',
      title: 'Thanh Tra Scotland Yard (Trường Phái Lestrade)',
      badge: '⭐ Huy Hiệu Trưởng Đồn Cảnh Sát',
    };
  }
  if (score >= 35) {
    return {
      rank: 'APPRENTICE_INVESTIGATOR',
      title: 'Học Viên Trinh Thám Tập Sự',
      badge: '📜 Bằng Sơ Cấp Thám Tử Luân Đôn',
    };
  }
  return {
    rank: 'LOST_IN_FOG',
    title: 'Lạc Lối Trong Sương Mù Luân Đôn',
    badge: '🌫️ Đèn Lồng Tắt Lịm',
  };
}

export const DIFFICULTY_WEIGHT: Record<string, number> = {
  'Dễ': 1,
  'Trung Bình': 2,
  'Hóc Búa': 3,
  'Kỳ Tài': 4,
};

export function sortCasesByDifficulty(cases: DetectiveCase[]): DetectiveCase[] {
  return [...cases].sort((a, b) => {
    const wA = DIFFICULTY_WEIGHT[a.difficulty] || 99;
    const wB = DIFFICULTY_WEIGHT[b.difficulty] || 99;
    if (wA !== wB) return wA - wB;
    return a.number - b.number;
  });
}

export function filterCases(
  cases: DetectiveCase[],
  filters: {
    search?: string;
    difficulty?: string;
    category?: string;
    collection?: string;
    solvedIds?: string[];
    showOnlyUnsolved?: boolean;
  }
): DetectiveCase[] {
  const filtered = cases.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSynopsis = c.synopsis.toLowerCase().includes(q);
      const matchVictim = c.victim.toLowerCase().includes(q);
      const matchLore = c.originalLore.toLowerCase().includes(q);
      const matchCollection = c.collection?.toLowerCase().includes(q);
      if (!matchTitle && !matchSynopsis && !matchVictim && !matchLore && !matchCollection) return false;
    }
    if (filters.difficulty && filters.difficulty !== 'Tất cả' && c.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.category && filters.category !== 'Tất cả' && c.category !== filters.category) {
      return false;
    }
    if (filters.collection && filters.collection !== 'Tất cả' && c.collection !== filters.collection) {
      return false;
    }
    if (filters.showOnlyUnsolved && filters.solvedIds) {
      if (filters.solvedIds.includes(c.id)) return false;
    }
    return true;
  });

  return sortCasesByDifficulty(filtered);
}


export function visitLeadAction(
  currentState: PlayerInvestigationState,
  leadId: string
): PlayerInvestigationState {
  if (currentState.visitedLeadIds.includes(leadId)) {
    return currentState;
  }
  return {
    ...currentState,
    visitedLeadIds: [...currentState.visitedLeadIds, leadId],
  };
}

export function validateCaseData(data: Partial<DetectiveCase>): { isValid: boolean; error?: string } {
  if (!data.title || data.title.trim().length < 3) {
    return { isValid: false, error: 'Tiêu đề vụ án phải có ít nhất 3 ký tự.' };
  }
  if (!data.synopsis || data.synopsis.trim().length < 10) {
    return { isValid: false, error: 'Tóm tắt vụ án phải có ít nhất 10 ký tự.' };
  }
  if (!data.leads || data.leads.length < 3) {
    return { isValid: false, error: 'Hồ sơ phải có ít nhất 3 địa điểm/manh mối điều tra.' };
  }
  if (!data.questions || data.questions.length < 1) {
    return { isValid: false, error: 'Vụ án phải có ít nhất 1 câu hỏi giải mã.' };
  }
  if (!data.clueQuota || data.clueQuota < 5 || data.clueQuota > 25) {
    return { isValid: false, error: 'Hạn mức manh mối phải nằm trong khoảng từ 5 đến 25.' };
  }
  return { isValid: true };
}

export function getCaseRewardStory(caseData: DetectiveCase): CaseReward {
  if (caseData.rewardStory) {
    return caseData.rewardStory;
  }

  const culprit = caseData.holmesSolution.culprit || 'Thủ phạm giấu mặt';
  const motive = caseData.holmesSolution.motive || 'Lòng tham và những ân oán trong bóng tối';
  const method = caseData.holmesSolution.method || 'Thủ đoạn tinh vi đánh lừa cơ quan điều tra';

  return {
    headline: `ĐẠI ÁN GIẢI MÃ: ${caseData.title.toUpperCase()} — CHÂN TƯỚNG ĐƯỢC VẠCH TRẦN`,
    newspaperSpecial: {
      paperName: 'THE DAILY TELEGRAPH · ẤN BẢN ĐẶC BIỆT NỬA ĐÊM',
      issueDate: 'Luân Đôn, Số Ra Đặc Biệt Sau Phá Án',
      headline: `TẤM MÀN BÍ ẨN BỊ XÉ TOẠC: ${culprit.toUpperCase()} BỊ BẮT GIỮ TẠI TRẬN`,
      subheadline: `Cơ quan Điều tra Scotland Yard cùng các thám tử Phố Baker đã khép lại vụ án ${caseData.title} chấn động dư luận.`,
      article: `Rạng sáng nay, Sở Cảnh sát Đô thành Luân Đôn chính thức phát đi thông cáo chấn động: thủ phạm của vụ án rúng động tại ${caseData.crimeScene} đã bị tóm gọn cùng toàn bộ chứng cứ không thể chối cãi.\n\nTheo nguồn tin độc quyền từ hiện trường, kẻ sát nhân (${culprit}) đã chuẩn bị một kế hoạch vô cùng xảo quyệt với động cơ: "${motive}". Bằng thủ đoạn "${method}", hắn tưởng chừng đã đánh lừa được toàn bộ lực lượng cảnh sát và tạo ra hiện trường giả hoàn hảo.\n\nTuy nhiên, sự xuất sắc trong việc thu thập chứng cứ và tài suy luận nhạy bén của các thám tử đã từng bước bóc tách những mâu thuẫn nhỏ nhất trong lời khai. Trước sự chứng kiến của đông đảo bồi thẩm đoàn và phóng viên, hung thủ đã phải cúi đầu nhận tội. Người dân Luân Đôn có thể trút bỏ nỗi kinh hoàng khi công lý một lần nữa được thực thi trọn vẹn.`,
    },
    completeStory: {
      title: `Hồi Ký 221B Baker Street: Sự Thật Đằng Sau "${caseData.title}"`,
      author: 'Ghi chép của Bác sĩ John H. Watson, M.D.',
      chapters: [
        {
          chapterTitle: 'Chương I: Tiếng Gõ Cửa Giữa Màn Sương Mù',
          content: `Đó là một đêm ẩm ướt điển hình của Luân Đôn, khi những dải sương mù dày đặc từ dòng sông Thames cuộn tràn qua các con phố lót đá, nuốt chửng ánh sáng vàng vọt từ những cột đèn khí gas. Tại số 221B phố Baker, Sherlock Holmes ngồi lặng lẽ bên lò sưởi, đôi mắt sắc lẹm chăm chú nhìn vào một tàn tro giấy nợ bốc khói.\n\nKhi cánh cửa phòng khách bật mở với tiếng thở gấp gáp, chúng tôi nhận ra vụ án liên quan đến ${caseData.victim} không đơn thuần là một tai nạn hay một vụ cướp thông thường. Bối cảnh tại ${caseData.crimeScene} chứa đầy những mâu thuẫn kỳ quặc mà ngay cả thanh tra kỳ cựu của Scotland Yard cũng phải lắc đầu bế tắc. "${caseData.synopsis}" — từng câu chữ trong hồ sơ như một lời thách thức gửi đến trí tuệ con người.`,
        },
        {
          chapterTitle: 'Chương II: Những Manh Mối Trong Đêm Tối',
          content: `Holmes khoác chiếc áo choàng dài kẻ caro, cầm theo chiếc kính lúp và cây gậy đầu bịt bạc quen thuộc. Cuộc điều tra bắt đầu bằng việc lần theo từng địa điểm tưởng chừng như vụn vặt nhất. "${caseData.initialBriefing}"\n\nMỗi bước chân khám xét đều làm phát lộ những bí mật bị che giấu: từ những vết trầy xước tinh vi trên then cửa, tàn thuốc độc hại rơi vãi trên thảm nhung, cho đến lời khai lập lờ của các nhân chứng. Kẻ thủ ác tưởng rằng màn sương mù và thủ đoạn "${method}" đã che mắt được Thượng đế. Nhưng như Holmes thường nói: 'Không có kẻ sát nhân nào bước vào một căn phòng mà không mang theo thứ gì đó, và không bước ra mà không để lại thứ gì đó phía sau.'`,
        },
        {
          chapterTitle: 'Chương III: Lời Buộc Tội Đanh Thép Nơi Tòa Án',
          content: `Giây phút định mệnh diễn ra khi toàn bộ nghi phạm và thân chủ được triệu tập. Trong sự im lặng ngột ngạt đến nghẹt thở, những mảnh ghép rời rạc được xâu chuỗi thành một bức tranh sự thật rực sáng.\n\n"${caseData.holmesSolution.summary}"\n\nKhuôn mặt của ${culprit} biến đổi từ sự tự mãn lạnh lùng sang nỗi bàng hoàng tột độ khi từng vật chứng then chốt được đặt ngay ngắn trên bàn. Động cơ đê tiện "${motive}" bị phơi bày trước ánh sáng công lý. Cặp còng số tám lạnh buốt của Scotland Yard khép lại tội ác, trả lại danh dự và sự bình yên cho người đã khuất.`,
        },
      ],
      epilogue: `Đêm đó trở về căn phòng ấm cúng tại 221B, Holmes châm một tẩu thuốc rễ thạch nam, ngắm nhìn những vòng khói xanh lượn lờ bay lên trần nhà rồi khẽ mỉm cười: "${caseData.holmesSolution.holmesCritique || 'Khi ta đã loại trừ tất cả những gì không thể, thì những gì còn lại, dù khó tin đến đâu, ắt hẳn phải là sự thật.'}" Đó chính là bản chất của nghệ thuật suy luận thuần khiết.`,
    },
  };
}

