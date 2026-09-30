'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';
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
        {selectedExperiment && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 border border-gray-200 rounded-2xl gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExperiment(null)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  ← Back to List
                </button>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
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
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-blue-700 font-semibold"
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
              <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
                  {activeQuestion?.title || selectedExperiment.title}
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {activeQuestion?.description || selectedExperiment.description}
                </p>

                {activeQuestion?.testCases && activeQuestion.testCases.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">Sample Test Case:</span>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono space-y-1 border border-gray-200">
                      <div className="text-gray-500">Input: <span className="text-gray-800">{activeQuestion.testCases[0]?.input}</span></div>
                      <div className="text-gray-500">Expected: <span className="text-emerald-400">{activeQuestion.testCases[0]?.expectedOutput}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor & Execution Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-200 pb-2">
                    <span className="font-mono flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-700" /> main.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'cpp' ? 'cpp' : 'c'}
                    </span>
                    <button
                      onClick={handleRunCode}
                      disabled={executing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> {executing ? 'Executing Code...' : 'Run & Test Code'}
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Execution Results Output */}
                {execResult && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold border-b border-gray-200 pb-2">
                      <span>Execution Status:</span>
                      <span className={execResult.status === 'PASSED' ? 'text-emerald-400' : 'text-red-700'}>
                        {execResult.status}
                      </span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-800 border border-gray-200">
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
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" /> Allocated Lab Timetable Schedule
            </h2>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
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
                      <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                        No timetable slots scheduled for your batch.
                      </td>
                    </tr>
                  ) : (
                    timetableSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-gray-100/40">
                        <td className="py-3 px-4 font-bold text-blue-700">{slot.dayOfWeek}</td>
                        <td className="py-3 px-4 font-mono text-gray-700">
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{slot.subject?.name}</td>
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
    </div>
    </SidebarLayout>
  );
}
