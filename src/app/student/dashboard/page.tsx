'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';

export default function StudentDashboard() {
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

  // Coding workspace state
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>(
    'def solve():\n    # Write your practical implementation here\n    pass\n\nif __name__ == "__main__":\n    solve()'
  );

  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);

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
    fetch('/api/admin/subjects')
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
    const qList = exp.questions || [];
    setQuestions(qList);
    if (qList.length > 0) {
      setActiveQuestion(qList[0]);
      const currentSessId = sessionObj?.id || sessions[0]?.id;
      if (currentSessId) {
        fetchAttempts(currentSessId, qList[0].id);
      }
    }
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
      setExecResult(data.executionResult);
      fetchAttempts(sessId, activeQuestion.id);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setExecuting(false);
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
        if (uploadRes.ok) {
          uploadedFileUrl = uploadData.fileUrl;
          uploadedFileName = uploadData.fileName;
          uploadedFileSize = uploadData.fileSize;
        }
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
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center gap-4 text-sm font-medium">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Professional Academic Student Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" /> Student Academic Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {user.name}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                Roll No: <span className="text-slate-200 font-mono font-semibold">{user.rollNo || '21DS05'}</span> | Batch: <span className="text-slate-200 font-semibold">{user.batch?.name || 'Batch 1'}</span> ({user.batch?.division?.name || 'Division D'}) | Department: <span className="text-slate-200 font-semibold">CSE (Data Science)</span>
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                <span className="text-slate-400">Active Labs: </span>
                <strong className="text-emerald-400">{activeSessions.length} Live</strong>
              </div>
              <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                <span className="text-slate-400">Scheduled: </span>
                <strong className="text-blue-400">{scheduledSessions.length} Upcoming</strong>
              </div>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'sessions', label: 'Practical Lab Sessions', icon: Clock },
              { id: 'experiments', label: 'Course Experiments', icon: FileText },
              { id: 'timetable', label: 'Timetable Schedule', icon: Calendar },
              { id: 'assignments', label: 'Course Assignments', icon: Upload },
              { id: 'ai', label: 'Academic AI Assistant', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedExperiment(null);
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: PRACTICAL LAB SESSIONS (DEFAULT) */}
        {activeTab === 'sessions' && !selectedExperiment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" /> Allocated Practical Lab Sessions
                </h2>
                <p className="text-xs text-slate-400">View live active labs and upcoming scheduled sessions for your batch.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
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
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                        No practical lab sessions scheduled yet for your batch.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">{sess.subject?.name}</td>
                        <td className="py-3.5 px-4 text-slate-200">{sess.experiment?.title || 'Experiment'}</td>
                        <td className="py-3.5 px-4">{sess.faculty?.name || 'Faculty in Charge'}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(sess.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              sess.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : sess.status === 'COMPLETED'
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
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
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" /> Syllabus Experiments Catalog
                </h2>
                <p className="text-xs text-slate-400">Select an experiment to practice and solve coding questions.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Subject:</span>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    fetchSubjectExperiments(e.target.value);
                  }}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium"
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
                <div className="col-span-2 p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No experiments found for this subject.
                </div>
              ) : (
                experiments.map((exp) => (
                  <div key={exp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
                          #{exp.experimentNo}
                        </span>
                        <h3 className="text-base font-bold text-white">{exp.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {exp.questions?.length || 0} Questions Available
                      </span>
                      <button
                        onClick={() => handleOpenExperimentWorkspace(exp)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
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
        {selectedExperiment && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-4 border border-slate-800 rounded-2xl gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  ← Back to List
                </button>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Exp #{selectedExperiment.experimentNo}: {selectedExperiment.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {activeSessionInfo && (
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-md">
                    Session: {activeSessionInfo.status}
                  </span>
                )}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-400 font-semibold"
                >
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ 17</option>
                  <option value="c">C Standard</option>
                  <option value="java">Java 17</option>
                </select>
              </div>
            </div>

            {/* IDE Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Problem Statement Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  {activeQuestion?.title || selectedExperiment.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeQuestion?.description || selectedExperiment.description}
                </p>

                {activeQuestion?.testCases && activeQuestion.testCases.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Sample Test Case:</span>
                    <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono space-y-1 border border-slate-800">
                      <div className="text-slate-400">Input: <span className="text-slate-200">{activeQuestion.testCases[0]?.input}</span></div>
                      <div className="text-slate-400">Expected: <span className="text-emerald-400">{activeQuestion.testCases[0]?.expectedOutput}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor & Execution Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-mono flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" /> main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'cpp' ? 'cpp' : 'c'}
                    </span>
                    <button
                      onClick={handleRunCode}
                      disabled={executing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> {executing ? 'Executing Code...' : 'Run & Test Code'}
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Execution Results Output */}
                {execResult && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
                      <span>Execution Status:</span>
                      <span className={execResult.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}>
                        {execResult.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-200 border border-slate-800">
                      <div>Output: {execResult.stdout || execResult.stderr || 'Execution completed without output.'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TIMETABLE SCHEDULE */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Allocated Lab Timetable Schedule
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Faculty in Charge</th>
                    <th className="py-3 px-4">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {timetableSlots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                        No timetable slots scheduled for your batch.
                      </td>
                    </tr>
                  ) : (
                    timetableSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-cyan-400">{slot.dayOfWeek}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">{slot.subject?.name}</td>
                        <td className="py-3 px-4">{slot.faculty?.name}</td>
                        <td className="py-3 px-4 text-emerald-400">{slot.roomNo}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" /> Course Assignments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No assignments posted yet for your batch.
                </div>
              ) : (
                assignments.map((asg) => (
                  <div key={asg.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">{asg.title}</h3>
                      <span className="text-xs font-semibold text-emerald-400">{asg.maxMarks} Marks</span>
                    </div>
                    <p className="text-xs text-slate-300">{asg.description}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Deadline: {new Date(asg.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => setSelectedAssignment(asg)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> DOCS AI Academic Assistant
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="h-64 overflow-y-auto space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                {aiMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
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
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs cursor-pointer disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ASSIGNMENT SUBMISSION MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Submit Solution for {selectedAssignment.title}</h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Text Solution / Notes</label>
                <textarea
                  rows={3}
                  value={textSolution}
                  onChange={(e) => setTextSolution(e.target.value)}
                  placeholder="Paste solution or submission remarks..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Attach File (PDF, PNG, ZIP)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-slate-300 text-xs"
                />
              </div>

              {assignmentMessage && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-center font-semibold">
                  {assignmentMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignment}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {submittingAssignment ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
