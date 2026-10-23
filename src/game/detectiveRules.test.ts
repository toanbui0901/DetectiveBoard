import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore, getRank, filterCases, visitLeadAction, validateCaseData } from './detectiveRules.ts';
import { DetectiveCase, PlayerInvestigationState } from '../types/detective.ts';

const mockCase: DetectiveCase = {
  id: 'case-test-01',
  number: 1,
  title: 'Vụ Án Dải Băng Đốm',
  originalLore: 'The Speckled Band',
  date: 'Tháng 4 năm 1883',
  difficulty: 'Trung Bình',
  category: 'Án Mạng Bí Ẩn',
  clueQuota: 10,
  holmesCluesUsed: 4,
  synopsis: 'Cái chết bí ẩn của Julia Stoner tại phòng ngủ khóa kín.',
  initialBriefing: 'Tiểu thư Helen Stoner tới 221B Baker Street...',
  victim: 'Julia Stoner',
  crimeScene: 'Stoke Moran Manor',
  newspaperClipping: {
    title: 'Bi kịch tại Surrey',
    date: '15/04/1883',
    content: 'Cái chết bất thường của con gái cố Thiếu tướng Stoner.',
    source: 'The Daily Telegraph',
  },
  leads: [
    {
      id: 'lead-1',
      name: 'Phòng ngủ Julia',
      category: 'Hiện Trường',
      address: 'Stoke Moran',
      district: 'Surrey',
      description: 'Dây chuông giả và lỗ thông gió nối sang phòng dượng.',
      clueFound: 'Lỗ thông gió giả',
    },
    {
      id: 'lead-2',
      name: 'Phòng của Dr. Roylott',
      category: 'Nghi Phạm',
      address: 'Stoke Moran',
      district: 'Surrey',
      description: 'Chiếc két sắt sắt và đĩa sữa nhỏ bên chân giường.',
      clueFound: 'Đĩa sữa và dây da nhỏ',
    },
  ],
  questions: [
    {
      id: 'q1',
      question: 'Ai là kẻ chủ mưu giết người?',
      points: 50,
      options: [
        { id: 'opt-a', text: 'Dr. Grimesby Roylott', isCorrect: true, explanation: 'Chính xác' },
        { id: 'opt-b', text: 'Helen Stoner', isCorrect: false, explanation: 'Sai' },
      ],
    },
    {
      id: 'q2',
      question: 'Thủ đoạn giết người là gì?',
      points: 50,
      options: [
        { id: 'opt-c', text: 'Rắn độc đầm lầy Ấn Độ qua lỗ thông gió', isCorrect: true, explanation: 'Chính xác' },
        { id: 'opt-d', text: 'Độc dược trong trà', isCorrect: false, explanation: 'Sai' },
      ],
    },
  ],
  holmesSolution: {
    summary: 'Roylott thả rắn độc vào lỗ thông gió...',
    culprit: 'Dr. Grimesby Roylott',
    motive: 'Chiếm đoạt tiền thừa kế',
    method: 'Rắn độc đầm lầy',
    holmesCritique: 'Vụ án chỉ cần chú ý lỗ thông gió và dây chuông.',
  },
};

test('Scoring logic awards Master Sleuth rank when answered correctly under clue quota', () => {
  const answers = { q1: 'opt-a', q2: 'opt-c' };
  const visitedLeads = ['lead-1', 'lead-2', 'lead-3']; // 3 leads, fewer than Holmes (4)
  const result = calculateScore(answers, mockCase, visitedLeads);

  assert.equal(result.rawQuestionScore, 100);
  assert.equal(result.cluesUsed, 3);
  assert.equal(result.penaltyOrBonus, 5); // 1 clue less than Holmes (4 - 3) * 5 = +5
  assert.equal(result.totalScore, 100); // capped at 100
  assert.equal(result.rank, 'MASTER_SLEUTH');
});

test('Scoring logic applies penalty when exceeding clue quota', () => {
  const answers = { q1: 'opt-a', q2: 'opt-c' };
  // quota is 10, visited 12 -> 2 clues exceeded -> -16 penalty
  const visitedLeads = Array.from({ length: 12 }, (_, i) => `lead-${i}`);
  const result = calculateScore(answers, mockCase, visitedLeads);

  assert.equal(result.cluesUsed, 12);
  assert.equal(result.penaltyOrBonus, -16);
  assert.equal(result.totalScore, 84);
  assert.equal(result.rank, 'DISTINGUISHED_CONSULTANT');
});

test('Rank boundaries test', () => {
  assert.equal(getRank(95).rank, 'MASTER_SLEUTH');
  assert.equal(getRank(80).rank, 'DISTINGUISHED_CONSULTANT');
  assert.equal(getRank(60).rank, 'SCOTLAND_YARD_INSPECTOR');
  assert.equal(getRank(40).rank, 'APPRENTICE_INVESTIGATOR');
  assert.equal(getRank(20).rank, 'LOST_IN_FOG');
});

test('Filter cases logic filters by category, difficulty and collection', () => {
  const cases: DetectiveCase[] = [
    { ...mockCase, collection: 'The Thames Murders & Other Cases (Kinh Điển)' },
    {
      ...mockCase,
      id: 'case-test-02',
      title: 'Bí Ẩn Viên Ngọc Bích',
      category: 'Trộm Cắp & Báu Vật',
      difficulty: 'Dễ',
      collection: 'The Baker Street Irregulars',
    },
    {
      ...mockCase,
      id: 'case-test-03',
      title: 'Án Mạng Không Gian Ảo',
      category: 'Án Mạng Bí Ẩn',
      difficulty: 'Hóc Búa',
      collection: 'Chronicles of Crime',
    },
  ];

  const searchRes = filterCases(cases, { search: 'ngọc bích' });
  assert.equal(searchRes.length, 1);
  assert.equal(searchRes[0].id, 'case-test-02');

  const diffRes = filterCases(cases, { difficulty: 'Dễ' });
  assert.equal(diffRes.length, 1);
  assert.equal(diffRes[0].id, 'case-test-02');

  const catRes = filterCases(cases, { category: 'Án Mạng Bí Ẩn' });
  assert.equal(catRes.length, 2);

  const colRes = filterCases(cases, { collection: 'Chronicles of Crime' });
  assert.equal(colRes.length, 1);
  assert.equal(colRes[0].id, 'case-test-03');
});

test('visitLeadAction prevents duplicate leads and tracks unique visits', () => {
  const state: PlayerInvestigationState = {
    caseId: 'case-test-01',
    visitedLeadIds: ['lead-1'],
    notes: '',
    answers: {},
    isSubmitted: false,
  };

  const updated1 = visitLeadAction(state, 'lead-2');
  assert.deepEqual(updated1.visitedLeadIds, ['lead-1', 'lead-2']);

  // Visiting same lead again should not duplicate
  const updated2 = visitLeadAction(updated1, 'lead-2');
  assert.deepEqual(updated2.visitedLeadIds, ['lead-1', 'lead-2']);
});

test('validateCaseData verifies case integrity for updates and creation', () => {
  const valid = validateCaseData({
    title: 'Vụ Án Tàu Đêm',
    synopsis: 'Một thương nhân người Pháp bị ám hại trên tàu từ Dover về London.',
    leads: mockCase.leads as any,
    questions: mockCase.questions as any,
    clueQuota: 10,
  });
  assert.equal(valid.isValid, false); // only 2 leads in mockCase.leads, requires >= 3

  const validWith3 = validateCaseData({
    title: 'Vụ Án Tàu Đêm',
    synopsis: 'Một thương nhân người Pháp bị ám hại trên tàu từ Dover về London.',
    leads: [...mockCase.leads, { id: 'l3', name: 'L3' }] as any,
    questions: mockCase.questions as any,
    clueQuota: 10,
  });
  assert.equal(validWith3.isValid, true);
});
