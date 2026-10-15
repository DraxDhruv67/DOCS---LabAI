'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';
import TimetableMonthView from '@/components/TimetableMonthView';
import {
  Code2,
  Clock,
  Play,
  CheckCircle2,
  FileText,
  Trophy,
  Sparkles,
  Send,
  Calendar,
  Upload,
  History,
  Lock,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight,
  Terminal,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Check,
  Copy,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ShieldAlert,
} from 'lucide-react';

export default function StudentDashboard() { 

    
  const studentTabs = [
    { id: 'sessions', label: 'Practical Lab Sessions', icon: Clock },
    { id: 'experiments', label: 'Course Experiments', icon: FileText },
    { id: 'timetable', label: 'Timetable Schedule', icon: Calendar },
    { id: 'assignments', label: 'Course Assignments', icon: Upload },
    { id: 'ai', label: 'Academic AI Assistant', icon: Sparkles },
  ];

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'experiments' | 'timetable' | 'assignments' | 'ai'>(
    'sessions'
  );

  // Data states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [experiments, setExperiments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);

  // Selected experiment & workspace view
  const [activeSessionInfo, setActiveSessionInfo] = useState<any>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [passedQuestions, setPassedQuestions] = useState<Set<string>>(new Set());
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [copiedInput, setCopiedInput] = useState<boolean>(false);

  const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
    python: 'def solve():\n    # Read input and implement your solution\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        print(lines[0])\n\nif __name__ == "__main__":\n    solve()',
    cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        cout << line << endl;\n    }\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    char buffer[1024];\n    if (fgets(buffer, sizeof(buffer), stdin)) {\n        printf("%s", buffer);\n    }\n    return 0;\n}',
    java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(sc.nextLine());\n        }\n    }\n}',
  };

  // Coding workspace state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(
    DEFAULT_CODE_TEMPLATES['python']
  );

  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<any>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);

  // Anti-Cheat & Full Screen Workspace States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [strictAntiCheat, setStrictAntiCheat] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && selectedExperiment) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabSwitchWarning(true);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [selectedExperiment]);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullScreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle:', err);
    }
  };

  const handlePasteInEditor = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (strictAntiCheat) {
      e.preventDefault();
      setPasteAttempts((prev) => prev + 1);
      setShowPasteWarning(true);
    }
  };

  // Assignment submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [textSolution, setTextSolution] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');

  // AI Chat state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your DOCS AI academic assistant. You can ask for algorithm clarifications, debugging hints, or syntax questions.' },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user) loadStudentData(data.user);
      });
  }, []);

  const loadStudentData = (currentUser: any) => {
    fetch('/api/student/subjects')
      .then((res) => res.json())
      .then((d) => {
        const subs = d.subjects || [];
        setSubjects(subs);
        if (subs.length > 0) {
          setSelectedSubjectId(subs[0].id);
          fetchSubjectExperiments(subs[0].id);
        }
      });

    fetch('/api/faculty/sessions')
      .then((res) => res.json())
      .then((d) => setSessions(d.sessions || []));

    fetch('/api/faculty/assignments')
      .then((res) => res.json())
      .then((d) => setAssignments(d.assignments || []));

    if (currentUser.batchId) {
      fetch(`/api/admin/timetable?batchId=${currentUser.batchId}`)
        .then((res) => res.json())
        .then((d) => setTimetableSlots(d.timetableSlots || []));
    }
  };

  const fetchSubjectExperiments = (subjectId: string) => {
    fetch(`/api/faculty/experiments?subjectId=${subjectId}`)
      .then((res) => res.json())
      .then((d) => setExperiments(d.experiments || []));
  };

  const handleOpenExperimentWorkspace = (exp: any, sessionObj: any = null) => {
    setSelectedExperiment(exp);
    setActiveSessionInfo(sessionObj);
    setExecResult(null);
    setSelectedTestCaseIdx(0);

    // Difficulty ordering: EASY (1) -> MEDIUM (2) -> HARD (3)
    const difficultyOrder: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
    const qList = [...(exp.questions || [])].sort((a: any, b: any) => {
      const diffA = difficultyOrder[a.difficulty?.toUpperCase()] || 2;
      const diffB = difficultyOrder[b.difficulty?.toUpperCase()] || 2;
      return diffA - diffB;
    });
    setQuestions(qList);

    const currentSessId = sessionObj?.id || sessions[0]?.id;
    const url = currentSessId ? `/api/student/attempts?sessionId=${currentSessId}` : '/api/student/attempts';
    fetch(url)
      .then((res) => res.json())
      .then((d) => {
        const passedIds = new Set<string>();
        (d.attempts || []).forEach((a: any) => {
          if (a.status === 'PASSED') {
            passedIds.add(a.questionId);
          }
        });
        setPassedQuestions(passedIds);

        if (qList.length > 0) {
          const firstUnsolved = qList.find((q: any) => !passedIds.has(q.id)) || qList[0];
          setActiveQuestion(firstUnsolved);
          if (currentSessId) {
            fetchAttempts(currentSessId, firstUnsolved.id);
          }
        }
      })
      .catch(() => {
        if (qList.length > 0) setActiveQuestion(qList[0]);
      });
  };

  const handleEnterLabSession = async (session: any) => {
    await fetch('/api/student/sessions/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    });

    if (session.experiment) {
      handleOpenExperimentWorkspace(session.experiment, session);
    } else {
      // Fallback fetch experiment details
      const res = await fetch(`/api/faculty/experiments?subjectId=${session.subjectId}`);
      const data = await res.json();
      if (data.experiments && data.experiments.length > 0) {
        handleOpenExperimentWorkspace(data.experiments[0], session);
      }
    }
  };

  const handleRunCode = async () => {
    if (!activeQuestion) return;
    const sessId = activeSessionInfo?.id || sessions[0]?.id || 'practice_session';
    setExecuting(true);

    try {
      const res = await fetch('/api/student/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessId,
          questionId: activeQuestion.id,
          code,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to execute code');
        return;
      }

      setExecResult(data.executionResult);
      setShowResultPopup(true);
      fetchAttempts(sessId, activeQuestion.id);

      if (data.executionResult?.status === 'PASSED') {
        setPassedQuestions((prev) => new Set([...Array.from(prev), activeQuestion.id]));
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleProceedToNextLevel = (nextQ: any) => {
    setActiveQuestion(nextQ);
    setExecResult(null);
    setSelectedTestCaseIdx(0);
    if (DEFAULT_CODE_TEMPLATES[selectedLanguage]) {
      setCode(DEFAULT_CODE_TEMPLATES[selectedLanguage]);
    }
    const currentSessId = activeSessionInfo?.id || sessions[0]?.id;
    if (currentSessId) fetchAttempts(currentSessId, nextQ.id);
  };

  const handleResetCode = () => {
    if (DEFAULT_CODE_TEMPLATES[selectedLanguage]) {
      setCode(DEFAULT_CODE_TEMPLATES[selectedLanguage]);
    }
  };

  const fetchAttempts = (sessionId: string, questionId: string) => {
    fetch(`/api/student/attempts?sessionId=${sessionId}&questionId=${questionId}`)
      .then((res) => res.json())
      .then((d) => setAttempts(d.attempts || []));
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmittingAssignment(true);
    setAssignmentMessage('');

    let uploadedFileUrl = '';
    let uploadedFileName = '';
    let uploadedFileSize = 0;

    try {
      if (submissionFile) {
        const formData = new FormData();
        formData.append('file', submissionFile);
        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload file');
        }
        uploadedFileUrl = uploadData.fileUrl;
        uploadedFileName = uploadData.fileName;
        uploadedFileSize = uploadData.fileSize;
      }

      const res = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          fileUrl: uploadedFileUrl || null,
          fileName: uploadedFileName || null,
          fileSize: uploadedFileSize || 0,
          textSolution: textSolution || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setAssignmentMessage('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setSubmissionFile(null);
      setTextSolution('');
      if (user) loadStudentData(user);
    } catch (err: any) {
      setAssignmentMessage(err.message || 'Failed to submit assignment');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleSendAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt.trim();
    setAiMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          contextCode: code,
          subjectName: subjects.find((s) => s.id === selectedSubjectId)?.name,
        }),
      });
      const data = await res.json();
      setAiMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Unable to contact AI service at the moment.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) {

  return (
      <div className="min-h-screen bg-gray-50 text-gray-500 flex flex-col items-center justify-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Student Portal...</span>
        </div>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');
  const scheduledSessions = sessions.filter((s) => s.status === 'SCHEDULED');

  return (
    <SidebarLayout 
      user={user} 
      tabs={studentTabs}
      activeTab={activeTab}
      onTabChange={(id) => {
        setSelectedExperiment(null);
        setActiveTab(id as any);
      }}
    >
      <div className="space-y-8">
        {/* Professional Academic Student Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" /> Student Academic Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {user.name}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Roll No: <span className="text-gray-800 font-mono font-semibold">{user.rollNo || '21DS05'}</span> | Batch: <span className="text-gray-800 font-semibold">{user.batch?.name || 'Batch 1'}</span> ({user.batch?.division?.name || 'Division D'}) | Department: <span className="text-gray-800 font-semibold">CSE (Data Science)</span>
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                <span className="text-gray-500">Active Labs: </span>
                <strong className="text-emerald-400">{activeSessions.length} Live</strong>
              </div>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                <span className="text-gray-500">Scheduled: </span>
                <strong className="text-blue-400">{scheduledSessions.length} Upcoming</strong>
              </div>
            </div>
          </div>
          </div>
          {/* TAB 1: PRACTICAL LAB SESSIONS (DEFAULT) */}
        {activeTab === 'sessions' && !selectedExperiment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-700" /> Allocated Practical Lab Sessions
                </h2>
                <p className="text-xs text-gray-500">View live active labs and upcoming scheduled sessions for your batch.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Experiment</th>
                    <th className="py-3.5 px-4">Faculty in Charge</th>
                    <th className="py-3.5 px-4">Date & Time Range</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                        No practical lab sessions scheduled yet for your batch.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-gray-100/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{sess.subject?.name}</td>
                        <td className="py-3.5 px-4 text-gray-800">{sess.experiment?.title || 'Experiment'}</td>
                        <td className="py-3.5 px-4">{sess.faculty?.name || 'Faculty in Charge'}</td>
                        <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                          {new Date(sess.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              sess.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : sess.status === 'COMPLETED'
                                ? 'bg-gray-100 text-gray-500 border border-gray-200'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {sess.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleEnterLabSession(sess)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer ${
                              sess.status === 'ACTIVE'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-gray-900'
                                : 'bg-gray-100 hover:bg-slate-700 text-gray-800 border border-gray-200'
                            }`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> {sess.status === 'ACTIVE' ? 'Enter Live Lab' : 'Open Workspace'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COURSE EXPERIMENTS */}
        {activeTab === 'experiments' && !selectedExperiment && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" /> Syllabus Experiments Catalog
                </h2>
                <p className="text-xs text-gray-500">Select an experiment to practice and solve coding questions.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    fetchSubjectExperiments(e.target.value);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiments.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                  No experiments found for this subject.
                </div>
              ) : (
                experiments.map((exp) => (
                  <div key={exp.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs font-mono">
                          #{exp.experimentNo}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{exp.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        {exp.questions?.length || 0} Questions Available
                      </span>
                      <button
                        onClick={() => handleOpenExperimentWorkspace(exp)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        Open Practical <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* WORKSPACE / IDE VIEW */}
        {selectedExperiment && (() => {
          const currentLevelIdx = questions.findIndex((q) => q.id === activeQuestion?.id);
          const isCurrentUnlocked = currentLevelIdx <= 0 || (currentLevelIdx > 0 && passedQuestions.has(questions[currentLevelIdx - 1]?.id));
          const isCurrentPassed = activeQuestion ? passedQuestions.has(activeQuestion.id) : false;
          const nextQuestion = currentLevelIdx >= 0 && currentLevelIdx + 1 < questions.length ? questions[currentLevelIdx + 1] : null;
          const passedCount = questions.filter((q) => passedQuestions.has(q.id)).length;

          return (
            <div className="space-y-6">
              {/* Tab Switch Warning Banner */}
              {showTabSwitchWarning && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                        Tab Switch Detected! (Violation Count: {tabSwitchCount})
                      </h4>
                      <p className="text-[11px] text-amber-700">
                        Focus loss and window switching are recorded during live practical evaluations. Please stay on this IDE window.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTabSwitchWarning(false)}
                    className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              )}

              {/* Workspace Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 border border-gray-200 rounded-2xl gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedExperiment(null);
                      setExecResult(null);
                    }}
                    className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    ← Back to Labs
                  </button>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono rounded-md">
                        Exp #{selectedExperiment.experimentNo}
                      </span>
                      {selectedExperiment.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleFullScreen}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isFullScreen
                        ? 'bg-amber-500 text-gray-900 border-amber-600 font-bold shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                    title="Toggle Fullscreen Exam Mode"
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" /> Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" /> Full Screen IDE
                      </>
                    )}
                  </button>

                  {activeSessionInfo && (
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Lab Session
                    </span>
                  )}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      if (DEFAULT_CODE_TEMPLATES[newLang]) {
                        setCode(DEFAULT_CODE_TEMPLATES[newLang]);
                      }
                    }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-blue-700 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ 17</option>
                    <option value="c">C Standard</option>
                    <option value="java">Java 17</option>
                  </select>
                </div>
              </div>

              {/* Progressive Difficulty Level Stepper */}
              {questions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Progressive Difficulty Levels
                      </span>
                      <span className="text-[11px] text-gray-500 hidden md:inline">
                        (Solve each level sequentially to unlock the next challenge)
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      Progress: <strong className="text-emerald-600">{passedCount}</strong> / {questions.length} Levels Mastered
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                    {questions.map((q, idx) => {
                      const isUnlocked = idx === 0 || passedQuestions.has(questions[idx - 1]?.id);
                      const isPassed = passedQuestions.has(q.id);
                      const isActive = activeQuestion?.id === q.id;
                      const difficulty = q.difficulty?.toUpperCase() || (idx === 0 ? 'EASY' : idx === 1 ? 'MEDIUM' : 'HARD');

                      return (
                        <button
                          key={q.id}
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (!isUnlocked) {
                              alert(`🔒 Level ${idx + 1} Locked!\n\nPlease solve and pass Level ${idx} ("${questions[idx - 1]?.title}") first to unlock this question.`);
                              return;
                            }
                            setActiveQuestion(q);
                            setExecResult(null);
                            setSelectedTestCaseIdx(0);
                            const currentSessId = activeSessionInfo?.id || sessions[0]?.id;
                            if (currentSessId) fetchAttempts(currentSessId, q.id);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all relative ${
                            isActive
                              ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                              : isPassed
                              ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50 cursor-pointer'
                              : isUnlocked
                              ? 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50 cursor-pointer'
                              : 'bg-gray-50/80 border-gray-200 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700">
                              Level {idx + 1}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                difficulty === 'EASY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : difficulty === 'HARD'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {difficulty}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-gray-900 truncate mb-1" title={q.title}>
                            {q.title}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                            <span className="text-gray-500 font-medium">{q.marks || 10} Marks</span>
                            {isPassed ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" /> Passed
                              </span>
                            ) : isActive ? (
                              <span className="text-blue-600 font-bold flex items-center gap-1 text-[11px]">
                                <Code2 className="w-3.5 h-3.5" /> Solving
                              </span>
                            ) : isUnlocked ? (
                              <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                                <ArrowRight className="w-3.5 h-3.5" /> Unlocked
                              </span>
                            ) : (
                              <span className="text-gray-400 font-semibold flex items-center gap-1 text-[11px]">
                                <Lock className="w-3.5 h-3.5" /> Locked
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* IDE & Problem Workspace Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Problem Statement & Guidelines (5 cols) */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
                  {!isCurrentUnlocked ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Lock className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-gray-900">Level Locked</h3>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto">
                          You must pass the previous problem to unlock this challenge. Complete Level {currentLevelIdx} first!
                        </p>
                      </div>
                      {currentLevelIdx > 0 && (
                        <button
                          onClick={() => {
                            setActiveQuestion(questions[currentLevelIdx - 1]);
                            setExecResult(null);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 shadow-sm"
                        >
                          Go to Level {currentLevelIdx}: {questions[currentLevelIdx - 1]?.title}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Problem Header Info */}
                      <div className="space-y-2 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            Level {currentLevelIdx + 1} of {questions.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                                activeQuestion?.difficulty === 'EASY'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : activeQuestion?.difficulty === 'HARD'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {activeQuestion?.difficulty || 'MEDIUM'}
                            </span>
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                              {activeQuestion?.marks || 10} Marks
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {activeQuestion?.title || selectedExperiment.title}
                        </h3>

                        {isCurrentPassed && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                            Status: Passed & Verified
                          </div>
                        )}
                      </div>

                      {/* Problem Description */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Problem Description
                        </h4>
                        <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                          {activeQuestion?.description || selectedExperiment.description}
                        </div>
                      </div>

                      {/* Sample Test Case Section */}
                      {activeQuestion?.testCases && activeQuestion.testCases.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Sample Test Case #1
                            </h4>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(activeQuestion.testCases[0]?.input || '');
                                setCopiedInput(true);
                                setTimeout(() => setCopiedInput(false), 2000);
                              }}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedInput ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              {copiedInput ? 'Copied!' : 'Copy Input'}
                            </button>
                          </div>

                          <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200 font-mono text-xs">
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Standard Input:</span>
                              <pre className="p-2 bg-white rounded-lg border border-gray-200 text-gray-900 overflow-x-auto whitespace-pre-wrap">
                                {activeQuestion.testCases[0]?.input || '(Empty Input)'}
                              </pre>
                            </div>
                            <div>
                              <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Expected Output:</span>
                              <pre className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-700 font-semibold overflow-x-auto whitespace-pre-wrap">
                                {activeQuestion.testCases[0]?.expectedOutput || '(Empty Output)'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Security & Sandbox Info */}
                      <div className="p-3 bg-blue-50/50 border border-blue-200/60 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Automated Evaluation:</strong> Code runs in a secure isolated Docker sandbox. All public and hidden test cases must pass to unlock the next level.
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right Panel: Code Editor & Execution Runner (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* IDE Code Editor */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md flex flex-col">
                    {/* Editor Header Bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100/80 border-b border-gray-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-semibold text-gray-800">
                          solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'java' ? 'java' : 'c'}
                        </span>
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold rounded-md">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Anti-Cheat Monitored
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetCode}
                          title="Reset to default starter template"
                          className="px-2.5 py-1 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>

                        <button
                          onClick={handleRunCode}
                          disabled={executing || !isCurrentUnlocked}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {executing ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Running in Sandbox...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" /> Run & Test Code
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Anti-Cheat Paste Warning Alert */}
                    {showPasteWarning && (
                      <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>
                            <strong>Anti-Cheat Active:</strong> External clipboard pasting is disabled in Exam Mode to preserve individual work integrity. (Blocked attempts: {pasteAttempts})
                          </span>
                        </div>
                        <button
                          onClick={() => setShowPasteWarning(false)}
                          className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-sm cursor-pointer"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    {/* Code Textarea with Dark Terminal Theme */}
                    <div className="relative bg-[#18181b] p-1">
                      <textarea
                        rows={14}
                        value={code}
                        disabled={!isCurrentUnlocked}
                        onPaste={handlePasteInEditor}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your solution here..."
                        spellCheck={false}
                        className="w-full p-4 bg-[#18181b] text-gray-100 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600 selection:text-white"
                      />
                    </div>
                  </div>

                  {/* Execution Results Output Console */}
                  {execResult && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-md">
                      {/* Level Passed Banner with Next Level Action Button */}
                      {execResult.status === 'PASSED' && (
                        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                              ✓
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-emerald-900">
                                Level {currentLevelIdx + 1} Passed! All Test Cases Succeeded.
                              </h4>
                              <p className="text-xs text-emerald-700">
                                {nextQuestion
                                  ? `Great job! You have unlocked Level ${currentLevelIdx + 2}: "${nextQuestion.title}".`
                                  : 'Outstanding! You have solved all levels in this laboratory experiment.'}
                              </p>
                            </div>
                          </div>

                          {nextQuestion && (
                            <button
                              onClick={() => handleProceedToNextLevel(nextQuestion)}
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            >
                              Proceed to Level {currentLevelIdx + 2}: {nextQuestion.title}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Status & Metrics Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">Execution Status:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              execResult.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {execResult.status === 'PASSED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {execResult.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                          <span>⏱️ {execResult.executionTime}ms</span>
                          <span>💾 {execResult.memoryUsed}MB RAM</span>
                          <span className="font-bold text-gray-800">
                            Score: {execResult.score} / {activeQuestion?.marks || 10}
                          </span>
                        </div>
                      </div>

                      {/* Test Cases Results List */}
                      {execResult.testResults && execResult.testResults.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                            Test Case Outcomes:
                          </span>

                          <div className="grid grid-cols-1 gap-2.5">
                            {execResult.testResults.map((tc: any, i: number) => (
                              <div
                                key={i}
                                className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                                  tc.passed
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-rose-50/50 border-rose-200'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold mb-1">
                                  <span className="flex items-center gap-1.5">
                                    {tc.passed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-rose-600" />
                                    )}
                                    {tc.isHidden ? `Hidden Evaluation Case #${i + 1}` : `Sample Test Case #${i + 1}`}
                                  </span>
                                  <span className={tc.passed ? 'text-emerald-700' : 'text-rose-700'}>
                                    {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                  </span>
                                </div>

                                {!tc.isHidden && !tc.passed && (
                                  <div className="space-y-1 pt-1.5 text-[11px]">
                                    <div className="text-gray-600">
                                      <strong>Input:</strong> {tc.input}
                                    </div>
                                    <div className="text-emerald-700">
                                      <strong>Expected:</strong> {tc.expectedOutput}
                                    </div>
                                    <div className="text-rose-700">
                                      <strong>Your Output:</strong> {tc.actualOutput || '(None)'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Academic Feedback Box */}
                      {execResult.aiSuggestions && (
                        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Academic AI Tutor Hint
                          </div>
                          <div className="text-indigo-800 leading-relaxed">
                            {execResult.aiSuggestions}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: TIMETABLE SCHEDULE */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-700" /> Allocated Lab Timetable Schedule
            </h2>

            <TimetableMonthView slots={timetableSlots} userName={user?.name || 'Student'} />
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-700" /> Course Assignments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                  No assignments posted yet for your batch.
                </div>
              ) : (
                assignments.map((asg) => (
                  <div key={asg.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <h3 className="text-base font-bold text-gray-900">{asg.title}</h3>
                      <span className="text-xs font-semibold text-emerald-400">{asg.maxMarks} Marks</span>
                    </div>
                    <p className="text-xs text-gray-700">{asg.description}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Deadline: {new Date(asg.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => setSelectedAssignment(asg)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                      >
                        Submit Assignment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-700" /> DOCS AI Academic Assistant
            </h2>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-blue-600 text-gray-900' : 'bg-gray-100 text-gray-800'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAiQuestion} className="flex gap-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask DOCS AI for coding hints or algorithm explanations..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-gray-900 font-semibold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

      {/* ASSIGNMENT SUBMISSION MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">Submit Solution for {selectedAssignment.title}</h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Text Solution / Notes</label>
                <textarea
                  rows={3}
                  value={textSolution}
                  onChange={(e) => setTextSolution(e.target.value)}
                  placeholder="Paste solution or submission remarks..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Attach File (PDF, PNG, ZIP)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-gray-700 text-xs"
                />
              </div>

              {assignmentMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-center font-semibold">
                  {assignmentMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignment}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-gray-900 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {submittingAssignment ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execution Result Popup */}
      {showResultPopup && execResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl text-center">
            {execResult.status === 'PASSED' ? (
              <>
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Question Solved!</h3>
                <p className="text-sm text-gray-500 pb-4 border-b border-gray-100">
                  Great job! Your solution passed all test cases successfully.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Time</span>
                    <span className="text-lg font-mono font-bold text-blue-700">{execResult.executionTime}ms</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Memory</span>
                    <span className="text-lg font-mono font-bold text-emerald-600">{execResult.memoryUsed}MB</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  {execResult.status === 'COMPILATION_ERROR' ? <AlertTriangle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {execResult.status === 'COMPILATION_ERROR' ? 'Compilation Error' : execResult.status === 'RUNTIME_ERROR' ? 'Runtime Error' : 'Test Case Failed'}
                </h3>
                
                {execResult.aiSuggestions && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-left mt-4">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> AI Hint
                    </h4>
                    <p className="text-xs text-indigo-900 leading-relaxed">{execResult.aiSuggestions}</p>
                  </div>
                )}
                
                {execResult.status !== 'PASSED' && execResult.testResults && execResult.testResults.length > 0 && (
                  <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-40 overflow-y-auto mt-4 text-xs">
                    <h4 className="font-bold text-gray-700 mb-2">Failing Test Cases:</h4>
                    {execResult.testResults.filter((tr: any) => !tr.passed).map((tr: any, idx: number) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <div className="text-gray-500">Input: <span className="text-gray-900 font-mono">{tr.isHidden ? 'Hidden' : tr.input}</span></div>
                        <div className="text-gray-500">Expected: <span className="text-emerald-600 font-mono">{tr.isHidden ? 'Hidden' : tr.expectedOutput}</span></div>
                        <div className="text-gray-500">Got: <span className="text-red-600 font-mono">{tr.actualOutput}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setShowResultPopup(false)}
              className={`w-full mt-4 px-4 py-3 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors ${execResult.status === 'PASSED' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
            >
              {execResult.status === 'PASSED' ? 'Continue' : 'Back to Editor'}
            </button>
          </div>
        </div>
      )}
    </div>
    </SidebarLayout>
  );
}
