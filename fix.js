const fs = require('fs');
let content = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');

// 1. Session Dropdown
content = content.replace(
  /<input\s+type="text"\s+required\s+value=\{newSessionRange\}\s+onChange=\{\(e\) => setNewSessionRange\(e\.target\.value\)\}\s+placeholder="e\.g\. 2026-2027"\s+className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"\s*\/>/g,
  '<select required value={newSessionRange} onChange={(e) => setNewSessionRange(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"><option value="" disabled>Select Year Range</option><option value="2021-2022">2021-2022</option><option value="2022-2023">2022-2023</option><option value="2023-2024">2023-2024</option><option value="2024-2025">2024-2025</option><option value="2025-2026">2025-2026</option><option value="2026-2027">2026-2027</option><option value="2027-2028">2027-2028</option><option value="2028-2029">2028-2029</option><option value="2029-2030">2029-2030</option></select>'
);

// 2. State
content = content.replace(
  /const \[editingUser, setEditingUser\] = useState<any>\(null\);/,
  'const [editingUser, setEditingUser] = useState<any>(null);\n  const [editingHierarchy, setEditingHierarchy] = useState<{type: string, entity: any} | null>(null);'
);

// 3. handleEditEntity
content = content.replace(
  /const handleEditEntity = async \([^]*?loadAllData\(\);\n  \};/,
  const handleEditEntity = (type: string, entity: any) => { setEditingHierarchy({ type, entity }); };

  const handleSaveHierarchy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHierarchy) return;
    const { type, entity } = editingHierarchy;
    const payload: any = { id: entity.id, name: entity.name };
    if (type === 'departments') payload.code = entity.code;
    if (type === 'study-years') { payload.academicSessionId = entity.academicSessionId; payload.departmentId = entity.departmentId; }
    if (type === 'divisions') { payload.studyYearId = entity.studyYearId; }
    if (type === 'batches') { payload.divisionId = entity.divisionId; }
    await fetch(\/api/admin/\\, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setEditingHierarchy(null);
    loadAllData();
  };
);

// 4. Modal
content = content.replace(
  /\{\/\* UNIFIED CONFIGURE ACADEMIC HIERARCHY MODAL \*\/\}/,
  {/* EDIT HIERARCHY MODAL */}
        {editingHierarchy && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
                Edit {editingHierarchy.type.replace('-', ' ')}
              </h3>
              <form onSubmit={handleSaveHierarchy} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-500 mb-1">Name</label>
                  <input type="text" required value={editingHierarchy.entity.name} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, name: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                {editingHierarchy.type === 'departments' && (
                  <div>
                    <label className="block text-gray-500 mb-1">Code</label>
                    <input type="text" required value={editingHierarchy.entity.code} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, code: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl" />
                  </div>
                )}
                {editingHierarchy.type === 'study-years' && (
                  <>
                    <div>
                      <label className="block text-gray-500 mb-1">Academic Session</label>
                      <select value={editingHierarchy.entity.academicSessionId} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, academicSessionId: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.yearRange}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Department</label>
                      <select value={editingHierarchy.entity.departmentId} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, departmentId: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                        {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {editingHierarchy.type === 'divisions' && (
                  <div>
                    <label className="block text-gray-500 mb-1">Study Year</label>
                    <select value={editingHierarchy.entity.studyYearId} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, studyYearId: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {departments.flatMap((d: any) => d.studyYears || []).map((sy: any) => <option key={sy.id} value={sy.id}>{sy.name} ({sy.department?.code || ''})</option>)}
                    </select>
                  </div>
                )}
                {editingHierarchy.type === 'batches' && (
                  <div>
                    <label className="block text-gray-500 mb-1">Division</label>
                    <select value={editingHierarchy.entity.divisionId} onChange={(e) => setEditingHierarchy({...editingHierarchy, entity: {...editingHierarchy.entity, divisionId: e.target.value}})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {departments.flatMap((d: any) => d.studyYears || []).flatMap((sy: any) => sy.divisions || []).map((div: any) => <option key={div.id} value={div.id}>{div.name} ({div.studyYear?.name || ''})</option>)}
                    </select>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setEditingHierarchy(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-gray-900 font-bold rounded-xl cursor-pointer">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* UNIFIED CONFIGURE ACADEMIC HIERARCHY MODAL */}
);

fs.writeFileSync('src/app/admin/dashboard/page.tsx', content);
