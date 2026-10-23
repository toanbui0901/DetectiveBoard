/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_CASES } from './data/initialCases.ts';
import {
  DetectiveCase,
  PlayerInvestigationState,
  ScoreResult,
} from './types/detective.ts';
import { calculateScore, visitLeadAction, sortCasesByDifficulty } from './game/detectiveRules.ts';
import { soundEngine } from './utils/audio.ts';
import { TopBar } from './components/TopBar.tsx';
import { CaseLibrary } from './components/CaseLibrary.tsx';
import { CaseBriefingTab } from './components/CaseBriefingTab.tsx';
import { NewspaperTab } from './components/NewspaperTab.tsx';
import { DirectoryTab } from './components/DirectoryTab.tsx';
import { NotebookTab } from './components/NotebookTab.tsx';
import { DeductionTab } from './components/DeductionTab.tsx';
import { VerdictModal } from './components/VerdictModal.tsx';
import { CreateCaseModal } from './components/CreateCaseModal.tsx';
import { AIGenerateModal } from './components/AIGenerateModal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { RewardStoryModal } from './components/RewardStoryModal.tsx';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'sherlock_investigations_v1';
const STORAGE_KEY_CASES = 'sherlock_custom_cases_v2';

export default function App() {
  const [cases, setCases] = useState<DetectiveCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CASES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sortCasesByDifficulty(parsed);
      } catch {
        // ignore
      }
    }
    return sortCasesByDifficulty(INITIAL_CASES);
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'briefing' | 'newspaper' | 'directory' | 'notebook' | 'deduction'>('briefing');
  const [investigations, setInvestigations] = useState<Record<string, PlayerInvestigationState>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showRewardStoryModal, setShowRewardStoryModal] = useState(false);
  const [activeVerdictResult, setActiveVerdictResult] = useState<ScoreResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Load saved investigations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setInvestigations(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved investigations:', e);
    }
  }, []);

  // Save investigations to localStorage
  const saveInvestigations = (newInv: Record<string, PlayerInvestigationState>) => {
    setInvestigations(newInv);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newInv));
    } catch (e) {
      console.warn('Failed to persist investigation state:', e);
    }
  };

  // Fetch updated cases from backend API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.cases) && data.cases.length > 0) {
            setCases(sortCasesByDifficulty(data.cases));
          }
        }
      } catch {
        // Fallback gracefully to bundled initial cases
      }
    };
    fetchCases();
  }, []);

  // Save cases to localStorage whenever cases change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
    } catch (e) {
      console.warn('Failed to persist cases state:', e);
    }
  }, [cases]);

  // Handle URL query parameters for testability (?autostart=1 or ?case=<id> or ?admin=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setShowAdminPortal(true);
    } else if (params.get('autostart') === '1') {
      setSelectedCaseId(INITIAL_CASES[0].id);
      setActiveTab('briefing');
    } else if (params.get('case')) {
      const cId = params.get('case');
      if (cases.some((c) => c.id === cId)) {
        setSelectedCaseId(cId);
        setActiveTab('briefing');
      }
    }
  }, [cases]);

  // Current case object
  const currentCase = cases.find((c) => c.id === selectedCaseId) || null;

  // Ensure investigation state exists for current case
  const currentInvestigation: PlayerInvestigationState = currentCase
    ? investigations[currentCase.id] || {
        caseId: currentCase.id,
        visitedLeadIds: [],
        notes: '',
        answers: {},
        isSubmitted: false,
      }
    : {
        caseId: '',
        visitedLeadIds: [],
        notes: '',
        answers: {},
        isSubmitted: false,
      };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('briefing');
  };

  const handleBackToLibrary = () => {
    soundEngine.playPageFlip();
    setSelectedCaseId(null);
  };

  const handleVisitLead = (leadId: string) => {
    if (!currentCase) return;
    const updatedState = visitLeadAction(currentInvestigation, leadId);
    const updatedAll = {
      ...investigations,
      [currentCase.id]: updatedState,
    };
    saveInvestigations(updatedAll);
  };

  const handleNotesChange = (notes: string) => {
    if (!currentCase) return;
    const updatedState: PlayerInvestigationState = {
      ...currentInvestigation,
      notes,
    };
    const updatedAll = {
      ...investigations,
      [currentCase.id]: updatedState,
    };
    saveInvestigations(updatedAll);
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    if (!currentCase) return;
    const updatedState: PlayerInvestigationState = {
      ...currentInvestigation,
      answers: {
        ...currentInvestigation.answers,
        [questionId]: optionId,
      },
    };
    const updatedAll = {
      ...investigations,
      [currentCase.id]: updatedState,
    };
    saveInvestigations(updatedAll);
  };

  const handleSubmitAccusation = async () => {
    if (!currentCase) return;
    soundEngine.playPageFlip();

    let result: ScoreResult;
    try {
      const res = await fetch(`/api/cases/${currentCase.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: currentInvestigation.answers,
          visitedLeadIds: currentInvestigation.visitedLeadIds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        result = data.result;
      } else {
        result = calculateScore(
          currentInvestigation.answers,
          currentCase,
          currentInvestigation.visitedLeadIds
        );
      }
    } catch {
      result = calculateScore(
        currentInvestigation.answers,
        currentCase,
        currentInvestigation.visitedLeadIds
      );
    }

    if (result.totalScore >= 70) {
      soundEngine.playVictory();
    } else {
      soundEngine.playPageFlip();
    }

    const updatedState: PlayerInvestigationState = {
      ...currentInvestigation,
      isSubmitted: true,
      score: result.totalScore,
      rank: result.rankTitle,
      rankBadge: result.rankBadge,
      feedback: result.commentary,
      solvedAt: new Date().toISOString(),
    };

    const updatedAll = {
      ...investigations,
      [currentCase.id]: updatedState,
    };
    saveInvestigations(updatedAll);

    setActiveVerdictResult(result);
    setShowVerdictModal(true);
  };

  const handleOpenVerdictReview = () => {
    if (!currentCase) return;
    const result = calculateScore(
      currentInvestigation.answers,
      currentCase,
      currentInvestigation.visitedLeadIds
    );
    setActiveVerdictResult(result);
    setShowVerdictModal(true);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleResetDefaults = async () => {
    try {
      await fetch('/api/cases/reset-defaults', { method: 'POST' });
    } catch {}
    setCases(sortCasesByDifficulty(INITIAL_CASES));
    saveInvestigations({});
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
    } catch {}
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  const handleCaseCreated = (newCase: DetectiveCase) => {
    setCases((prev) => sortCasesByDifficulty([...prev, newCase]));
    setSelectedCaseId(newCase.id);
    setActiveTab('briefing');
    setShowAdminPortal(false);
  };

  // If Admin Portal view is requested
  if (showAdminPortal) {
    return (
      <div className="min-h-screen bg-[#14110f] text-[#ded4c3] flex flex-col">
        <AdminPortal
          cases={cases}
          onSelectCase={handleSelectCase}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenAIModal={() => setShowAIModal(true)}
          onResetDefaults={handleResetDefaults}
          onDeleteCase={handleDeleteCase}
          onCloseAdmin={() => setShowAdminPortal(false)}
        />

        {/* Create New Case Modal inside Admin */}
        {showCreateModal && (
          <CreateCaseModal
            onClose={() => setShowCreateModal(false)}
            onCaseCreated={handleCaseCreated}
          />
        )}

        {/* AI Generate Case Modal inside Admin */}
        {showAIModal && (
          <AIGenerateModal
            onClose={() => setShowAIModal(false)}
            onCaseGenerated={handleCaseCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151210] text-[#ded6c5] flex flex-col selection:bg-[#8b2b2b] selection:text-white">
      {/* Top Bar Navigation */}
      <TopBar
        activeView={selectedCaseId ? 'investigation' : 'cases_library'}
        activeTab={activeTab}
        setActiveTab={(t) => {
          soundEngine.playPageFlip();
          setActiveTab(t);
        }}
        onOpenLibrary={handleBackToLibrary}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenAdmin={() => setShowAdminPortal(true)}
        onOpenRewardStory={() => setShowRewardStoryModal(true)}
        isCaseSolved={currentInvestigation.isSubmitted}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        caseTitle={currentCase?.title}
        caseNumber={currentCase?.number}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {!selectedCaseId ? (
          /* Case Selection & Library Screen */
          <CaseLibrary
            cases={cases}
            investigations={investigations}
            onSelectCase={handleSelectCase}
            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            onOpenAdmin={() => setShowAdminPortal(true)}
          />
        ) : currentCase ? (
          /* Active Case Investigation Room */
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
            {/* If solved, prominent banner offering the reward story */}
            {currentInvestigation.isSubmitted && (
              <div className="p-4 bg-[#261715] border border-[#6b2c28] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-8 h-8 rounded bg-[#451916] text-[#e8b931] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-sans-ui text-[#e0a96d] uppercase tracking-wide font-bold">
                      Vụ Án Đã Phá Thành Công · Điểm: {currentInvestigation.score}/100
                    </div>
                    <div className="text-sm font-cinzel font-bold text-[#f5ebd7]">
                      Phần thưởng: Bài báo độc quyền & Hồi ký của Bác sĩ Watson đã mở khóa!
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playVictory();
                    setShowRewardStoryModal(true);
                  }}
                  className="px-4 py-2 bg-[#8b2b2b] hover:bg-[#a63434] text-[#fcf9f2] text-xs font-sans-ui font-semibold rounded transition-colors cursor-pointer shadow shrink-0"
                >
                  Đọc Bài Báo & Câu Chuyện
                </button>
              </div>
            )}

            {/* Subnav Tabs for mobile/desktop */}
            <div className="flex lg:hidden overflow-x-auto gap-2 border-b border-[#352c23] pb-2 text-xs font-sans-ui">
              <button
                onClick={() => setActiveTab('briefing')}
                className={`px-3 py-1.5 rounded transition-colors shrink-0 ${
                  activeTab === 'briefing' ? 'bg-[#c59b27] text-[#14110e] font-semibold' : 'text-[#a89988]'
                }`}
              >
                Hồ Sơ
              </button>
              <button
                onClick={() => setActiveTab('newspaper')}
                className={`px-3 py-1.5 rounded transition-colors shrink-0 ${
                  activeTab === 'newspaper' ? 'bg-[#c59b27] text-[#14110e] font-semibold' : 'text-[#a89988]'
                }`}
              >
                Báo The Times
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded transition-colors shrink-0 ${
                  activeTab === 'directory' ? 'bg-[#c59b27] text-[#14110e] font-semibold' : 'text-[#a89988]'
                }`}
              >
                Danh Bạ ({currentInvestigation.visitedLeadIds.length}/{currentCase.clueQuota})
              </button>
              <button
                onClick={() => setActiveTab('notebook')}
                className={`px-3 py-1.5 rounded transition-colors shrink-0 ${
                  activeTab === 'notebook' ? 'bg-[#c59b27] text-[#14110e] font-semibold' : 'text-[#a89988]'
                }`}
              >
                Sổ Tay
              </button>
              <button
                onClick={() => setActiveTab('deduction')}
                className={`px-3 py-1.5 rounded transition-colors shrink-0 ${
                  activeTab === 'deduction' ? 'bg-[#c59b27] text-[#14110e] font-semibold' : 'text-[#a89988]'
                }`}
              >
                Phán Quyết
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'briefing' && (
              <CaseBriefingTab
                currentCase={currentCase}
                investigation={currentInvestigation}
                onGoToDirectory={() => {
                  soundEngine.playPageFlip();
                  setActiveTab('directory');
                }}
              />
            )}


            {activeTab === 'newspaper' && (
              <NewspaperTab
                clipping={currentCase.newspaperClipping}
                caseTitle={currentCase.title}
              />
            )}

            {activeTab === 'directory' && (
              <DirectoryTab
                currentCase={currentCase}
                investigation={currentInvestigation}
                onVisitLead={handleVisitLead}
              />
            )}

            {activeTab === 'notebook' && (
              <NotebookTab
                currentCase={currentCase}
                investigation={currentInvestigation}
                onNotesChange={handleNotesChange}
                onGoToDeduction={() => {
                  soundEngine.playPageFlip();
                  setActiveTab('deduction');
                }}
              />
            )}

            {activeTab === 'deduction' && (
              <DeductionTab
                currentCase={currentCase}
                investigation={currentInvestigation}
                onSelectAnswer={handleSelectAnswer}
                onSubmitAccusation={handleSubmitAccusation}
                onViewVerdict={handleOpenVerdictReview}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#29221b] py-6 px-4 text-center text-xs font-sans-ui text-[#796b5c] bg-[#14110e]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>THÁM TỬ PHỐ BAKER · Sherlock Holmes Consulting Detective Board Game Edition</span>
          <div className="flex items-center gap-3 text-[#a39483]">
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="hover:text-[#ded4c3] cursor-pointer"
            >
              Bảng Xếp Hạng
            </button>
            <span>·</span>
            <button
              onClick={() => setShowAdminPortal(true)}
              className="hover:text-[#ded4c3] cursor-pointer"
            >
              Cổng Quản Trị Backend
            </button>
          </div>
        </div>
      </footer>

      {/* Verdict & Holmes Solution Modal */}
      {showVerdictModal && activeVerdictResult && currentCase && (
        <VerdictModal
          currentCase={currentCase}
          result={activeVerdictResult}
          onClose={() => setShowVerdictModal(false)}
          onOpenLibrary={() => {
            setShowVerdictModal(false);
            setSelectedCaseId(null);
          }}
          onOpenRewardStory={() => {
            setShowVerdictModal(false);
            setShowRewardStoryModal(true);
          }}
        />
      )}

      {/* Reward Story & Newspaper Modal */}
      {showRewardStoryModal && currentCase && (
        <RewardStoryModal
          currentCase={currentCase}
          isOpen={showRewardStoryModal}
          onClose={() => setShowRewardStoryModal(false)}
        />
      )}

      {/* Global Leaderboard Modal for Players */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
      />

      {/* Create New Case Modal */}
      {showCreateModal && (
        <CreateCaseModal
          onClose={() => setShowCreateModal(false)}
          onCaseCreated={handleCaseCreated}
        />
      )}

      {/* AI Generate Case Modal */}
      {showAIModal && (
        <AIGenerateModal
          onClose={() => setShowAIModal(false)}
          onCaseGenerated={handleCaseCreated}
        />
      )}
    </div>
  );
}
