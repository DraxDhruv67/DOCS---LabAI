'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/components/SidebarLayout';
import {
  BookOpen,
  Calendar,
  FileCode,
  Clock,
  Plus,
  Play,
  CheckCircle,
  FileText,
  AlertTriangle,
  Search,
  Users,
  Building2,
  CheckCheck,
  UserCheck,
  Shield,
  Layers,
  StopCircle,
} from 'lucide-react';

export default function FacultyDashboard() { 

    
  const facultyTabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'experiments', label: 'Course Experiments', icon: FileCode },
    { id: 'sessions', label: 'Practical Lab Sessions', icon: Clock },
    { id: 'assignments', label: 'Course Assignments', icon: FileText },
    { id: 'plagiarism', label: 'Plagiarism Audit', icon: Search },
  ];

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'experiments' | 'sessions' | 'assignments' | 'plagiarism'>('overview');

  // Data states
  const [subjects, setSubjects] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [allBatches, setAllBatches] = useState<any[]>([]);
  const [plagiarismReport, setPlagiarismReport] = useState<any>(null);
  const [scanningPlagiarism, setScanningPlagiarism] = useState(false);

  // Selected subject for experiment management
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Modals
  const [showExpModal, setShowExpModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Experiment form
  const [expNo, setExpNo] = useState('1');
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Question form
  const [targetExpId, setTargetExpId] = useState('');
  const [qTitle, setQTitle] = useState('');
  const [qDesc, setQDesc] = useState('');
  const [qDiff, setQDiff] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [qLanguages, setQLanguages] = useState<string[]>(['python', 'cpp', 'c', 'java']);
  const [qTcInput, setQTcInput] = useState('1.0 2.0 3.0');
  const [qTcOutput, setQTcOutput] = useState('1.0 2.0 3.0');

  // Session form
  const [sessSubjId, setSessSubjId] = useState('');
  const [sessExpId, setSessExpId] = useState('');
  const [sessBatchId, setSessBatchId] = useState('');
  const [sessStart, setSessStart] = useState('');
  const [sessEnd, setSessEnd] = useState('');

  // Assignment form
  const [asgSubjId, setAsgSubjId] = useState('');
  const [asgBatchId, setAsgBatchId] = useState('');
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgMaxMarks, setAsgMaxMarks] = useState('10.0');
  const [asgLatePenalty, setAsgLatePenalty] = useState('1.0');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if (data.user) loadFacultyData(data.user.id);
      });

    // Load available batches for selection
    fetch('/api/admin/batches')
      .then((res) => res.json())
      .then((d) => setAllBatches(d.batches || []));
  }, []);

  const loadFacultyData = (facultyId: string) => {
    fetch('/api/admin/subjects')
      .then((res) => res.json())
      .then((d) => {
        const allSubs = d.subjects || [];
        const assignedSubs = allSubs.filter((s: any) =>
          s.facultyAllocations?.some((fa: any) => fa.facultyId === facultyId)
        );
        const displaySubs = assignedSubs.length > 0 ? assignedSubs : allSubs;
        setSubjects(displaySubs);
        if (displaySubs.length > 0) {
          const initialSubjId = displaySubs[0].id;
          setSelectedSubjectId(initialSubjId);
          setSessSubjId(initialSubjId);
          setAsgSubjId(initialSubjId);
          fetchExperiments(initialSubjId);
        }
      });

    fetch(`/api/faculty/sessions?facultyId=${facultyId}`)
      .then((res) => res.json())
      .then((d) => setSessions(d.sessions || []));

    fetch('/api/faculty/assignments')
      .then((res) => res.json())
      .then((d) => setAssignments(d.assignments || []));

    fetch(`/api/admin/timetable?facultyId=${facultyId}`)
      .then((res) => res.json())
      .then((d) => setTimetableSlots(d.timetableSlots || []));
  };

  const fetchExperiments = (subjId: string) => {
    fetch(`/api/faculty/experiments?subjectId=${subjId}`)
      .then((res) => res.json())
      .then((d) => {
        const exps = d.experiments || [];
        setExperiments(exps);
        if (exps.length > 0) {
          setSessExpId(exps[0].id);
        }
      });
  };

  const handleCreateExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/faculty/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: selectedSubjectId,
        experimentNo: expNo,
        title: expTitle,
        description: expDesc,
      }),
    });
    setExpTitle('');
    setExpDesc('');
    setShowExpModal(false);
    fetchExperiments(selectedSubjectId);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/faculty/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experimentId: targetExpId,
        title: qTitle,
        description: qDesc,
        difficulty: qDiff,
        allowedLanguages: qLanguages,
        testCases: [{ input: qTcInput, expectedOutput: qTcOutput, isHidden: false }],
      }),
    });
    setQTitle('');
    setQDesc('');
    setShowQuestionModal(false);
    fetchExperiments(selectedSubjectId);
  };

  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const subId = sessSubjId || selectedSubjectId || subjects[0]?.id;
    const expId = sessExpId || experiments[0]?.id;
    const batchId = sessBatchId || allBatches[0]?.id;

    const now = new Date();
    const startTime = sessStart ? new Date(sessStart).toISOString() : now.toISOString();
    const endTime = sessEnd ? new Date(sessEnd).toISOString() : new Date(now.getTime() + 2 * 3600 * 1000).toISOString();

    await fetch('/api/faculty/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: subId,
        experimentId: expId,
        batchId: batchId,
        startTime,
        endTime,
      }),
    });
    setShowSessionModal(false);
    if (user) loadFacultyData(user.id);
  };

  const handleStartLabSession = async (sessionId: string) => {
    await fetch('/api/faculty/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        status: 'ACTIVE',
      }),
    });
    if (user) loadFacultyData(user.id);
  };

  const handleCloseLabSession = async (sessionId: string) => {
    await fetch('/api/faculty/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        status: 'COMPLETED',
      }),
    });
    if (user) loadFacultyData(user.id);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const subId = asgSubjId || selectedSubjectId || subjects[0]?.id;
    const batchId = asgBatchId || allBatches[0]?.id;

    await fetch('/api/faculty/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: subId,
        batchId: batchId,
        title: asgTitle,
        description: asgDesc,
        deadline: asgDeadline || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        maxMarks: parseFloat(asgMaxMarks || '10.0'),
        latePenaltyPerDay: parseFloat(asgLatePenalty || '1.0'),
      }),
    });
    setAsgTitle('');
    setAsgDesc('');
    setShowAssignModal(false);
    if (user) loadFacultyData(user.id);
  };

  const handleToggleLeaderboard = async (sessionId: string, currentStatus: boolean) => {
    await fetch('/api/faculty/sessions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        isLeaderboardPublished: !currentStatus,
      }),
    });
    if (user) loadFacultyData(user.id);
  };

  const handleCheckPlagiarism = async (sessionId: string) => {
    setScanningPlagiarism(true);
    const res = await fetch('/api/faculty/plagiarism', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json();
    setPlagiarismReport(data);
    setScanningPlagiarism(false);
    setActiveTab('plagiarism');
  };

  if (!user) {

  return (
      <div className="min-h-screen bg-gray-50 text-gray-500 flex flex-col items-center justify-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Faculty Workspace...</span>
        </div>
      </div>
    );
  }

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <SidebarLayout 
      user={user} 
      tabs={facultyTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab as any}
    >
      <div className="space-y-8">
        {/* Professional Faculty Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" /> Faculty Portal & Laboratory Management
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {user.name}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                Employee ID: <span className="text-gray-800 font-mono font-semibold">{user.employeeId || 'FAC-101'}</span> | Department: <span className="text-gray-800 font-semibold">{user.department?.name || 'Computer Science & Engineering'}</span>
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setExpNo(String(experiments.length + 1));
                  setShowExpModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Experiment
              </button>
              <button
                onClick={() => {
                  // Default to today and current hour
                  const now = new Date();
                  now.setMinutes(0, 0, 0);
                  const end = new Date(now.getTime() + 2 * 3600 * 1000);
                  const toLocalISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setSessStart(toLocalISO(now));
                  setSessEnd(toLocalISO(end));
                  setShowSessionModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Schedule Lab Session
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-slate-700 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" /> Create Assignment
              </button>
            </div>
          </div>
          </div>
          {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Assigned Courses & Allocated Batches
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subj) => (
                <div key={subj.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-md">
                      {subj.code}
                    </span>
                    <span className="text-xs text-gray-500">{subj.department?.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{subj.name}</h3>

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Allocated Batches:</span>
                    <div className="flex flex-wrap gap-2">
                      {(subj.facultyAllocations || []).map((fa: any) => (
                        <span key={fa.id} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-xs font-medium rounded-md">
                          {fa.batch?.name} ({fa.batch?.division?.name || 'Div D'})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedSubjectId(subj.id);
                        fetchExperiments(subj.id);
                        setActiveTab('experiments');
                      }}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Manage Experiments ({subj.experiments?.length || 0}) →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: COURSE EXPERIMENTS */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-emerald-400" /> Syllabus Experiments for {currentSubject?.name} ({currentSubject?.code})
                </h2>
                <p className="text-xs text-gray-500">Add experiments and configure problem statements.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    fetchExperiments(e.target.value);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-medium"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setExpNo(String(experiments.length + 1));
                    setShowExpModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Experiment
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {experiments.length === 0 ? (
                <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                  No experiments created yet for this course. Click "Add Experiment" to create one.
                </div>
              ) : (
                experiments.map((exp) => (
                  <div key={exp.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                          #{exp.experimentNo}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">{exp.title}</h3>
                      </div>
                      <button
                        onClick={() => {
                          setTargetExpId(exp.id);
                          setShowQuestionModal(true);
                        }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-slate-700 text-emerald-400 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">{exp.description}</p>

                    {/* Question Sub-items */}
                    <div className="space-y-2 pt-2">
                      {(exp.questions || []).map((q: any) => (
                        <div key={q.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-gray-800">{q.title}</div>
                            <div className="text-[11px] text-gray-500">{q.description}</div>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded">
                            {q.difficulty} | {q.marks} Marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRACTICAL LAB SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" /> Scheduled & Active Practical Lab Sessions
                </h2>
                <p className="text-xs text-gray-500">Monitor active lab sessions, launch live practicals, and control leaderboard visibility.</p>
              </div>

              <button
                onClick={() => {
                  const now = new Date();
                  now.setMinutes(0, 0, 0);
                  const end = new Date(now.getTime() + 2 * 3600 * 1000);
                  const toLocalISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                  setSessStart(toLocalISO(now));
                  setSessEnd(toLocalISO(end));
                  setShowSessionModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Schedule New Lab
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">Experiment</th>
                    <th className="py-3.5 px-4">Allocated Batch</th>
                    <th className="py-3.5 px-4">Date & Time Range</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                        No lab sessions scheduled yet. Click "Schedule New Lab" to create one.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-gray-100/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{sess.subject?.name}</td>
                        <td className="py-3.5 px-4 text-gray-800">{sess.experiment?.title || 'Experiment'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 font-medium">
                            {sess.batch?.name || 'Batch 1'}
                          </span>
                        </td>
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
                          <div className="flex items-center justify-end gap-2">
                            {sess.status !== 'ACTIVE' ? (
                              <button
                                onClick={() => handleStartLabSession(sess.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-semibold rounded-lg text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                <Play className="w-3 h-3 fill-current" /> Start Lab
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCloseLabSession(sess.id)}
                                className="px-3 py-1 bg-gray-100 hover:bg-slate-700 text-gray-700 border border-gray-200 font-semibold rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <StopCircle className="w-3 h-3 text-red-700" /> End Lab
                              </button>
                            )}
                            <button
                              onClick={() => handleCheckPlagiarism(sess.id)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-slate-700 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Plagiarism
                            </button>
                          </div>
                        </td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" /> Course Assignments & Submissions
                </h2>
                <p className="text-xs text-gray-500">Create written homework, case studies, and track student submissions.</p>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Assignment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                  No assignments created yet. Click "Create Assignment" to post one.
                </div>
              ) : (
                assignments.map((asg) => (
                  <div key={asg.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h3 className="text-base font-bold text-gray-900">{asg.title}</h3>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                        Max Marks: {asg.maxMarks}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{asg.description}</p>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <span>Course: <strong className="text-gray-800">{asg.subject?.name}</strong></span>
                      <span>Deadline: {new Date(asg.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PLAGIARISM */}
        {activeTab === 'plagiarism' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" /> AST Code Plagiarism Scanner
            </h2>

            {scanningPlagiarism ? (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                Scanning AST tokens for code similarity...
              </div>
            ) : plagiarismReport ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Similarity Audit Results</h3>
                {(plagiarismReport.matches || []).map((m: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-900">{m.studentA}</span> vs <span className="font-semibold text-gray-900">{m.studentB}</span>
                    </div>
                    <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 font-bold rounded-md">
                      {m.similarity}% Similarity
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-500 text-xs">
                Select a lab session under "Practical Lab Sessions" to run the AST similarity scan.
              </div>
            )}
          </div>
        )}

      {/* CREATE EXPERIMENT MODAL */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">Add Course Experiment</h3>
            <form onSubmit={handleCreateExperiment} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Experiment Number</label>
                <input
                  type="number"
                  required
                  value={expNo}
                  onChange={(e) => setExpNo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Experiment Title</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Matrix Multiplication & Arrays"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Description / Problem Statement</label>
                <textarea
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Write clear instructions for students..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE SESSION MODAL */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">Schedule Practical Lab Session</h3>
            <form onSubmit={handleScheduleSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Subject</label>
                <select
                  value={sessSubjId}
                  onChange={(e) => {
                    setSessSubjId(e.target.value);
                    fetchExperiments(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Experiment</label>
                <select
                  value={sessExpId}
                  onChange={(e) => setSessExpId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {experiments.map((e) => (
                    <option key={e.id} value={e.id}>
                      #{e.experimentNo}: {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Allocated Student Batch</label>
                <select
                  value={sessBatchId}
                  onChange={(e) => setSessBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.division?.name || 'Div D'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={sessStart}
                  onChange={(e) => setSessStart(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={sessEnd}
                  onChange={(e) => setSessEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">Add Practical Question</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="e.g. Implement Matrix Multiplication Function"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Problem Description</label>
                <textarea
                  rows={2}
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  placeholder="Problem details..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Difficulty</label>
                <select
                  value={qDiff}
                  onChange={(e) => setQDiff(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Test Case Input</label>
                <input
                  type="text"
                  value={qTcInput}
                  onChange={(e) => setQTcInput(e.target.value)}
                  placeholder="1.0 2.0 3.0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Expected Output</label>
                <input
                  type="text"
                  value={qTcOutput}
                  onChange={(e) => setQTcOutput(e.target.value)}
                  placeholder="1.0 2.0 3.0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">Create Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Subject</label>
                <select
                  value={asgSubjId}
                  onChange={(e) => setAsgSubjId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Batch</label>
                <select
                  value={asgBatchId}
                  onChange={(e) => setAsgBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.division?.name || 'Div D'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Case Study: Neural Network Architectures"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Assignment guidelines..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-gray-900 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Post Assignment
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
