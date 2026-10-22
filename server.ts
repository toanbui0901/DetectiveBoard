import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_CASES } from './src/data/initialCases.ts';
import { DetectiveCase, User, UserRole, UserToken, LeaderboardUser } from './src/types/detective.ts';
import { calculateScore, filterCases, validateCaseData, sortCasesByDifficulty } from './src/game/detectiveRules.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// In-memory cases store initialized with classic initial cases
let casesDatabase: DetectiveCase[] = sortCasesByDifficulty([...INITIAL_CASES]);

const DATA_DIR = path.resolve(__dirname, 'data');
const CASES_FILE = path.resolve(DATA_DIR, 'custom_cases.json');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');

// Default Users and Detectives in Victorian London
const INITIAL_USERS: User[] = [
  {
    id: 'user-holmes',
    username: 'holmes',
    fullName: 'Sherlock Holmes',
    email: 'holmes@221b-bakerstreet.co.uk',
    role: 'superadmin',
    roleTitle: 'Cố Vấn Tối Cao Scotland Yard',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases', 'edit_delete_cases', 'manage_users', 'manage_tokens'],
    tokenBalance: 9999,
    casesSolved: 19,
    totalScore: 1900,
    createdAt: '1888-01-01T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-holmes-1',
        userId: 'user-holmes',
        tokenKey: 'sh-master-221b-88a91c',
        name: 'Baker Street Primary Key',
        createdAt: '1888-01-01T00:00:00.000Z',
        expiresAt: '1899-12-31T23:59:59.000Z',
        status: 'active',
        usageCount: 428,
        quotaLimit: 10000,
      },
    ],
  },
  {
    id: 'user-buiductoan',
    username: 'admin',
    fullName: 'Bùi Đức Toàn (Thám Tử Trưởng)',
    email: 'buiductoan@vis.com.vn',
    role: 'admin',
    roleTitle: 'Quản Trị Viên Hồ Sơ & Điều Tra',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases', 'edit_delete_cases', 'manage_users', 'manage_tokens'],
    tokenBalance: 2500,
    casesSolved: 17,
    totalScore: 1680,
    createdAt: '1888-02-15T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-admin-1',
        userId: 'user-buiductoan',
        tokenKey: 'vis-adm-toan-94b2e1',
        name: 'Admin Chief Access Token',
        createdAt: '1888-02-15T00:00:00.000Z',
        expiresAt: '1895-12-31T23:59:59.000Z',
        status: 'active',
        usageCount: 156,
        quotaLimit: 5000,
      },
    ],
  },
  {
    id: 'user-mycroft',
    username: 'mycroft',
    fullName: 'Mycroft Holmes',
    email: 'mycroft@diogenes-club.gov.uk',
    role: 'superadmin',
    roleTitle: 'Chánh Văn Phòng Nội Các & Diogenes',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases', 'edit_delete_cases', 'manage_users', 'manage_tokens'],
    tokenBalance: 5000,
    casesSolved: 18,
    totalScore: 1820,
    createdAt: '1888-01-10T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-mycroft-1',
        userId: 'user-mycroft',
        tokenKey: 'dio-mycroft-77c4d9',
        name: 'Diogenes Confidential Key',
        createdAt: '1888-01-10T00:00:00.000Z',
        expiresAt: '1896-01-01T00:00:00.000Z',
        status: 'active',
        usageCount: 89,
        quotaLimit: 5000,
      },
    ],
  },
  {
    id: 'user-watson',
    username: 'watson',
    fullName: 'Dr. John H. Watson',
    email: 'watson@royal-infirmary.co.uk',
    role: 'investigator',
    roleTitle: 'Điều Tra Viên & Sử Gia Phố Baker',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases'],
    tokenBalance: 450,
    casesSolved: 16,
    totalScore: 1480,
    createdAt: '1888-01-05T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-watson-1',
        userId: 'user-watson',
        tokenKey: 'jw-archive-38f12a',
        name: 'Watson Chronicle Key',
        createdAt: '1888-01-05T00:00:00.000Z',
        expiresAt: '1892-06-30T00:00:00.000Z',
        status: 'active',
        usageCount: 92,
        quotaLimit: 1000,
      },
    ],
  },
  {
    id: 'user-lestrade',
    username: 'lestrade',
    fullName: 'G. Lestrade (Thanh Tra)',
    email: 'lestrade@scotlandyard.police.uk',
    role: 'investigator',
    roleTitle: 'Thanh Tra Scotland Yard',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases'],
    tokenBalance: 320,
    casesSolved: 14,
    totalScore: 1190,
    createdAt: '1888-03-01T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-lestrade-1',
        userId: 'user-lestrade',
        tokenKey: 'sy-lestrade-55a802',
        name: 'Scotland Yard Warrant Key',
        createdAt: '1888-03-01T00:00:00.000Z',
        expiresAt: '1891-12-31T00:00:00.000Z',
        status: 'active',
        usageCount: 64,
        quotaLimit: 500,
      },
    ],
  },
  {
    id: 'user-irene',
    username: 'irene',
    fullName: 'Irene Adler',
    email: 'irene.adler@la-scala-opera.it',
    role: 'investigator',
    roleTitle: 'Nữ Danh Ca & Thám Tử Tự Do',
    status: 'active',
    permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases'],
    tokenBalance: 600,
    casesSolved: 17,
    totalScore: 1710,
    createdAt: '1888-02-20T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-irene-1',
        userId: 'user-irene',
        tokenKey: 'ia-bohemia-99d71c',
        name: 'Bohemia Secret Token',
        createdAt: '1888-02-20T00:00:00.000Z',
        expiresAt: '1893-12-31T00:00:00.000Z',
        status: 'active',
        usageCount: 118,
        quotaLimit: 1200,
      },
    ],
  },
  {
    id: 'user-wiggins',
    username: 'wiggins',
    fullName: 'Wiggins',
    email: 'wiggins@baker-irregulars.org',
    role: 'detective',
    roleTitle: 'Trưởng Đội Thám Tử Nhí Phố Baker',
    status: 'active',
    permissions: ['play_cases'],
    tokenBalance: 120,
    casesSolved: 11,
    totalScore: 950,
    createdAt: '1888-04-12T00:00:00.000Z',
    tokens: [
      {
        id: 'tok-wiggins-1',
        userId: 'user-wiggins',
        tokenKey: 'wig-dock-12b77a',
        name: 'Irregulars Dock Watch Token',
        createdAt: '1888-04-12T00:00:00.000Z',
        expiresAt: '1890-12-31T00:00:00.000Z',
        status: 'active',
        usageCount: 37,
        quotaLimit: 300,
      },
    ],
  },
];

let usersDatabase: User[] = [...INITIAL_USERS];

// Load custom cases and users from disk if previously saved
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(CASES_FILE)) {
    const raw = fs.readFileSync(CASES_FILE, 'utf-8');
    const customCases: DetectiveCase[] = JSON.parse(raw);
    if (Array.isArray(customCases) && customCases.length > 0) {
      customCases.forEach((cc) => {
        const existingIdx = casesDatabase.findIndex((c) => c.id === cc.id);
        if (existingIdx >= 0) {
          casesDatabase[existingIdx] = cc;
        } else {
          casesDatabase.push(cc);
        }
      });
      casesDatabase = sortCasesByDifficulty(casesDatabase);
    }
  }
  if (fs.existsSync(USERS_FILE)) {
    const rawUsers = fs.readFileSync(USERS_FILE, 'utf-8');
    const savedUsers: User[] = JSON.parse(rawUsers);
    if (Array.isArray(savedUsers) && savedUsers.length > 0) {
      usersDatabase = savedUsers;
    }
  }
} catch (e) {
  console.warn('Could not load data files:', e);
}

function saveCustomCases() {
  try {
    const customCases = casesDatabase.filter((c) => c.isCustom);
    fs.writeFileSync(CASES_FILE, JSON.stringify(customCases, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save custom cases:', e);
  }
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersDatabase, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}


async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // API Endpoints
  // 1. Get all cases (with optional filters)
  app.get('/api/cases', (req, res) => {
    const { search, difficulty, category, collection } = req.query as {
      search?: string;
      difficulty?: string;
      category?: string;
      collection?: string;
    };
    const results = filterCases(casesDatabase, { search, difficulty, category, collection });
    res.json({
      success: true,
      total: results.length,
      cases: results,
    });
  });

  // 2. Get specific case by id
  app.get('/api/cases/:id', (req, res) => {
    const c = casesDatabase.find((item) => item.id === req.params.id);
    if (!c) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ vụ án.' });
    }
    res.json({ success: true, case: c });
  });

  // 2b. AI-Powered Case Generation endpoint using Gemini API
  app.post('/api/cases/generate-ai', async (req, res) => {
    const {
      theme = 'Victorian London',
      collection = 'Sherlock Holmes Cổ Điển',
      difficulty = 'Trung Bình',
      clueQuota = 11,
      promptExtra = '',
    } = req.body;

    const nextNumber = casesDatabase.length + 1;
    const caseId = `case-ai-${Date.now()}`;

    // Prompt template for Gemini
    const systemPrompt = `Bạn là biên kịch trưởng cho các board game trinh thám suy luận đỉnh cao như:
- Sherlock Holmes Consulting Detective (The Thames Murders, Jack the Ripper, Carlton House, Queen's Park, Baker Street Irregulars)
- Detective: A Modern Crime Board Game (Portal Games)
- Chronicles of Crime
- MicroMacro: Crime City

Nhiệm vụ: Hãy tạo ra một vụ án trinh thám hoàn toàn mới, ly kỳ, chặt chẽ về mặt suy luận logic bằng TIẾNG VIỆT.
Yêu cầu cấu trúc JSON bắt buộc:
{
  "title": "Tiêu đề vụ án hấp dẫn",
  "originalLore": "Nguồn cảm hứng / Bối cảnh tác phẩm",
  "collection": "${collection}",
  "date": "Thời gian và địa điểm xảy ra",
  "difficulty": "${difficulty}",
  "category": "Án Mạng Bí Ẩn",
  "clueQuota": ${Math.max(8, Math.min(15, Number(clueQuota) || 11))},
  "holmesCluesUsed": 4,
  "synopsis": "Đoạn tóm tắt ngắn 2-3 câu giới thiệu bí ẩn",
  "initialBriefing": "Lời mở đầu chi tiết từ người giao việc / Dr. Watson / cơ quan điều tra dẫn dắt người chơi vào vụ án",
  "victim": "Tên và thân thế nạn nhân",
  "crimeScene": "Hiện trường ban đầu",
  "newspaperClipping": {
    "title": "Tiêu đề bài báo thời sự",
    "date": "Ngày tháng trên báo",
    "content": "Nội dung bài báo có chứa chi tiết manh mối gợi ý",
    "source": "The Daily Telegraph hoặc ấn bản phù hợp"
  },
  "leads": [
    {
      "id": "lead-1",
      "name": "Tên địa điểm / Nhân chứng 1",
      "category": "Hiện Trường",
      "address": "Địa chỉ cụ thể",
      "district": "Quận / Khu vực",
      "description": "Lời khai hoặc chi tiết khám xét thực địa ly kỳ",
      "clueFound": "Manh mối / vật chứng mấu chốt tìm được",
      "isCrucial": true
    },
    {
      "id": "lead-2",
      "name": "Tên địa điểm / Nhân chứng 2",
      "category": "Nghi Phạm",
      "address": "Địa chỉ cụ thể",
      "district": "Quận / Khu vực",
      "description": "Lời khai hoặc chi tiết khám xét thực địa",
      "clueFound": "Manh mối / vật chứng tìm được",
      "isCrucial": true
    },
    {
      "id: "lead-3",
      "name": "Tên địa điểm / Cơ quan 3",
      "category": "Pháp Y & Cơ Quan",
      "address": "Địa chỉ cụ thể",
      "district": "Quận / Khu vực",
      "description": "Kết quả giám định hoặc hồ sơ lưu trữ",
      "clueFound": "Bằng chứng pháp y hoặc tài liệu lưu trữ",
      "isCrucial": true
    },
    {
      "id": "lead-4",
      "name": "Tên địa điểm đô thị 4",
      "category": "Địa Điểm Đô Thị",
      "address": "Địa chỉ cụ thể",
      "district": "Quận / Khu vực",
      "description": "Manh mối tại quán rượu, bến tàu, hoặc tiệm buôn",
      "clueFound": "Chi tiết đắt giá hoặc bằng chứng ngoại phạm",
      "isCrucial": false
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "Ai là thủ phạm thực sự của vụ án?",
      "points": 50,
      "options": [
        { "id": "opt-1a", "text": "Tên thủ phạm thực sự", "isCorrect": true, "explanation": "Giải thích vì sao là kẻ này" },
        { "id": "opt-1b", "text": "Nghi phạm đánh lạc hướng", "isCorrect": false, "explanation": "Vì sao nghi phạm này vô can" }
      ]
    },
    {
      "id": "q2",
      "question": "Động cơ và thủ đoạn chính gây án là gì?",
      "points": 50,
      "options": [
        { "id": "opt-2a", "text": "Động cơ và phương thức chính xác", "isCorrect": true, "explanation": "Giải thích cặn kẽ" },
        { "id": "opt-2b", "text": "Giả thuyết sai lầm", "isCorrect": false, "explanation": "Vì sao không chính xác" }
      ]
    }
  ],
  "holmesSolution": {
    "summary": "Toàn bộ diễn biến vụ án được xâu chuỗi mạch lạc",
    "culprit": "Tên thủ phạm",
    "motive": "Động cơ gây án",
    "method": "Thủ đoạn thực hiện",
    "holmesCritique": "Lời nhận xét và bài học suy luận từ Sherlock Holmes"
  }
}
Chỉ trả về JSON thuần túy, không có markdown code blocks hoặc văn bản thừa ngoài JSON.`;

    let generatedCase: DetectiveCase | null = null;

    if (ai) {
      try {
        const userPrompt = `Hãy tạo vụ án với bối cảnh: ${theme}. Dòng game: ${collection}. Độ khó: ${difficulty}. Hạn mức: ${clueQuota} manh mối. Yêu cầu thêm từ người chơi: ${promptExtra || 'Tạo vụ án trinh thám kịch tính độc đáo'}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });

        const textOutput = response.text ? response.text.trim() : '';
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          generatedCase = {
            id: caseId,
            number: nextNumber,
            title: parsed.title || `Bí Ẩn ${theme}`,
            originalLore: parsed.originalLore || `${collection} AI Mystery`,
            collection: collection,
            date: parsed.date || 'London, 1890',
            difficulty: parsed.difficulty || difficulty,
            category: parsed.category || 'Án Mạng Bí Ẩn',
            clueQuota: Number(parsed.clueQuota) || Number(clueQuota) || 11,
            holmesCluesUsed: Number(parsed.holmesCluesUsed) || 4,
            synopsis: parsed.synopsis || 'Một vụ án bí ẩn cần giải mã.',
            initialBriefing: parsed.initialBriefing || '',
            victim: parsed.victim || 'Nạn nhân giấu tên',
            crimeScene: parsed.crimeScene || 'Luân Đôn',
            newspaperClipping: parsed.newspaperClipping || {
              title: 'Tin khẩn từ Scotland Yard',
              date: '1890',
              content: 'Vụ án bí ẩn đang được điều tra ráo riết.',
              source: 'The Daily Telegraph',
            },
            leads: Array.isArray(parsed.leads) && parsed.leads.length >= 3 ? parsed.leads : [],
            questions: Array.isArray(parsed.questions) && parsed.questions.length >= 1 ? parsed.questions : [],
            holmesSolution: parsed.holmesSolution || {
              summary: 'Sự thật đã được làm sáng tỏ.',
              culprit: 'Thủ phạm giấu mặt',
              motive: 'Lòng tham và thù hận',
              method: 'Thủ đoạn tinh vi',
              holmesCritique: 'Lời giải của Sherlock Holmes.',
            },
            isCustom: true,
            isAIGenerated: true,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to procedural AI generator:', geminiError);
      }
    }

    // Procedural fallback if AI not available or error occurred
    if (!generatedCase || !generatedCase.leads || generatedCase.leads.length < 3) {
      generatedCase = {
        id: caseId,
        number: nextNumber,
        title: `Vụ Án Bí Mật ${theme || 'Phố Baker'}`,
        originalLore: `${collection} - Bản Ghi Chép Đặc Biệt AI`,
        collection: collection,
        date: 'Luân Đôn, Thời Khắc Định Mệnh',
        difficulty: difficulty as any,
        category: 'Án Mạng Bí Ẩn',
        clueQuota: Number(clueQuota) || 11,
        holmesCluesUsed: 4,
        synopsis: `Một bí ẩn đan xen giữa những âm mưu quyền lực tại ${theme}. Nạn nhân để lại lời nhắn dở dang trước khi trút hơi thở cuối cùng.`,
        initialBriefing: `Tiếng gõ cửa gấp gáp vang lên tại số 221B Baker Street. Thân chủ hốt hoảng bước vào trao cho Holmes một chiếc hộp bọc nhung dính vệt máu khô. Một nhân vật có thế lực tại ${theme} vừa qua đời trong tình cảnh kỳ quái: phòng khóa kín, ngọn nến thơm tỏa mùi xạ hương lạ, và một bức thư bị đốt dở trong lò sưởi. Vụ án đòi hỏi sự quan sát nhạy bén của các thám tử để lật tẩy kẻ thủ ác trong hạn mức ${clueQuota} manh mối.`,
        victim: 'Nhân vật quyền quý bí ẩn',
        crimeScene: `Dinh thự trung tâm ${theme}`,
        newspaperClipping: {
          title: `Bi Kịch Bất Ngờ Tại ${theme}`,
          date: 'Bản in đặc biệt',
          content: 'Cảnh sát đô thị đang rà soát mọi đầu mối sau cái chết đột ngột của một nhân vật có tầm ảnh hưởng lớn.',
          source: 'The London Times',
        },
        leads: [
          {
            id: `ai-lead-1`,
            name: 'Hiện trường phòng làm việc khóa kín',
            category: 'Hiện Trường',
            address: 'Tầng 2 dinh thự chính',
            district: 'Trung tâm thành phố',
            description: 'Khám xét kỹ khe cửa sổ và lò sưởi, bạn tìm thấy một sợi dây thép mỏng dùng để gạt then chốt từ bên ngoài và một tàn tro giấy nợ.',
            clueFound: 'Móc dây thép mở then khóa và mẩu giấy nợ bị thiêu rụi một góc.',
            isCrucial: true,
          },
          {
            id: `ai-lead-2`,
            name: 'Phòng nghi phạm - Người thừa kế gia tộc',
            category: 'Nghi Phạm',
            address: 'Biệt thự ngoại ô',
            district: 'Ngoại ô thành phố',
            description: 'Người thừa kế tỏ ra đau buồn nhưng trong ngăn kéo bàn trang điểm có cất giữ một lọ dung dịch chiết xuất từ rễ cây độc.',
            clueFound: 'Lọ dung dịch chiết xuất độc dược và lá thư từ chối hoãn nợ.',
            isCrucial: true,
          },
          {
            id: `ai-lead-3`,
            name: 'Khoa Pháp y & Giám định độc chất',
            category: 'Pháp Y & Cơ Quan',
            address: 'Bệnh viện trung tâm',
            district: 'Khu bệnh viện',
            description: 'Pháp y xác nhận độc tố gây suy hô hấp cấp chỉ trong vài phút mà không để lại vết kim tiêm trên da.',
            clueFound: 'Chất độc được thẩm thấu qua bề mặt phong bì thư tay.',
            isCrucial: true,
          },
          {
            id: `ai-lead-4`,
            name: 'Quán trọ & Trạm bưu chính liên tỉnh',
            category: 'Địa Điểm Đô Thị',
            address: 'Đầu đường lớn',
            district: 'Khu bến tàu',
            description: 'Nhân viên bưu điện xác nhận một người phụ nữ trùm khăn voan đen đã gửi bức thư tẩm sáp vào lúc 19h00.',
            clueFound: 'Nhận diện người phụ nữ gửi bức thư tẩm độc.',
            isCrucial: false,
          },
        ],
        questions: [
          {
            id: 'ai-q1',
            question: 'Ai là kẻ chủ mưu sát hại nạn nhân?',
            points: 50,
            options: [
              { id: 'opt-a1', text: 'Người thừa kế đang ngập trong nợ nần', isCorrect: true, explanation: 'Chính xác! Động cơ là chiếm đoạt di chúc và xóa bỏ khoản nợ khổng lồ.' },
              { id: 'opt-a2', text: 'Người quản gia', isCorrect: false, explanation: 'Sai. Người quản gia có chứng cứ ngoại phạm chắc chắn.' },
            ],
          },
          {
            id: 'ai-q2',
            question: 'Thủ đoạn hung thủ đưa chất độc vào phòng kín là gì?',
            points: 50,
            options: [
              { id: 'opt-a3', text: 'Tẩm độc tố thẩm thấu qua lớp keo dán phong bì thư mật gửi cho nạn nhân', isCorrect: true, explanation: 'Chính xác! Nạn nhân liếm phong bì hoặc mở bằng tay dẫn đến ngấm độc.' },
              { id: 'opt-a4', text: 'Thả qua ống khói lò sưởi', isCorrect: false, explanation: 'Sai.' },
            ],
          },
        ],
        holmesSolution: {
          summary: `Thủ phạm vì muốn độc chiếm quyền thừa kế và xóa món nợ cờ bạc đã tẩm chất độc vào phong bì thư mật. Khi nạn nhân mở thư, chất độc ngấm qua da gây tử vong. Sau đó hắn dùng móc thép gạt chốt cửa sổ để tạo hiện trường phòng kín giả.`,
          culprit: 'Người thừa kế gia tộc',
          motive: 'Chiếm đoạt gia sản thừa kế và xóa sạch khoản nợ khổng lồ.',
          method: 'Tẩm độc dược thẩm thấu vào phong bì thư mật và tạo hiện trường phòng kín bằng móc thép.',
          holmesCritique: 'Kẻ sát nhân tưởng rằng căn phòng khóa kín sẽ che giấu được tội ác, nhưng vật chứng trên phong bì thư đã lột trần mọi mưu mô.',
        },
        isCustom: true,
        isAIGenerated: true,
        createdAt: new Date().toISOString(),
      };
    }

    casesDatabase.push(generatedCase);
    saveCustomCases();

    res.status(201).json({
      success: true,
      message: 'Hồ sơ vụ án mới đã được AI tạo thành công!',
      case: generatedCase,
    });
  });

  // 3. Add new case (extensible backend case updates)
  app.post('/api/cases', (req, res) => {
    const newCaseData = req.body as Partial<DetectiveCase>;
    const validation = validateCaseData(newCaseData);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    const nextNumber = casesDatabase.length + 1;
    const newCase: DetectiveCase = {
      id: newCaseData.id || `case-${Date.now()}`,
      number: nextNumber,
      title: newCaseData.title || 'Hồ sơ vụ án mới',
      originalLore: newCaseData.originalLore || 'Vụ án bí mật London',
      date: newCaseData.date || 'London, 1890',
      difficulty: newCaseData.difficulty || 'Trung Bình',
      category: newCaseData.category || 'Án Mạng Bí Ẩn',
      clueQuota: Number(newCaseData.clueQuota) || 10,
      holmesCluesUsed: Number(newCaseData.holmesCluesUsed) || 5,
      synopsis: newCaseData.synopsis || '',
      initialBriefing: newCaseData.initialBriefing || '',
      victim: newCaseData.victim || 'Nạn nhân chưa xác định',
      crimeScene: newCaseData.crimeScene || 'London',
      newspaperClipping: newCaseData.newspaperClipping || {
        title: 'Bản tin vụ án kỳ bí',
        date: '1890',
        content: 'Một vụ án đang làm xôn xao dư luận Luân Đôn...',
        source: 'The Daily Telegraph',
      },
      leads: newCaseData.leads || [],
      questions: newCaseData.questions || [],
      holmesSolution: newCaseData.holmesSolution || {
        summary: 'Chân tướng đang được điều tra.',
        culprit: 'Thủ phạm',
        motive: 'Động cơ',
        method: 'Thủ đoạn',
        holmesCritique: 'Lời phê của Sherlock Holmes.',
      },
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    casesDatabase.push(newCase);
    saveCustomCases();

    res.status(201).json({
      success: true,
      message: 'Hồ sơ vụ án mới đã được lưu thành công vào cơ sở dữ liệu!',
      case: newCase,
    });
  });

  // 4. Update case
  app.put('/api/cases/:id', (req, res) => {
    const idx = casesDatabase.findIndex((item) => item.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ để cập nhật.' });
    }
    casesDatabase[idx] = { ...casesDatabase[idx], ...req.body, id: req.params.id };
    casesDatabase = sortCasesByDifficulty(casesDatabase);
    saveCustomCases();
    res.json({ success: true, case: casesDatabase[idx] });
  });

  // 4b. Delete case
  app.delete('/api/cases/:id', (req, res) => {
    const idx = casesDatabase.findIndex((item) => item.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ để xóa.' });
    }
    const deleted = casesDatabase.splice(idx, 1)[0];
    saveCustomCases();
    res.json({ success: true, message: `Đã xóa hồ sơ "${deleted.title}".` });
  });

  // 5. Verify answers & score computation
  app.post('/api/cases/:id/verify', (req, res) => {
    const c = casesDatabase.find((item) => item.id === req.params.id);
    if (!c) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ vụ án.' });
    }
    const { answers, visitedLeadIds } = req.body as {
      answers: Record<string, string>;
      visitedLeadIds: string[];
    };
    const scoreResult = calculateScore(answers || {}, c, visitedLeadIds || []);
    res.json({
      success: true,
      result: scoreResult,
      holmesSolution: c.holmesSolution,
    });
  });

  // 6. Reset cases to defaults
  app.post('/api/cases/reset-defaults', (req, res) => {
    casesDatabase = sortCasesByDifficulty([...INITIAL_CASES]);
    try {
      if (fs.existsSync(CASES_FILE)) {
        fs.unlinkSync(CASES_FILE);
      }
    } catch (e) {
      console.warn('Failed to delete custom cases file:', e);
    }
    res.json({ success: true, message: 'Đã khôi phục toàn bộ danh mục vụ án gốc ban đầu.' });
  });

  // -------------------------------------------------------------
  // ADMIN AUTH & ACCESS CONTROL
  // -------------------------------------------------------------
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check against usersDatabase or default admin credentials
    const found = usersDatabase.find(
      (u) => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    // Demonstration password rule: 'admin123', 'bakerstreet1888', or matches role/username
    const isValidPass =
      cleanPass === 'bakerstreet1888' ||
      cleanPass === 'admin123' ||
      cleanPass === '123456' ||
      (found && (cleanPass === found.username || cleanPass === `${found.username}1888`));

    if (!isValidPass || (found && found.status === 'suspended')) {
      return res.status(401).json({
        success: false,
        message: found?.status === 'suspended'
          ? 'Tài khoản điều tra viên này đang bị tạm đình chỉ công tác.'
          : 'Mật mã hoặc tài danh không hợp lệ. Vui lòng thử lại.',
      });
    }

    const sessionUser = found || {
      id: 'user-admin-default',
      username: cleanUser || 'admin',
      fullName: 'Quản Trị Viên Scotland Yard',
      email: `${cleanUser || 'admin'}@scotlandyard.police.uk`,
      role: 'admin' as UserRole,
      roleTitle: 'Quản Trị Viên Hệ Thống',
      status: 'active' as const,
      permissions: ['play_cases', 'create_manual_cases', 'generate_ai_cases', 'edit_delete_cases', 'manage_users', 'manage_tokens'],
      tokenBalance: 1000,
      tokens: [],
      casesSolved: 12,
      totalScore: 1200,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    sessionUser.lastLoginAt = new Date().toISOString();
    saveUsers();

    res.json({
      success: true,
      message: 'Đăng nhập vào Khu Vực Quản Trị thành công!',
      user: sessionUser,
      sessionToken: `adm-sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    });
  });

  // -------------------------------------------------------------
  // USER & TOKEN MANAGEMENT
  // -------------------------------------------------------------
  // Get all users
  app.get('/api/admin/users', (req, res) => {
    res.json({
      success: true,
      total: usersDatabase.length,
      users: usersDatabase,
    });
  });

  // Add new user
  app.post('/api/admin/users', (req, res) => {
    const { username, fullName, email, role = 'detective', permissions = [] } = req.body;
    if (!username || !fullName || !email) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ tên, tài danh và email.' });
    }

    const roleTitles: Record<string, string> = {
      superadmin: 'Chánh Án Scotland Yard',
      admin: 'Quản Trị Viên Hồ Sơ',
      investigator: 'Điều Tra Viên Cao Cấp',
      detective: 'Thám Tử Phố Baker',
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      email: email.trim(),
      role: role as UserRole,
      roleTitle: roleTitles[role] || 'Thám Tử',
      status: 'active',
      permissions: permissions.length > 0 ? permissions : ['play_cases'],
      tokenBalance: role === 'superadmin' ? 5000 : role === 'admin' ? 1000 : 200,
      tokens: [
        {
          id: `tok-${Date.now()}`,
          userId: `user-${Date.now()}`,
          tokenKey: `sy-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().slice(-4)}`,
          name: 'Token Khởi Tạo Điều Tra',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          usageCount: 0,
          quotaLimit: 500,
        },
      ],
      casesSolved: 0,
      totalScore: 0,
      createdAt: new Date().toISOString(),
    };

    usersDatabase.push(newUser);
    saveUsers();

    res.status(201).json({
      success: true,
      message: `Đã thêm thành viên mới "${newUser.fullName}" thành công!`,
      user: newUser,
    });
  });

  // Update user
  app.put('/api/admin/users/:id', (req, res) => {
    const idx = usersDatabase.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { role, roleTitle, status, permissions, tokenBalance, fullName, email } = req.body;
    usersDatabase[idx] = {
      ...usersDatabase[idx],
      ...(fullName ? { fullName } : {}),
      ...(email ? { email } : {}),
      ...(role ? { role } : {}),
      ...(roleTitle ? { roleTitle } : {}),
      ...(status ? { status } : {}),
      ...(permissions ? { permissions } : {}),
      ...(typeof tokenBalance === 'number' ? { tokenBalance } : {}),
    };

    saveUsers();
    res.json({ success: true, user: usersDatabase[idx] });
  });

  // Delete user
  app.delete('/api/admin/users/:id', (req, res) => {
    const idx = usersDatabase.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để xóa.' });
    }
    const deleted = usersDatabase.splice(idx, 1)[0];
    saveUsers();
    res.json({ success: true, message: `Đã xóa người dùng "${deleted.fullName}".` });
  });

  // Create/Issue token for user
  app.post('/api/admin/users/:id/tokens', (req, res) => {
    const u = usersDatabase.find((user) => user.id === req.params.id);
    if (!u) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng để cấp token.' });
    }

    const { name = 'Token Điều Tra', quotaLimit = 250, expiresDays = 60 } = req.body;
    const newToken: UserToken = {
      id: `tok-${Date.now()}`,
      userId: u.id,
      tokenKey: `sy-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString().slice(-4)}`,
      name,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + Number(expiresDays) * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      usageCount: 0,
      quotaLimit: Number(quotaLimit) || 250,
    };

    u.tokens.push(newToken);
    saveUsers();

    res.status(201).json({
      success: true,
      message: `Đã phát hành token "${newToken.name}" cho ${u.fullName}!`,
      token: newToken,
    });
  });

  // Revoke token
  app.delete('/api/admin/users/:id/tokens/:tokenId', (req, res) => {
    const u = usersDatabase.find((user) => user.id === req.params.id);
    if (!u) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const tokIdx = u.tokens.findIndex((t) => t.id === req.params.tokenId);
    if (tokIdx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy token.' });
    }

    u.tokens[tokIdx].status = 'revoked';
    saveUsers();

    res.json({
      success: true,
      message: 'Đã thu hồi token thành công.',
      token: u.tokens[tokIdx],
    });
  });

  // Top-up token balance
  app.post('/api/admin/users/:id/adjust-tokens', (req, res) => {
    const u = usersDatabase.find((user) => user.id === req.params.id);
    if (!u) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    const { amount = 50 } = req.body;
    u.tokenBalance = Math.max(0, u.tokenBalance + Number(amount));
    saveUsers();

    res.json({
      success: true,
      message: `Đã cập nhật hạn mức token của ${u.fullName}: ${u.tokenBalance} tokens.`,
      tokenBalance: u.tokenBalance,
    });
  });

  // -------------------------------------------------------------
  // LEADERBOARD ENDPOINT
  // -------------------------------------------------------------
  app.get('/api/leaderboard', (req, res) => {
    // Generate rank titles based on scores
    const leaderboard: LeaderboardUser[] = [...usersDatabase]
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((u, index) => {
        const avgScore = u.casesSolved > 0 ? Math.round(u.totalScore / u.casesSolved) : 0;
        let rankTitle = 'Thám Tử Tập Sự';
        let rankBadge = '📜 Sơ Cấp';
        if (index === 0) {
          rankTitle = 'Thám Tử Bậc Thầy (Đẳng Cấp Sherlock Holmes)';
          rankBadge = '👑 Huân Chương Phố Baker';
        } else if (index === 1) {
          rankTitle = 'Cố Vấn Xuất Sắc';
          rankBadge = '🎖️ Huy Hiệu Diogenes';
        } else if (index === 2) {
          rankTitle = 'Thanh Tra Scotland Yard';
          rankBadge = '⭐ Trưởng Đồn Cảnh Sát';
        } else if (u.totalScore >= 1200) {
          rankTitle = 'Cố Vấn Xuất Sắc';
          rankBadge = '🎖️ Huy Hiệu Diogenes';
        } else if (u.totalScore >= 800) {
          rankTitle = 'Điều Tra Viên Lão Thành';
          rankBadge = '🔍 Thám Tử Scotland Yard';
        }

        return {
          id: u.id,
          rankPosition: index + 1,
          username: u.username,
          fullName: u.fullName,
          roleTitle: u.roleTitle,
          casesSolved: u.casesSolved,
          totalScore: u.totalScore,
          averageScore: avgScore,
          clueEfficiency: Math.min(95, 65 + Math.round((u.totalScore % 30))),
          rankBadge,
          rankTitle,
          lastActive: u.lastLoginAt || u.createdAt,
        };
      });

    res.json({
      success: true,
      total: leaderboard.length,
      leaderboard,
    });
  });


  // Frontend integration: Vite middleware in dev, static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Detective Game server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
