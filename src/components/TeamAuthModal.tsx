import React, { useState } from 'react';
import { 
  Users, 
  KeyRound, 
  ShieldCheck, 
  PlusCircle, 
  LogIn, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Briefcase, 
  Copy, 
  Check, 
  LogOut, 
  X,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  FolderGit2
} from 'lucide-react';
import { WorkGroup, WorkGroupSession, GroupMember } from '../types/process';

interface TeamAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  workGroups: WorkGroup[];
  activeSession: WorkGroupSession | null;
  onLoginSuccess: (session: WorkGroupSession) => void;
  onLogoutSession: () => void;
  onCreateGroup: (newGroup: Omit<WorkGroup, 'id' | 'createdAt' | 'lastAccessAt'>) => WorkGroup;
  onDeleteGroup?: (groupId: string) => void;
  onAddMemberToGroup?: (groupId: string, member: Omit<GroupMember, 'id'>) => void;
}

export const TeamAuthModal: React.FC<TeamAuthModalProps> = ({
  isOpen,
  onClose,
  workGroups,
  activeSession,
  onLoginSuccess,
  onLogoutSession,
  onCreateGroup,
  onDeleteGroup,
  onAddMemberToGroup
}) => {
  // Tabs: 'login' | 'create_team' | 'team_info'
  const [activeTab, setActiveTab] = useState<'login' | 'create_team' | 'team_info'>(
    activeSession ? 'team_info' : 'login'
  );

  // Login form state
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    if (activeSession) return activeSession.groupId;
    return workGroups[0]?.id || '';
  });
  const [enteredKey, setEnteredKey] = useState('');
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Create team form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamKey, setNewTeamKey] = useState('');
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newInitialMembers, setNewInitialMembers] = useState<string>('');
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // New member quick add
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Colaborador / Operativo');

  if (!isOpen) return null;

  const currentSelectedGroup = workGroups.find(g => g.id === selectedGroupId) || workGroups[0];
  const loggedInGroup = activeSession ? workGroups.find(g => g.id === activeSession.groupId) : null;

  // Handle Team Login / Access Validation
  const handleValidateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!currentSelectedGroup) {
      setLoginError('Por favor selecciona o crea un equipo de trabajo primero.');
      return;
    }

    const cleanInputKey = enteredKey.trim();
    const targetKey = currentSelectedGroup.accessKey.trim();

    // Validar clave de acceso (case-sensitive o case-insensitive si es alfanumérico)
    if (cleanInputKey.toUpperCase() !== targetKey.toUpperCase()) {
      setLoginError('La clave de acceso ingresada es incorrecta para este equipo de trabajo.');
      return;
    }

    const memberName = selectedMemberName.trim() || currentSelectedGroup.leaderName || 'Miembro del Equipo';
    const foundMember = currentSelectedGroup.members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
    const memberRole = foundMember ? foundMember.role : 'Líder / Colaborador';

    const session: WorkGroupSession = {
      groupId: currentSelectedGroup.id,
      groupName: currentSelectedGroup.name,
      authenticatedMemberName: memberName,
      authenticatedMemberRole: memberRole,
      authenticatedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    onLoginSuccess(session);
    setEnteredKey('');
    setActiveTab('team_info');
  };

  // Generate Suggested Secure Key
  const handleGenerateKeySuggestion = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    code += '-';
    for (let i = 0; i < 4; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    setNewTeamKey(code);
  };

  // Handle Create New Team
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamKey.trim()) return;

    const parsedMembers: GroupMember[] = [];
    if (newLeaderName.trim()) {
      parsedMembers.push({
        id: `mem-${Date.now()}-1`,
        name: newLeaderName.trim(),
        role: 'Líder de Equipo / Proceso'
      });
    }

    if (newInitialMembers.trim()) {
      const splitNames = newInitialMembers.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
      splitNames.forEach((n, idx) => {
        parsedMembers.push({
          id: `mem-${Date.now()}-${idx + 2}`,
          name: n,
          role: 'Colaborador / Operativo'
        });
      });
    }

    const created = onCreateGroup({
      name: newTeamName.trim(),
      accessKey: newTeamKey.trim(),
      leaderName: newLeaderName.trim() || 'Coordinador del Equipo',
      department: newDepartment.trim() || 'Operaciones y Calidad',
      description: newDescription.trim() || 'Equipo de trabajo para la caracterización de procesos ISO 9001',
      members: parsedMembers.length > 0 ? parsedMembers : [
        { id: `mem-${Date.now()}`, name: newLeaderName.trim() || 'Líder de Proceso', role: 'Líder / Responsable' }
      ]
    });

    // Auto-login con el nuevo equipo
    const session: WorkGroupSession = {
      groupId: created.id,
      groupName: created.name,
      authenticatedMemberName: created.leaderName,
      authenticatedMemberRole: 'Líder de Equipo',
      authenticatedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    onLoginSuccess(session);

    setSelectedGroupId(created.id);
    setCreateSuccessMsg(`¡Equipo "${created.name}" creado y validado con éxito!`);
    setTimeout(() => {
      setCreateSuccessMsg(null);
      setActiveTab('team_info');
    }, 1500);

    // Reset fields
    setNewTeamName('');
    setNewTeamKey('');
    setNewLeaderName('');
    setNewDepartment('');
    setNewDescription('');
    setNewInitialMembers('');
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Add Member to Current Logged Group
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInGroup || !newMemberName.trim() || !onAddMemberToGroup) return;

    onAddMemberToGroup(loggedInGroup.id, {
      name: newMemberName.trim(),
      role: newMemberRole.trim() || 'Colaborador'
    });
    setNewMemberName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Encabezado Institucional Verde / Naranja */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  Acceso y Validación de Equipos de Trabajo
                </h2>
                {activeSession ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Validado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    Ingreso Requerido
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Genera tu clave de equipo, valida tu ingreso y colabora en grupo en la caracterización ISO 9001.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validar Ingreso con Clave</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('create_team')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'create_team'
                  ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Generar Nuevo Equipo & Clave</span>
            </button>

            {activeSession && (
              <button
                type="button"
                onClick={() => setActiveTab('team_info')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'team_info'
                    ? 'bg-white text-teal-900 shadow-xs border border-teal-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Equipo Activo ({activeSession.groupName})</span>
              </button>
            )}
          </div>

          {activeSession && (
            <button
              type="button"
              onClick={onLogoutSession}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
              title="Cerrar sesión de equipo actual"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Desconectar</span>
            </button>
          )}
        </div>

        {/* Contenido según Pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* ==================================================== */}
          {/* TAB 1: VALIDAR INGRESO CON CLAVE DE EQUIPO           */}
          {/* ==================================================== */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              
              {activeSession && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Actualmente estás validado en el equipo <strong>«{activeSession.groupName}»</strong> como <em>{activeSession.authenticatedMemberName}</em>.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('team_info')}
                    className="font-bold text-emerald-700 hover:underline shrink-0 ml-2"
                  >
                    Ver Grupo →
                  </button>
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-orange-600" />
                  <span>Validación de Acceso para Equipos de Trabajo</span>
                </div>

                <form onSubmit={handleValidateLogin} className="space-y-4">
                  {/* Selector de Equipo */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      1. Selecciona tu Equipo de Trabajo: *
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => {
                        setSelectedGroupId(e.target.value);
                        setLoginError(null);
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {workGroups.map((grp) => (
                        <option key={grp.id} value={grp.id}>
                          👥 {grp.name} ({grp.department || 'Sin área'} • Líder: {grp.leaderName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo de Clave de Acceso */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        2. Clave de Acceso del Equipo: *
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Ej: <code>CALIDAD2026</code> o <code>EQUIPO9001</code>
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={enteredKey}
                        onChange={(e) => {
                          setEnteredKey(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="Ingresa la clave de acceso de tu equipo..."
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Identificación del Miembro dentro del Grupo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        3. Tu Nombre / Integrante que Ingresa:
                      </label>
                      <input
                        type="text"
                        value={selectedMemberName}
                        onChange={(e) => setSelectedMemberName(e.target.value)}
                        placeholder={`Ej: ${currentSelectedGroup?.leaderName || 'Líder / Integrante'}`}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-500">
                        Integrantes Registrados en este Grupo:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) setSelectedMemberName(e.target.value);
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600"
                      >
                        <option value="">-- O selecciona un integrante --</option>
                        {currentSelectedGroup?.members.map(m => (
                          <option key={m.id} value={m.name}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mensaje de Error */}
                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Botón de Validación */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      ¿Aún no tienen clave? Puedes{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('create_team')}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        crear un equipo nuevo aquí
                      </button>
                      .
                    </span>

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Validar e Ingresar como Grupo</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista Rápida de Equipos Disponibles en este Espacio */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-emerald-600" />
                    Equipos de Trabajo Disponibles ({workGroups.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create_team')}
                    className="text-orange-600 hover:text-orange-700 text-[11px] font-bold"
                  >
                    + Nuevo Equipo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {workGroups.map(grp => (
                    <div
                      key={grp.id}
                      onClick={() => {
                        setSelectedGroupId(grp.id);
                        setLoginError(null);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                        selectedGroupId === grp.id
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 hover:bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {grp.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {grp.department || 'Área no asignada'} • {grp.members.length} miembros
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Líder: {grp.leaderName}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600 shrink-0">
                        {grp.accessKey ? '••••••' : 'Sin clave'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: GENERAR NUEVO EQUIPO Y CLAVE DE ACCESO        */}
          {/* ==================================================== */}
          {activeTab === 'create_team' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-950 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Crea tu Grupo de Trabajo y Genera tu Clave Segura</span>
                </div>
                <p className="text-xs text-orange-900/80 leading-relaxed">
                  Define el nombre de tu equipo, su departamento y genera una clave de acceso única para que los integrantes del grupo puedan validarse y colaborar en la caracterización de sus procesos.
                </p>
              </div>

              {createSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{createSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Nombre del Equipo de Trabajo: *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Ej: Equipo Misional de Producción / Comité de Calidad Zona Norte"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Campo de Clave de Acceso con Generador */}
                  <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-orange-600" />
                        <span>Clave de Acceso del Equipo: *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateKeySuggestion}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Generar Clave Aleatoria</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={newTeamKey}
                        onChange={(e) => setNewTeamKey(e.target.value)}
                        placeholder="Ej: PRODUCCION-2026 o clave generada..."
                        className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-wider text-slate-900 focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateKeySuggestion}
                        className="px-3.5 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-xl text-xs font-bold transition shrink-0"
                      >
                        Generar
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Esta clave será la que compartirás con los integrantes del grupo para ingresar y trabajar juntos.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Líder / Coordinador del Equipo: *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLeaderName}
                      onChange={(e) => setNewLeaderName(e.target.value)}
                      placeholder="Ej: Ing. Carlos Pérez / Coordinadora de Operaciones"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Área o Dependencia:
                    </label>
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="Ej: Gerencia de Operaciones / Aseguramiento de Calidad"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Integrantes Iniciales del Grupo (Separados por coma o renglón):
                    </label>
                    <textarea
                      rows={2}
                      value={newInitialMembers}
                      onChange={(e) => setNewInitialMembers(e.target.value)}
                      placeholder="Ej: Ana María Gómez, Pedro Ramírez, Luisa Martínez..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Propósito u Objetivo del Grupo:
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Ej: Caracterización y estandarización del proceso misional de atención al cliente"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Volver a Validación
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Guardar y Validar Equipo</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: INFORMACIÓN Y GESTIÓN DEL EQUIPO ACTIVO      */}
          {/* ==================================================== */}
          {activeTab === 'team_info' && loggedInGroup && activeSession && (
            <div className="space-y-4">
              {/* Tarjeta de Sesión Activa */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200">
                        Equipo Actualmente Validado
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">
                      {loggedInGroup.name}
                    </h3>
                  </div>

                  {/* Clave de Acceso con Copiar */}
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-emerald-500/30">
                    <div className="text-left">
                      <span className="block text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">
                        Clave de Acceso:
                      </span>
                      <span className="font-mono font-bold text-xs text-white">
                        {loggedInGroup.accessKey}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(loggedInGroup.accessKey)}
                      className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs transition"
                      title="Copiar clave de acceso para compartir con tu equipo"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-orange-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <span className="block text-[10px] text-emerald-300 font-medium">Integrante activo:</span>
                    <span className="font-bold text-white truncate block">
                      {activeSession.authenticatedMemberName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-300 font-medium">Rol en el equipo:</span>
                    <span className="font-bold text-white truncate block">
                      {activeSession.authenticatedMemberRole}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-300 font-medium">Área:</span>
                    <span className="font-bold text-white truncate block">
                      {loggedInGroup.department || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-300 font-medium">Validado a las:</span>
                    <span className="font-bold text-white font-mono">
                      {activeSession.authenticatedAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Miembros del Equipo */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Integrantes del Grupo ({loggedInGroup.members.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Líder: <strong>{loggedInGroup.leaderName}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loggedInGroup.members.map(member => {
                    const isCurrent = member.name.toLowerCase() === activeSession.authenticatedMemberName.toLowerCase();
                    return (
                      <div
                        key={member.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate leading-tight">{member.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate leading-tight">{member.role}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 shrink-0 font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Formulario Rápido para Añadir Integrante */}
                {onAddMemberToGroup && (
                  <form onSubmit={handleAddMember} className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Nombre del nuevo integrante..."
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="Rol o Cargo..."
                      className="sm:w-44 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shrink-0 flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Acciones de Cierre y Continuar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onLogoutSession}
                  className="px-4 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión del Equipo</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Continuar Trabajando en Grupo
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
