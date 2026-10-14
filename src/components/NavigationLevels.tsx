import React from 'react';
import { 
  Building2, 
  Layers, 
  Plus, 
  Copy, 
  Printer, 
  HelpCircle, 
  FolderGit2, 
  FileText, 
  Cpu, 
  Workflow, 
  GitFork, 
  Gauge, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Scale,
  Briefcase,
  FileSpreadsheet,
  Upload,
  PenTool,
  Save,
  LogOut,
  Clock,
  HardDrive,
  Smartphone,
  Laptop,
  FileDown
} from 'lucide-react';
import { OrgContext, ProcessCharacterization, ProcessCategory, DemingStage } from '../types/process';

export interface NavigationLevelsProps {
  // Nivel 1 Props
  orgContext: OrgContext;
  processes: ProcessCharacterization[];
  activeProcess: ProcessCharacterization;
  onSelectProcess: (id: string) => void;
  onNewProcess: () => void;
  onDuplicateProcess: () => void;
  onImportJSON?: (file: File) => void;
  onOpenOrgModal: () => void;
  onOpenProcessMap: () => void;
  onOpenAssistantHelp: () => void;
  onOpenJobManual: () => void;
  jobPositionsCount?: number;
  onPrintPreview?: () => void;
  onSaveProgress?: () => void;
  onRequestExit?: () => void;
  onOpenSaveLocalModal?: () => void;
  onDownloadLocalBackup?: () => void;
  onOpenInstallModal?: () => void;
  onGenerateProgressPDF?: () => void;
  isGeneratingPDF?: boolean;
  hasUnsavedChanges?: boolean;
  lastSavedTime?: string | null;
  isSaving?: boolean;

  // Nivel 2 Props
  currentStep: number;
  onSelectStep: (step: number) => void;
  totalSteps: number;
  demingCounts: Record<DemingStage, number>;
  isDemingComplete: boolean;

  // Nivel 3 Props (Contextual helpers according to active step)
  onStep4AddActivity?: () => void;
  onStep4QuickStage?: (stage: DemingStage) => void;
  onStep5AddControl?: () => void;
  onStep5AddIndicator?: () => void;
  onStep5GenerateControls?: () => void;
  onStep2AddNorms?: () => void;
  onStep1SuggestObjective?: (type: string) => void;
  onStep6ToggleSignatures?: () => void;
  isSignaturesDrawerOpen?: boolean;
  onStep6ExportJSON?: () => void;
  onStep6ExportCSV?: () => void;
  flowchartView?: 'swimlanes' | 'sequential';
  onToggleFlowchartView?: (view: 'swimlanes' | 'sequential') => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
}

export const NavigationLevels: React.FC<NavigationLevelsProps> = ({
  orgContext,
  processes,
  activeProcess,
  onSelectProcess,
  onNewProcess,
  onDuplicateProcess,
  onImportJSON,
  onOpenOrgModal,
  onOpenProcessMap,
  onOpenAssistantHelp,
  onOpenJobManual,
  jobPositionsCount,
  onPrintPreview,
  onSaveProgress,
  onRequestExit,
  onOpenSaveLocalModal,
  onDownloadLocalBackup,
  onOpenInstallModal,
  onGenerateProgressPDF,
  isGeneratingPDF = false,
  hasUnsavedChanges = false,
  lastSavedTime,
  isSaving = false,
  currentStep,
  onSelectStep,
  totalSteps,
  demingCounts,
  isDemingComplete,
  onStep4AddActivity,
  onStep4QuickStage,
  onStep5AddControl,
  onStep5AddIndicator,
  onStep5GenerateControls,
  onStep2AddNorms,
  onStep1SuggestObjective,
  onStep6ToggleSignatures,
  isSignaturesDrawerOpen = false,
  onStep6ExportJSON,
  onStep6ExportCSV,
  flowchartView = 'swimlanes',
  onToggleFlowchartView,
  zoomLevel = 1,
  onZoomChange
}) => {
  const stepsMeta = [
    { num: 1, title: 'Identificación', desc: 'Alimentado por contextos', icon: <FileText className="w-4 h-4" /> },
    { num: 2, title: 'Normas y Recursos', desc: 'Orientado por categoría', icon: <Cpu className="w-4 h-4" /> },
    { num: 3, title: 'Flujograma', desc: 'Procedimiento de la empresa', icon: <GitFork className="w-4 h-4" /> },
    { num: 4, title: 'Mapeo', desc: 'Aporte de entradas y PHVA', icon: <Workflow className="w-4 h-4" /> },
    { num: 5, title: 'Control y KPIs', desc: 'Controles de actividades', icon: <Gauge className="w-4 h-4" /> },
    { num: 6, title: 'Ficha Oficial', desc: 'Consolidación final ISO', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200 print:hidden select-none">
      
      {/* ========================================================= */}
      {/* NIVEL 1: GESTIÓN EMPRESARIAL, PROCESO ACTIVO Y UTILIDADES */}
      {/* ========================================================= */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Lado Izquierdo: Identidad de Empresa y Acciones Globales */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Identidad de Empresa (Click para ver/editar contexto organizacional) */}
            <button
              onClick={onOpenOrgModal}
              title="Click para ver o editar Contexto Organizacional (Misión, Visión, Políticas)"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden shadow-xs ring-1 ring-emerald-400/30">
                {orgContext.logoUrl ? (
                  <img src={orgContext.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="min-w-0 max-w-[210px] sm:max-w-xs">
                <div className="flex items-center gap-1.5">
                  <span className="block font-bold text-xs text-white truncate leading-tight group-hover:text-emerald-300 transition">
                    {orgContext.name || 'Mi Organización'}
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
                    Editar
                  </span>
                </div>
                <span className="block text-[10px] text-emerald-300 font-mono leading-none mt-0.5">
                  NIT: {orgContext.nit || 'Sin NIT'}
                </span>
              </div>
            </button>

            {/* Separador vertical */}
            <div className="hidden sm:block h-5 w-px bg-slate-700"></div>

            {/* Botones de Nivel 1: Manual de Funciones, Mapa, Asistente */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenJobManual}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Manual de Funciones y Perfiles del Cargo (Alimenta el Mapa de Procesos)"
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                <span>Manual de Funciones {jobPositionsCount ? `(${jobPositionsCount})` : ''}</span>
              </button>

              <button
                onClick={onOpenProcessMap}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Ver mapa general de todos los procesos"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Mapa Procesos ({processes.length})</span>
              </button>

              <button
                onClick={onOpenAssistantHelp}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                title="Guía Metodológica ISO 9001 y Plantillas Maestras"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Guía & Plantillas</span>
              </button>
            </div>
          </div>

          {/* Lado Derecho: Selector de Proceso Activo y Acciones de Proceso */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
            
            {/* Selector de Proceso */}
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider font-semibold text-slate-400 leading-none">
                  Proceso:
                </span>
                <select
                  value={activeProcess.id}
                  onChange={(e) => onSelectProcess(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
                >
                  {processes.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      [{p.code || 'S/C'}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Acciones de Proceso: Nuevo y Duplicar */}
            <button
              onClick={onNewProcess}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition"
              title="Crear nueva caracterización de proceso en blanco"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>

            <button
              onClick={onDuplicateProcess}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Duplicar proceso actual como plantilla"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Duplicar</span>
            </button>

            {/* Importar Archivo JSON o PDF */}
            {onImportJSON && (
              <label
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                title="Cargar y restaurar caracterización desde archivo PDF o JSON"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Importar</span>
                <input
                  type="file"
                  accept=".json,.pdf,application/pdf,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onImportJSON(file);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            )}

            {/* Acceso Directo e Instalación en PC y Celular */}
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/70 transition shadow-2xs"
                title="Crear acceso directo o instalar aplicación en el escritorio de tu PC y celular"
              >
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden md:inline">Acceso Directo</span>
              </button>
            )}

            {/* Separador vertical */}
            <div className="hidden sm:block h-5 w-px bg-slate-700"></div>

            {/* Botón Guardar Avances directamente en PC y Celular (Nivel 1) */}
            {onSaveProgress && (
              <button
                type="button"
                onClick={onSaveProgress}
                disabled={isSaving}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                  hasUnsavedChanges
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title={
                  hasUnsavedChanges
                    ? 'Hay cambios pendientes: Click para guardar y descargar respaldo en PC / Celular'
                    : lastSavedTime
                    ? `Avances guardados en PC y Celular (Último: ${lastSavedTime})`
                    : 'Guardar todos los avances directamente en este Computador o Celular'
                }
              >
                <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Guardando en PC/Móvil...' : 'Guardar Avances'}</span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                )}
              </button>
            )}

            {/* Botón Generar Avances en PDF (Nivel 1 - Reimportable con textos y gráficos) */}
            {onGenerateProgressPDF && (
              <button
                type="button"
                onClick={onGenerateProgressPDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-700 hover:bg-orange-600 text-white shadow-xs border border-orange-600 hover:border-orange-500 transition"
                title="Generar y descargar documento PDF completo con todos los avances (textos, gráficos y diagramas). Este mismo archivo PDF puede ser reimportado en la plataforma para continuar la caracterización y terminar la ficha."
              >
                <FileDown className={`w-3.5 h-3.5 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPDF ? 'Generando PDF...' : 'Avances en PDF'}</span>
                <span className="text-[10px] bg-orange-950/70 text-orange-200 px-1.5 py-0.2 rounded font-mono hidden xl:inline">
                  Reimportable
                </span>
              </button>
            )}

            {/* Botón Salir con alerta de resguardo (Nivel 1) */}
            {onRequestExit && (
              <button
                onClick={onRequestExit}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-red-950 hover:text-red-200 text-slate-300 border border-slate-700 hover:border-red-800 transition"
                title="Cerrar sesión o salir de la plataforma con verificación de guardado"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* NIVEL 2: ETAPAS DE LA CARACTERIZACIÓN (PASO 1 AL PASO 6)  */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          
          {/* Pestañas de Pasos 1 a 6 con diseño anti-solapamiento */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 w-full md:w-auto flex-1">
            {stepsMeta.map((st) => {
              const isActive = currentStep === st.num;
              const isPast = currentStep > st.num;

              return (
                <button
                  key={st.num}
                  onClick={() => onSelectStep(st.num)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition border text-xs font-semibold ${
                    isActive
                      ? 'bg-white border-emerald-600 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                      : isPast
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : isPast
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : st.num}
                  </div>

                  <div className="min-w-0">
                    <span className="block truncate text-xs font-bold leading-tight">
                      {st.title}
                    </span>
                    <span className="hidden lg:block truncate text-[10px] text-slate-400 leading-tight">
                      {st.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Estado de Salud PHVA */}
          <div className="hidden xl:flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shrink-0 text-xs">
            <span className="font-bold text-slate-600 text-[11px]">Ciclo Deming:</span>
            <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10px] ${demingCounts.Planear > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-400'}`}>
              P: {demingCounts.Planear}
            </span>
            <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10px] ${demingCounts.Hacer > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
              H: {demingCounts.Hacer}
            </span>
            <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10px] ${demingCounts.Verificar > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
              V: {demingCounts.Verificar}
            </span>
            <span className={`px-1.5 py-0.5 rounded font-extrabold text-[10px] ${demingCounts.Actuar > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-400'}`}>
              A: {demingCounts.Actuar}
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* NIVEL 3: BARRA DE ACCIONES CONTEXTUALES DEL PASO Y NAVEGACIÓN */}
      {/* ========================================================= */}
      <div className="bg-white px-4 sm:px-6 py-2 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          
          {/* Identificador del Paso Actual */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="font-bold text-slate-800 text-xs truncate">
              {stepsMeta[currentStep - 1]?.title}: {stepsMeta[currentStep - 1]?.desc}
            </span>
          </div>

          {/* Botonería Contextual del Paso Actual (Nivel 3 - Herramientas Rápidas) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Si está en Paso 1: Sugerencias de Objetivos */}
            {currentStep === 1 && onStep1SuggestObjective && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] font-semibold hidden md:inline">Sugerir objetivo:</span>
                <button
                  type="button"
                  onClick={() => onStep1SuggestObjective('calidad')}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold transition"
                >
                  + Calidad
                </button>
                <button
                  type="button"
                  onClick={() => onStep1SuggestObjective('eficiencia')}
                  className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-semibold transition"
                >
                  + Productividad
                </button>
                <button
                  type="button"
                  onClick={() => onStep1SuggestObjective('servicio')}
                  className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-semibold transition"
                >
                  + Servicio
                </button>
              </div>
            )}

            {/* Si está en Paso 2: Normas estándar */}
            {currentStep === 2 && onStep2AddNorms && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={onStep2AddNorms}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sugerir Normas ISO y SST</span>
                </button>
              </div>
            )}

            {/* Si está en Paso 3: Flujograma (Vistas y Zoom) */}
            {currentStep === 3 && onToggleFlowchartView && onZoomChange && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => onToggleFlowchartView('swimlanes')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      flowchartView === 'swimlanes' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Carriles PHVA
                  </button>
                  <button
                    onClick={() => onToggleFlowchartView('sequential')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      flowchartView === 'sequential' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    Secuencia
                  </button>
                </div>

                <button
                  onClick={() => onZoomChange(Math.max(0.7, zoomLevel - 0.1))}
                  className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
                  title="Reducir zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onZoomChange(Math.min(1.4, zoomLevel + 0.1))}
                  className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Si está en Paso 4: Mapeo PHVA (Nueva actividad y accesos rápidos PHVA) */}
            {currentStep === 4 && (
              <div className="flex items-center gap-1.5 text-xs">
                {onStep4AddActivity && (
                  <button
                    type="button"
                    onClick={onStep4AddActivity}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Actividad</span>
                  </button>
                )}

                {onStep4QuickStage && (
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">Rápido:</span>
                    <button
                      type="button"
                      onClick={() => onStep4QuickStage('Planear')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 hover:bg-orange-200 transition"
                      title="Agregar actividad para Planear"
                    >
                      +P
                    </button>
                    <button
                      type="button"
                      onClick={() => onStep4QuickStage('Hacer')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                      title="Agregar actividad para Hacer"
                    >
                      +H
                    </button>
                    <button
                      type="button"
                      onClick={() => onStep4QuickStage('Verificar')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                      title="Agregar actividad para Verificar"
                    >
                      +V
                    </button>
                    <button
                      type="button"
                      onClick={() => onStep4QuickStage('Actuar')}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                      title="Agregar actividad para Actuar"
                    >
                      +A
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Si está en Paso 5: Controles e Indicadores */}
            {currentStep === 5 && (
              <div className="flex items-center gap-1.5 text-xs">
                {onStep5GenerateControls && (
                  <button
                    type="button"
                    onClick={onStep5GenerateControls}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-bold transition shadow-2xs"
                    title="Generar controles de calidad automáticamente basados en las actividades del Mapeo PHVA"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Autogenerar desde PHVA</span>
                  </button>
                )}
                {onStep5AddControl && (
                  <button
                    type="button"
                    onClick={onStep5AddControl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Control</span>
                  </button>
                )}
                {onStep5AddIndicator && (
                  <button
                    type="button"
                    onClick={onStep5AddIndicator}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Indicador</span>
                  </button>
                )}
              </div>
            )}

            {/* Si está en Paso 6: Exportaciones y Firmas */}
            {currentStep === 6 && (
              <div className="flex items-center gap-1.5 text-xs">
                {onStep6ToggleSignatures && (
                  <button
                    type="button"
                    onClick={onStep6ToggleSignatures}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      isSignaturesDrawerOpen
                        ? 'bg-amber-100 text-amber-900 border-amber-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isSignaturesDrawerOpen ? 'Cerrar Firmas' : 'Firmas'}</span>
                  </button>
                )}
                {onStep6ExportJSON && (
                  <button
                    type="button"
                    onClick={onStep6ExportJSON}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition"
                  >
                    Descargar JSON
                  </button>
                )}
                {onStep6ExportCSV && (
                  <button
                    type="button"
                    onClick={onStep6ExportCSV}
                    className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-300 rounded-lg text-[11px] font-semibold transition flex items-center gap-1"
                    title="Exportar tablas SIPOC y controles a Excel / CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
                    <span>Excel / CSV</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.print();
                    } else if (onPrintPreview) {
                      onPrintPreview();
                    }
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                  title="Imprimir o descargar en PDF la Ficha Oficial del Proceso"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ficha</span>
                </button>
              </div>
            )}

            {/* Separador de Navegación */}
            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

            {/* Botones de Navegación Anterior / Siguiente (Nivel 3) */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                disabled={currentStep === 1}
                onClick={() => onSelectStep(Math.max(1, currentStep - 1))}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <button
                disabled={currentStep === totalSteps}
                onClick={() => onSelectStep(Math.min(totalSteps, currentStep + 1))}
                className="inline-flex items-center gap-1 px-3.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
