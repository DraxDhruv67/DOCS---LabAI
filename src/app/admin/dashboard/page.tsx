'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Building2,
  Users,
  BookOpen,
  Calendar,
  Layers,
  Plus,
  Shield,
  UserPlus,
  Sliders,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Edit,
  Trash2,
  Search,
  UserCheck,
  Briefcase,
  Settings2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'users' | 'subjects' | 'allocations' | 'timetable' | 'rubrics' | 'analytics'>(
    'hierarchy'
  );

  // Data states
  const [sessions, setSessions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Filter states
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Unified Academic Hierarchy Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configSubTab, setConfigSubTab] = useState<'session' | 'department' | 'class' | 'division' | 'batch'>('session');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRubricModal, setShowRubricModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  // Form states
  const [newSessionRange, setNewSessionRange] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  // Study Year form
  const [syName, setSyName] = useState('SY');
  const [sySessionId, setSySessionId] = useState('');
  const [syDeptId, setSyDeptId] = useState('');

  // Division form
  const [divName, setDivName] = useState('Division D');
  const [divSyId, setDivSyId] = useState('');

  // Batch form
  const [batchName, setBatchName] = useState('Batch 1');
  const [batchDivId, setBatchDivId] = useState('');

  // User form
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'STUDENT' | 'FACULTY' | 'ADMIN'>('STUDENT');
  const [userRollNo, setUserRollNo] = useState('');
  const [userEmployeeId, setUserEmployeeId] = useState('');
  const [userDeptId, setUserDeptId] = useState('');
  const [userBatchId, setUserBatchId] = useState('');

  // Subject form
  const [subjCode, setSubjCode] = useState('');
  const [subjName, setSubjName] = useState('');
  const [subjDeptId, setSubjDeptId] = useState('');
  const [subjStudyYearId, setSubjStudyYearId] = useState('');
  const [subjRubricId, setSubjRubricId] = useState('');

  // Allocation form
  const [allocSubjId, setAllocSubjId] = useState('');
  const [allocBatchId, setAllocBatchId] = useState('');
  const [allocFacultyId, setAllocFacultyId] = useState('');

  // Rubric form
  const [rubricTitle, setRubricTitle] = useState('');
  const [rubricMaxMarks, setRubricMaxMarks] = useState('10');
  const [rubricCriteria, setRubricCriteria] = useState([
    { category: 'Program Logic & Code Structure', marks: 5 },
    { category: 'Test Case Output Accuracy', marks: 3 },
    { category: 'Viva Voce & Understanding', marks: 2 },
  ]);

  // Timetable form
  const [ttSessionId, setTtSessionId] = useState('');
  const [ttDeptId, setTtDeptId] = useState('');
  const [ttStudyYearId, setTtStudyYearId] = useState('');
  const [ttDivId, setTtDivId] = useState('');
  const [ttBatchId, setTtBatchId] = useState('');
  const [ttSubjectId, setTtSubjectId] = useState('');
  const [ttFacultyId, setTtFacultyId] = useState('');
  const [ttDay, setTtDay] = useState('MONDAY');
  const [ttStart, setTtStart] = useState('09:00');
  const [ttEnd, setTtEnd] = useState('11:00');
  const [ttRoom, setTtRoom] = useState('Data Science Lab 302');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          document.cookie = 'docs_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
          loadAllData();
        } else {
          document.cookie = 'docs_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          window.location.href = '/login';
        }
      })
      .catch(() => {
        document.cookie = 'docs_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      });
  }, []);

  const loadAllData = () => {
    fetch('/api/admin/academic-sessions')
      .then((res) => res.json())
      .then((d) => {
        const sessList = d.sessions || [];
        setSessions(sessList);
        if (sessList.length > 0 && !sySessionId) setSySessionId(sessList[0].id);
      });

    fetch('/api/admin/departments')
      .then((res) => res.json())
      .then((d) => {
        const depts = d.departments || [];
        setDepartments(depts);
        if (depts.length > 0 && !syDeptId) setSyDeptId(depts[0].id);
      });

    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((d) => setUsers(d.users || []));

    fetch('/api/admin/subjects')
      .then((res) => res.json())
      .then((d) => setSubjects(d.subjects || []));

    fetch('/api/admin/allocations')
      .then((res) => res.json())
      .then((d) => setAllocations(d.allocations || []));

    fetch('/api/admin/rubrics')
      .then((res) => res.json())
      .then((d) => setRubrics(d.rubrics || []));

    fetch('/api/admin/timetable')
      .then((res) => res.json())
      .then((d) => setTimetableSlots(d.timetableSlots || []));

    fetch('/api/analytics?type=summary')
      .then((res) => res.json())
      .then((d) => setAnalytics(d.stats || null));
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/academic-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yearRange: newSessionRange || '2026-2027', isCurrent: true }),
    });
    setNewSessionRange('');
    setShowConfigModal(false);
    loadAllData();
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newDeptCode || 'CSE-DS', name: newDeptName || 'Data Science' }),
    });
    setNewDeptCode('');
    setNewDeptName('');
    setShowConfigModal(false);
    loadAllData();
  };

  const handleCreateStudyYear = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/study-years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: syName || 'SY',
        academicSessionId: sySessionId || sessions[0]?.id,
        departmentId: syDeptId || departments[0]?.id,
      }),
    });
    setShowConfigModal(false);
    loadAllData();
  };

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/divisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: divName || 'Division D',
        studyYearId: divSyId || departments[0]?.studyYears[0]?.id,
      }),
    });
    setShowConfigModal(false);
    loadAllData();
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: batchName || 'Batch 1',
        divisionId: batchDivId || departments[0]?.studyYears[0]?.divisions[0]?.id,
      }),
    });
    setShowConfigModal(false);
    loadAllData();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: userName,
      email: userEmail,
      password: userPassword,
      role: userRole,
      rollNo: userRollNo,
      employeeId: userEmployeeId,
      departmentId: userDeptId,
      batchId: userBatchId,
    };

    if (editingUser) {
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setShowUserModal(false);
    setEditingUser(null);
    loadAllData();
  };

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('STUDENT');
    setUserRollNo('');
    setUserEmployeeId('');
    setUserDeptId(departments[0]?.id || '');
    setUserBatchId('');
    setShowUserModal(true);
  };

  const openEditUserModal = (targetUser: any) => {
    setEditingUser(targetUser);
    setUserName(targetUser.name || '');
    setUserEmail(targetUser.email || '');
    setUserPassword('');
    setUserRole(targetUser.role || 'STUDENT');
    setUserRollNo(targetUser.rollNo || '');
    setUserEmployeeId(targetUser.employeeId || '');
    setUserDeptId(targetUser.department?.id || targetUser.departmentId || '');
    setUserBatchId(targetUser.batch?.id || targetUser.batchId || '');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    loadAllData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: subjCode || 'ML201',
        name: subjName || 'Machine Learning',
        departmentId: subjDeptId || departments[0]?.id,
        studyYearId: subjStudyYearId || departments[0]?.studyYears[0]?.id,
        rubricId: subjRubricId || null,
      }),
    });
    setSubjCode('');
    setSubjName('');
    setShowSubjectModal(false);
    loadAllData();
  };

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: allocSubjId || subjects[0]?.id,
        batchId: allocBatchId || allBatches[0]?.id,
        facultyId: allocFacultyId || facultyUsers[0]?.id,
      }),
    });
    setShowAllocationModal(false);
    loadAllData();
  };

  const handleDeleteAllocation = async (allocId: string) => {
    if (!confirm('Remove this faculty in charge allocation?')) return;
    await fetch(`/api/admin/allocations?id=${allocId}`, { method: 'DELETE' });
    loadAllData();
  };

  const handleCreateRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/rubrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: rubricTitle || 'Standard Practical Evaluation Rubric',
        maxMarks: parseFloat(rubricMaxMarks || '10'),
        criteria: rubricCriteria,
      }),
    });
    setRubricTitle('');
    setShowRubricModal(false);
    loadAllData();
  };

  const handleCreateTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        academicSessionId: ttSessionId || sessions[0]?.id,
        departmentId: ttDeptId || departments[0]?.id,
        studyYearId: ttStudyYearId || departments[0]?.studyYears[0]?.id,
        divisionId: ttDivId || departments[0]?.studyYears[0]?.divisions[0]?.id,
        batchId: ttBatchId || departments[0]?.studyYears[0]?.divisions[0]?.batches[0]?.id || allBatches[0]?.id,
        subjectId: ttSubjectId || subjects[0]?.id,
        facultyId: ttFacultyId || users.find((u) => u.role === 'FACULTY')?.id,
        dayOfWeek: ttDay,
        startTime: ttStart,
        endTime: ttEnd,
        roomNo: ttRoom,
      }),
    });
    setShowTimetableModal(false);
    loadAllData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center gap-4 text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Administration Portal...</span>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find((s) => s.isCurrent)?.yearRange || '2026-2027';

  // Helper arrays for drop-downs
  const allStudyYears = departments.flatMap((d) => d.studyYears || []);
  const allDivisions = allStudyYears.flatMap((sy) => sy.divisions || []);
  const allBatches = allDivisions.flatMap((div) => div.batches || []);
  const facultyUsers = users.filter((u) => u.role === 'FACULTY');
  const studentUsers = users.filter((u) => u.role === 'STUDENT');

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.rollNo && u.rollNo.toLowerCase().includes(q)) || (u.employeeId && u.employeeId.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar user={user} currentSession={currentSession} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Professional Executive Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" /> Institution Administration
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Academic Command Center
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Configure academic sessions, departmental hierarchies, course catalogs, faculty allocations, and timetable schedules.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Students</div>
                <div className="text-xl font-bold text-white mt-1">{studentUsers.length}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Faculty</div>
                <div className="text-xl font-bold text-white mt-1">{facultyUsers.length}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Courses</div>
                <div className="text-xl font-bold text-white mt-1">{subjects.length}</div>
              </div>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'hierarchy', label: 'Academic Structure', icon: Layers },
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'subjects', label: 'Course Catalog', icon: BookOpen },
              { id: 'allocations', label: 'Faculty Allocations', icon: UserCheck },
              { id: 'timetable', label: 'Timetable Slots', icon: Calendar },
              { id: 'rubrics', label: 'Evaluation Rubrics', icon: Sliders },
              { id: 'analytics', label: 'System Analytics', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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

        {/* TAB 1: ACADEMIC HIERARCHY */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" /> Academic & Departmental Structure
                </h2>
                <p className="text-xs text-slate-400">Configure Academic Sessions, Departments, Study Years, Divisions, and Batches.</p>
              </div>

              {/* SINGLE CONFIGURE ACADEMIC HIERARCHY BUTTON */}
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Settings2 className="w-4 h-4" /> Configure Academic Hierarchy
              </button>
            </div>

            {/* Department Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
              {departments.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No departments created yet. Click "Configure Academic Hierarchy" to set up your structure.
                </div>
              ) : (
                departments.map((dept) => {
                  const uniqueClassesMap = new Map<string, any>();
                  (dept.studyYears || []).forEach((sy: any) => {
                    if (!uniqueClassesMap.has(sy.name)) {
                      uniqueClassesMap.set(sy.name, sy);
                    } else {
                      const existing = uniqueClassesMap.get(sy.name);
                      const combinedDivs = [...(existing.divisions || []), ...(sy.divisions || [])];
                      uniqueClassesMap.set(sy.name, { ...existing, divisions: combinedDivs });
                    }
                  });
                  const uniqueClasses = Array.from(uniqueClassesMap.values());

                  return (
                    <div key={dept.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
                            {dept.code}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">{dept.name}</h3>
                            <p className="text-xs text-slate-400">Department Code: {dept.code}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                          {dept.subjects?.length || 0} Courses Configured
                        </span>
                      </div>

                      {/* Study Years Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {uniqueClasses.length === 0 ? (
                          <div className="p-4 text-xs text-slate-500 italic bg-slate-950 rounded-xl">
                            No study years configured for this department.
                          </div>
                        ) : (
                          uniqueClasses.map((sy: any) => (
                            <div key={sy.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-xs rounded-md">
                                  Class: {sy.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {sy.divisions?.length || 0} Divisions
                                </span>
                              </div>

                              <div className="space-y-3 pt-2">
                                {(sy.divisions || []).map((div: any) => (
                                  <div key={div.id} className="bg-slate-900 border border-slate-800/60 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                                      <span>{div.name}</span>
                                      <span className="text-[10px] text-slate-400">{div.batches?.length || 0} Batches</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      {(div.batches || []).map((batch: any) => (
                                        <span key={batch.id} className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-medium rounded-md">
                                          {batch.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" /> User Directory & Allocations
                </h2>
                <p className="text-xs text-slate-400">View, edit, or provision Students, Faculty, and Admin accounts.</p>
              </div>
              <button
                onClick={openCreateUserModal}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add New User
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, roll no, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {(['ALL', 'STUDENT', 'FACULTY', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      userRoleFilter === r
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">ID / Roll No</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Allocated Batch</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : u.role === 'FACULTY'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {u.rollNo || u.employeeId || '-'}
                          </td>
                          <td className="py-3.5 px-4">{u.department?.name || u.department?.code || '-'}</td>
                          <td className="py-3.5 px-4">
                            {u.batch ? (
                              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[11px] font-medium">
                                {u.batch.name} ({u.batch.division?.name || 'Div D'})
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Unallocated</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-all cursor-pointer"
                                title="Edit User Details & Allocations"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg transition-all cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        )}

        {/* TAB 3: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" /> Course Catalog
                </h2>
                <p className="text-xs text-slate-400">Manage institutional subjects and link evaluation rubrics.</p>
              </div>
              <button
                onClick={() => setShowSubjectModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Course
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold rounded-md">
                      {s.code}
                    </span>
                    <span className="text-[11px] text-slate-400">{s.department?.code}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{s.name}</h3>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Linked Rubric:</span>
                    <span className="font-semibold text-slate-200">{s.rubric?.title || 'Standard Rubric'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FACULTY ALLOCATIONS */}
        {activeTab === 'allocations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" /> Course & Faculty Allocations
                </h2>
                <p className="text-xs text-slate-400">Assign Faculty in Charge to specific Courses and Student Batches.</p>
              </div>
              <button
                onClick={() => setShowAllocationModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Allocate Faculty
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Course</th>
                      <th className="py-3.5 px-4">Allocated Batch</th>
                      <th className="py-3.5 px-4">Faculty in Charge</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {allocations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                          No faculty allocations created yet. Click "Allocate Faculty" to assign.
                        </td>
                      </tr>
                    ) : (
                      allocations.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{a.subject?.name}</div>
                            <div className="text-[11px] text-cyan-400 font-mono">{a.subject?.code}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-md">
                              {a.batch?.name} ({a.batch?.division?.name || 'Div D'})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">
                              {a.faculty?.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{a.faculty?.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteAllocation(a.id)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-xs font-semibold transition-all cursor-pointer"
                            >
                              Unallocate
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" /> Master Timetable Schedule
                </h2>
                <p className="text-xs text-slate-400">Schedule laboratory slots for Students and Faculty.</p>
              </div>

              <button
                onClick={() => setShowTimetableModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Timetable Slot
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Day</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Faculty</th>
                      <th className="py-3 px-4">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {timetableSlots.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                          No timetable slots created. Click "Add Timetable Slot" to schedule.
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
                          <td className="py-3 px-4">{slot.batch?.name}</td>
                          <td className="py-3 px-4">{slot.faculty?.name}</td>
                          <td className="py-3 px-4 text-emerald-400 font-medium">{slot.roomNo}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RUBRICS */}
        {activeTab === 'rubrics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" /> Evaluation Rubrics
                </h2>
                <p className="text-xs text-slate-400">Configure evaluation criteria and marks distribution per subject.</p>
              </div>

              <button
                onClick={() => setShowRubricModal(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Rubric
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rubrics.map((r) => {
                let criteria: any[] = [];
                try {
                  criteria = JSON.parse(r.criteriaJson);
                } catch {}
                return (
                  <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">{r.title}</h3>
                      <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold text-xs rounded-md">
                        Max Marks: {r.maxMarks}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {criteria.map((c: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl text-xs">
                          <span className="text-slate-300 font-medium">{c.category}</span>
                          <span className="font-semibold text-emerald-400">{c.marks} Marks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" /> Platform Analytics & Statistics
                </h2>
                <p className="text-xs text-slate-400">Institutional telemetry and usage overview.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Registered Users</div>
                <div className="text-2xl font-bold text-white">{analytics?.totalUsers || users.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Submissions</div>
                <div className="text-2xl font-bold text-cyan-400">{analytics?.totalSubmissions || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-md">
                <div className="text-xs font-semibold text-slate-400 uppercase">Active Sessions</div>
                <div className="text-2xl font-bold text-emerald-400">{analytics?.activeSessions || 0}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* UNIFIED CONFIGURE ACADEMIC HIERARCHY MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-400" /> Configure Academic Hierarchy
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
            </div>

            {/* Sub-tabs inside modal */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
              {[
                { id: 'session', label: '1. Session' },
                { id: 'department', label: '2. Department' },
                { id: 'class', label: '3. Class' },
                { id: 'division', label: '4. Division' },
                { id: 'batch', label: '5. Batch' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setConfigSubTab(st.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    configSubTab === st.id ? 'bg-cyan-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Sub-form 1: Session */}
            {configSubTab === 'session' && (
              <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Academic Session Year Range</label>
                  <input
                    type="text"
                    required
                    value={newSessionRange}
                    onChange={(e) => setNewSessionRange(e.target.value)}
                    placeholder="e.g. 2026-2027"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-md cursor-pointer">
                  Save Academic Session
                </button>
              </form>
            )}

            {/* Sub-form 2: Department */}
            {configSubTab === 'department' && (
              <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Department Code</label>
                  <input type="text" required value={newDeptCode} onChange={(e) => setNewDeptCode(e.target.value)} placeholder="CSE-DS" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department Name</label>
                  <input type="text" required value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="Computer Science & Engineering (Data Science)" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-md cursor-pointer">
                  Save Department
                </button>
              </form>
            )}

            {/* Sub-form 3: Class */}
            {configSubTab === 'class' && (
              <form onSubmit={handleCreateStudyYear} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Class / Study Year</label>
                  <select value={syName} onChange={(e) => setSyName(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100">
                    <option value="FY">FY (First Year)</option>
                    <option value="SY">SY (Second Year)</option>
                    <option value="TY">TY (Third Year)</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-md cursor-pointer">
                  Save Class
                </button>
              </form>
            )}

            {/* Sub-form 4: Division */}
            {configSubTab === 'division' && (
              <form onSubmit={handleCreateDivision} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Division Name</label>
                  <input type="text" required value={divName} onChange={(e) => setDivName(e.target.value)} placeholder="Division D" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-md cursor-pointer">
                  Save Division
                </button>
              </form>
            )}

            {/* Sub-form 5: Batch */}
            {configSubTab === 'batch' && (
              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Batch Name</label>
                  <input type="text" required value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="Batch 1" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-md cursor-pointer">
                  Save Batch
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE RUBRIC MODAL FORM */}
      {showRubricModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Create Evaluation Rubric</h3>
            <form onSubmit={handleCreateRubric} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Rubric Title</label>
                <input
                  type="text"
                  required
                  value={rubricTitle}
                  onChange={(e) => setRubricTitle(e.target.value)}
                  placeholder="e.g. Standard Practical Evaluation Rubric"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maximum Marks</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={rubricMaxMarks}
                  onChange={(e) => setRubricMaxMarks(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRubricModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Rubric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TIMETABLE SLOT MODAL FORM */}
      {showTimetableModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Add Timetable Slot</h3>
            <form onSubmit={handleCreateTimetableSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <select
                  value={ttSubjectId}
                  onChange={(e) => setTtSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Batch</label>
                <select
                  value={ttBatchId}
                  onChange={(e) => setTtBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.division?.name || 'Div D'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Faculty</label>
                <select
                  value={ttFacultyId}
                  onChange={(e) => setTtFacultyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {facultyUsers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Day</label>
                  <select
                    value={ttDay}
                    onChange={(e) => setTtDay(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="MONDAY">MONDAY</option>
                    <option value="TUESDAY">TUESDAY</option>
                    <option value="WEDNESDAY">WEDNESDAY</option>
                    <option value="THURSDAY">THURSDAY</option>
                    <option value="FRIDAY">FRIDAY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Start</label>
                  <input type="text" value={ttStart} onChange={(e) => setTtStart(e.target.value)} placeholder="09:00" className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">End</label>
                  <input type="text" value={ttEnd} onChange={(e) => setTtEnd(e.target.value)} placeholder="11:00" className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Room No</label>
                <input type="text" value={ttRoom} onChange={(e) => setTtRoom(e.target.value)} placeholder="Lab 302" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTimetableModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              {editingUser ? 'Edit User Details' : 'Add New User'}
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Prof. Ananya Sharma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g. faculty@docs.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="FACULTY">FACULTY</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {userRole === 'STUDENT' ? (
                  <div>
                    <label className="block text-slate-400 mb-1">Roll Number</label>
                    <input
                      type="text"
                      value={userRollNo}
                      onChange={(e) => setUserRollNo(e.target.value)}
                      placeholder="e.g. 21DS05"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={userEmployeeId}
                      onChange={(e) => setUserEmployeeId(e.target.value)}
                      placeholder="e.g. FAC-101"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <select
                  value={userDeptId}
                  onChange={(e) => setUserDeptId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {userRole === 'STUDENT' && (
                <div>
                  <label className="block text-slate-400 mb-1">Allocated Batch</label>
                  <select
                    value={userBatchId}
                    onChange={(e) => setUserBatchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                  >
                    <option value="">Select Batch</option>
                    {allBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.division?.name || 'Div D'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATION MODAL */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Allocate Faculty to Course Batch
            </h3>
            <form onSubmit={handleCreateAllocation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Course</label>
                <select
                  value={allocSubjId}
                  onChange={(e) => setAllocSubjId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Batch</label>
                <select
                  value={allocBatchId}
                  onChange={(e) => setAllocBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {allBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.division?.name || 'Div D'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Faculty in Charge</label>
                <select
                  value={allocFacultyId}
                  onChange={(e) => setAllocFacultyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                >
                  {facultyUsers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.employeeId || f.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Allocate Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Create Course</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  placeholder="e.g. ML201"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
