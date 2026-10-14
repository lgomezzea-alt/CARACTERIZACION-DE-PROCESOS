import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  FolderGit2, 
  Scale, 
  Compass, 
  Building2, 
  CheckCircle2, 
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Briefcase,
  Play,
  CheckCircle,
  HelpCircle,
  FileText,
  CornerDownRight,
  ListOrdered,
  Workflow,
  Eye,
  Info,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { ProcessCharacterization, ProcessActivity, DemingStage, JobPosition } from '../types/process';

interface Step4FlowchartProps {
  process: ProcessCharacterization;
  processes?: ProcessCharacterization[];
  jobPositions?: JobPosition[];
  onChange: (updated: Partial<ProcessCharacterization>) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenProcessMap?: () => void;
  onOpenJobManual?: () => void;
  viewMode?: 'swimlanes' | 'sequential';
  onViewModeChange?: (view: 'swimlanes' | 'sequential') => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
}

export const Step4Flowchart: React.FC<Step4FlowchartProps> = ({
  process,
  processes = [],
  jobPositions = [],
  onChange,
  onNext,
  onPrev,
  onOpenProcessMap,
  onOpenJobManual,
  viewMode,
  onViewModeChange,
  zoomLevel,
  onZoomChange
}) => {
  // Pestaña activa dentro del módulo 3: Aportar Procedimiento vs Flujograma Visual vs Vista Dividida
  const [activeTab, setActiveTab] = useState<'procedure' | 'flowchart' | 'split'>('split');
  const [internalView, setInternalView] = useState<'swimlanes' | 'sequential'>('swimlanes');
  const [internalZoom, setInternalZoom] = useState<number>(1);
  const [selectedActivity, setSelectedActivity] = useState<ProcessActivity | null>(null);
  const [showIntegrationsCard, setShowIntegrationsCard] = useState(true);

  // Formulario para agregar / editar paso del procedimiento actual
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepFormData, setStepFormData] = useState<{
    name: string;
    responsibleRole: string;
    stepType: 'operation' | 'decision' | 'document' | 'milestone';
    decisionCriteria: string;
    procedureDescription: string;
    stage: DemingStage;
  }>({
    name: '',
    responsibleRole: process.leaderRole || '',
    stepType: 'operation',
    decisionCriteria: '',
    procedureDescription: '',
    stage: 'Hacer'
  });

  const activeView = viewMode !== undefined ? viewMode : internalView;
  const activeZoom = zoomLevel !== undefined ? zoomLevel : internalZoom;

  const handleSetView = (view: 'swimlanes' | 'sequential') => {
    setInternalView(view);
    if (onViewModeChange) onViewModeChange(view);
  };

  const handleSetZoom = (valOrFn: number | ((prev: number) => number)) => {
    const nextVal = typeof valOrFn === 'function' ? valOrFn(activeZoom) : valOrFn;
    setInternalZoom(nextVal);
    if (onZoomChange) onZoomChange(nextVal);
  };

  const activities = process.activities || [];
  const norms = process.legalAndTechnicalNorms || [];

  // Proveedores y clientes interprocesos
  const firstActivitySupplier = activities[0]?.supplier || 'Procesos Proveedores del Mapa';
  const lastActivityCustomer = activities[activities.length - 1]?.customer || 'Procesos Clientes del Mapa';

  // Manejo de formulario de paso del procedimiento
  const handleOpenAddStep = () => {
    setEditingStepId(null);
    setStepFormData({
      name: '',
      responsibleRole: process.leaderRole || '',
      stepType: 'operation',
      decisionCriteria: '¿Cumple especificaciones técnicas y requisitos de calidad?',
      procedureDescription: '',
      stage: activities.length === 0 ? 'Planear' : 'Hacer'
    });
    setShowStepModal(true);
  };

  const handleOpenEditStep = (act: ProcessActivity) => {
    setEditingStepId(act.id);
    setStepFormData({
      name: act.name,
      responsibleRole: act.responsibleRole || process.leaderRole || '',
      stepType: act.stepType || 'operation',
      decisionCriteria: act.decisionCriteria || '',
      procedureDescription: act.procedureDescription || act.description || '',
      stage: act.stage
    });
    setShowStepModal(true);
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepFormData.name.trim()) return;

    if (editingStepId) {
      // Modificar paso existente
      const updated = activities.map((act) => {
        if (act.id === editingStepId) {
          return {
            ...act,
            name: stepFormData.name.trim(),
            responsibleRole: stepFormData.responsibleRole.trim() || process.leaderRole || 'Responsable',
            stepType: stepFormData.stepType,
            decisionCriteria: stepFormData.decisionCriteria.trim(),
            procedureDescription: stepFormData.procedureDescription.trim(),
            description: stepFormData.procedureDescription.trim() || act.description,
            stage: stepFormData.stage
          };
        }
        return act;
      });
      onChange({ activities: updated });
    } else {
      // Agregar nuevo paso al procedimiento
      const newAct: ProcessActivity = {
        id: `act-${Date.now()}`,
        number: activities.length + 1,
        stage: stepFormData.stage,
        name: stepFormData.name.trim(),
        description: stepFormData.procedureDescription.trim(),
        procedureDescription: stepFormData.procedureDescription.trim(),
        stepType: stepFormData.stepType,
        decisionCriteria: stepFormData.decisionCriteria.trim(),
        responsibleRole: stepFormData.responsibleRole.trim() || process.leaderRole || 'Responsable',
        supplier: 'Proceso Proveedor asignado',
        inputs: 'Insumos y especificaciones del procedimiento',
        outputs: 'Resultado o entregable del paso ejecutado',
        customer: 'Proceso Cliente o siguiente etapa'
      };
      onChange({ activities: [...activities, newAct] });
    }

    setShowStepModal(false);
  };

  const handleDeleteStep = (id: string) => {
    const updated = activities
      .filter((a) => a.id !== id)
      .map((a, idx) => ({ ...a, number: idx + 1 }));
    onChange({ activities: updated });
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const currIdx = activities.findIndex((a) => a.id === id);
    if (currIdx === -1) return;
    const targetIdx = direction === 'up' ? currIdx - 1 : currIdx + 1;
    if (targetIdx < 0 || targetIdx >= activities.length) return;

    const reordered = [...activities];
    const temp = reordered[currIdx];
    reordered[currIdx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const renumbered = reordered.map((a, idx) => ({ ...a, number: idx + 1 }));
    onChange({ activities: renumbered });
  };

  // Cargar plantilla típica del procedimiento según el proceso activo
  const handleLoadTypicalProcedure = () => {
    const procNameLower = process.name.toLowerCase();
    let templateSteps: Array<{
      name: string;
      role: string;
      type: 'operation' | 'decision' | 'document' | 'milestone';
      stage: DemingStage;
      decisionCriteria?: string;
      desc: string;
    }> = [];

    if (procNameLower.includes('compra') || procNameLower.includes('abastecim')) {
      templateSteps = [
        {
          name: 'Recepción y consolidación de la solicitud o requisición autorizada',
          role: 'Auxiliar de Compras',
          type: 'operation',
          stage: 'Planear',
          desc: 'El área requirente ingresa la requisición con especificaciones técnicas al software o formato oficial.'
        },
        {
          name: 'Verificación de presupuesto y búsqueda de proveedores en catálogo homologado',
          role: 'Jefe de Compras',
          type: 'decision',
          stage: 'Planear',
          decisionCriteria: '¿Cuenta con disponibilidad presupuestal aprobada?',
          desc: 'Se valida si el centro de costos tiene rubro disponible para ejecutar la compra solicitada.'
        },
        {
          name: 'Solicitud de cotizaciones y elaboración de cuadro comparativo de ofertas',
          role: 'Auxiliar de Compras',
          type: 'document',
          stage: 'Hacer',
          desc: 'Se contactan mínimo 3 proveedores calificados para remitir cotizaciones formales.'
        },
        {
          name: 'Adjudicación y emisión formal de la Orden de Compra o Contrato',
          role: 'Jefe de Compras',
          type: 'operation',
          stage: 'Hacer',
          desc: 'Se envía la orden de compra aprobada al proveedor con condiciones de entrega y pago.'
        },
        {
          name: 'Inspección técnica de recepción y verificación contra remisión y factura',
          role: 'Analista de Almacén',
          type: 'decision',
          stage: 'Verificar',
          decisionCriteria: '¿El producto o servicio cumple 100% las especificaciones y cantidades?',
          desc: 'Se realiza conteo, inspección de calidad física y verificación de empaques en bodega.'
        },
        {
          name: 'Ingreso al sistema de inventarios y entrega conforme al área solicitante',
          role: 'Analista de Almacén',
          type: 'operation',
          stage: 'Hacer',
          desc: 'Se registra la entrada de mercancía en el ERP y se hace entrega formal al usuario.'
        },
        {
          name: 'Evaluación periódica del desempeño de proveedores y gestión de mejoras',
          role: 'Jefe de Compras',
          type: 'operation',
          stage: 'Actuar',
          desc: 'Se tabulan los tiempos de entrega y calidad para retroalimentar el plan de abastecimiento.'
        }
      ];
    } else if (procNameLower.includes('producc') || procNameLower.includes('fabric') || procNameLower.includes('operac')) {
      templateSteps = [
        {
          name: 'Revisión del plan de operaciones y requerimientos de materia prima',
          role: 'Jefe de Planta / Operaciones',
          type: 'operation',
          stage: 'Planear',
          desc: 'Se verifica el cronograma de pedidos pendientes y los recursos disponibles en línea.'
        },
        {
          name: 'Alistamiento de maquinaria, calibración de equipos e insumos',
          role: 'Técnico de Mantenimiento / Operario',
          type: 'operation',
          stage: 'Planear',
          desc: 'Inspección previa al arranque de línea según hoja de seguridad.'
        },
        {
          name: 'Ejecución de la transformación, fabricación o ensamble operativo',
          role: 'Operarios de Producción',
          type: 'operation',
          stage: 'Hacer',
          desc: 'Procesamiento de los materiales siguiendo la ficha técnica y orden de producción.'
        },
        {
          name: 'Control de calidad en línea y verificación de tolerancias técnicas',
          role: 'Inspector de Calidad',
          type: 'decision',
          stage: 'Verificar',
          decisionCriteria: '¿Cumple los parámetros dimensionales y de calidad sin defectos mayores?',
          desc: 'Prueba de muestreo en puntos críticos de control de la operación.'
        },
        {
          name: 'Embalaje, rotulado de producto no conforme o liberación de lote',
          role: 'Inspector de Calidad / Despachos',
          type: 'document',
          stage: 'Hacer',
          desc: 'Firma de la etiqueta de conformidad y liberación al almacén de producto terminado.'
        },
        {
          name: 'Análisis de mermas, tiempos muertos y aplicación de acciones correctivas',
          role: 'Jefe de Planta / Operaciones',
          type: 'operation',
          stage: 'Actuar',
          desc: 'Reunión de balance operativo para optimizar la eficiencia y reducir desperdicios.'
        }
      ];
    } else {
      // Plantilla general para cualquier proceso de la empresa
      templateSteps = [
        {
          name: `Planificar y programar las actividades del período para ${process.name}`,
          role: process.leaderRole || 'Líder del Proceso',
          type: 'operation',
          stage: 'Planear',
          desc: 'Definición de objetivos, asignación de personal y cronograma de trabajo.'
        },
        {
          name: 'Recepción y validación de las solicitudes y requerimientos de entrada',
          role: process.leaderRole || 'Líder del Proceso',
          type: 'decision',
          stage: 'Planear',
          decisionCriteria: '¿La solicitud cuenta con toda la información y autorizaciones completas?',
          desc: 'Revisión de requisitos iniciales antes de iniciar la ejecución.'
        },
        {
          name: `Ejecutar las operaciones principales de ${process.productOrService || process.name}`,
          role: process.leaderRole || 'Equipo Operativo',
          type: 'operation',
          stage: 'Hacer',
          desc: 'Realización de las actividades técnicas siguiendo los instructivos vigentes.'
        },
        {
          name: 'Generar los registros, informes o evidencias del servicio entregado',
          role: 'Responsable Operativo',
          type: 'document',
          stage: 'Hacer',
          desc: 'Diligenciamiento de los formatos de soporte y archivo documental.'
        },
        {
          name: 'Verificar el cumplimiento de indicadores de oportunidad y calidad',
          role: process.leaderRole || 'Líder del Proceso',
          type: 'decision',
          stage: 'Verificar',
          decisionCriteria: '¿El resultado cumple con las metas y criterios de aceptación acordados?',
          desc: 'Medición de satisfacción del cliente interno o externo y cálculo de KPIs.'
        },
        {
          name: 'Implementar mejoras continuas y actualizar procedimientos operativos',
          role: process.leaderRole || 'Comité de Calidad',
          type: 'operation',
          stage: 'Actuar',
          desc: 'Estandarización de lecciones aprendidas y cierre de oportunidades de mejora.'
        }
      ];
    }

    const currentActs = [...activities];
    const newActivities: ProcessActivity[] = templateSteps.map((st, idx) => ({
      id: `act-${Date.now()}-${idx + 1}`,
      number: currentActs.length + idx + 1,
      stage: st.stage,
      name: st.name,
      description: st.desc,
      procedureDescription: st.desc,
      stepType: st.type,
      decisionCriteria: st.decisionCriteria || '',
      responsibleRole: st.role,
      supplier: 'Proceso Proveedor asignado',
      inputs: 'Insumos requeridos para el paso',
      outputs: 'Entregable o resultado del procedimiento',
      customer: 'Proceso Cliente del mapa'
    }));

    onChange({
      activities: [...currentActs, ...newActivities],
      currentProcedureSummary: process.currentProcedureSummary || `El procedimiento de ${process.name} en nuestra empresa se realiza mediante una secuencia estructurada de etapas donde intervienen los responsables designados, asegurando controles en puntos clave de decisión antes de la entrega final.`
    });
  };

  // Importar funciones del cargo líder como pasos del procedimiento
  const handleImportJobResponsibilities = () => {
    const leaderJob = jobPositions.find(
      (j) =>
        j.title.toLowerCase() === process.leaderRole?.toLowerCase() ||
        j.associatedProcessName?.toLowerCase() === process.name.toLowerCase()
    );

    if (!leaderJob || !leaderJob.responsibilities || leaderJob.responsibilities.length === 0) {
      return;
    }

    const currentActs = [...activities];
    const stagesOrder: DemingStage[] = ['Planear', 'Hacer', 'Verificar', 'Actuar'];
    const newActs: ProcessActivity[] = [];

    leaderJob.responsibilities.forEach((resp, idx) => {
      if (!currentActs.some((a) => a.name.toLowerCase() === resp.toLowerCase())) {
        const stage = stagesOrder[idx % stagesOrder.length];
        newActs.push({
          id: `act-${Date.now()}-${idx + 1}`,
          number: currentActs.length + newActs.length + 1,
          stage,
          name: resp,
          description: `Función ejecutada por el cargo ${leaderJob.title} en el procedimiento operativo.`,
          procedureDescription: `Función del cargo ${leaderJob.title} en la práctica actual de la empresa.`,
          stepType: resp.toLowerCase().includes('verific') || resp.toLowerCase().includes('control') || resp.toLowerCase().includes('evalu') ? 'decision' : 'operation',
          decisionCriteria: resp.toLowerCase().includes('verific') ? '¿Conforme a parámetros de calidad?' : '',
          supplier: leaderJob.department || 'Área solicitante',
          inputs: 'Requisitos de la función',
          outputs: 'Resultado de la gestión',
          customer: 'Partes interesadas',
          responsibleRole: leaderJob.title
        });
      }
    });

    if (newActs.length > 0) {
      onChange({ activities: [...currentActs, ...newActs] });
    }
  };

  const planActivities = activities.filter((a) => a.stage === 'Planear');
  const doActivities = activities.filter((a) => a.stage === 'Hacer');
  const checkActivities = activities.filter((a) => a.stage === 'Verificar');
  const actActivities = activities.filter((a) => a.stage === 'Actuar');

  const stageColors: Record<DemingStage, { bg: string; border: string; text: string; header: string; lightBg: string }> = {
    Planear: {
      bg: 'bg-orange-600',
      border: 'border-orange-300',
      text: 'text-orange-900',
      header: 'bg-orange-100 text-orange-800 border-orange-300',
      lightBg: 'bg-orange-50/60'
    },
    Hacer: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      header: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      lightBg: 'bg-emerald-50/60'
    },
    Verificar: {
      bg: 'bg-amber-600',
      border: 'border-amber-300',
      text: 'text-amber-900',
      header: 'bg-amber-100 text-amber-800 border-amber-300',
      lightBg: 'bg-amber-50/60'
    },
    Actuar: {
      bg: 'bg-purple-600',
      border: 'border-purple-300',
      text: 'text-purple-900',
      header: 'bg-purple-100 text-purple-800 border-purple-300',
      lightBg: 'bg-purple-50/60'
    }
  };

  const stepTypeLabels: Record<string, { label: string; icon: string; badge: string }> = {
    operation: { label: 'Operación / Tarea', icon: '⚙️', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    decision: { label: 'Decisión / Control', icon: '🔶', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    document: { label: 'Registro / Documento', icon: '📄', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
    milestone: { label: 'Hito / Entrega', icon: '🏁', badge: 'bg-purple-100 text-purple-800 border-purple-200' }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Guidance Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Módulo 3 de 6 • Flujograma & Procedimiento Actual
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {activities.length} pasos documentados
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Flujograma y Conocimiento del Procedimiento Actual de la Empresa
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              En este módulo aportas tu conocimiento de cómo la empresa ejecuta actualmente este proceso en el día a día. Modela los pasos secuenciales, los cargos responsables que intervienen y los puntos críticos de decisión. El flujograma se genera dinámicamente con tu aporte. En el <strong>Módulo 4 "Mapeo"</strong> se terminarán de aportar las demás entradas requeridas para construir técnicamente el proceso.
            </p>
          </div>

          {/* Tab Mode Switcher: Procedimiento vs Flujograma vs Dividida */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20 shrink-0">
            <button
              onClick={() => setActiveTab('procedure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'procedure' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
              title="Aportar el procedimiento paso a paso que realiza la empresa"
            >
              <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aportar Procedimiento</span>
            </button>
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'flowchart' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
              title="Ver el diagrama visual del flujograma"
            >
              <GitFork className="w-3.5 h-3.5 text-teal-600" />
              <span>Flujograma</span>
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 hidden lg:flex ${
                activeTab === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
              title="Ver pasos y diagrama lado a lado"
            >
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>Vista Integral</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL: CONOCIMIENTO DEL PROCEDIMIENTO ACTUAL QUE REALIZA LA EMPRESA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shadow-2xs">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Conocimiento del Procedimiento Real de la Empresa</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Práctica Operativa Actual
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Describe cómo opera tu empresa en la práctica y estructura la secuencia cronológica de tareas y controles.
              </p>
            </div>
          </div>

          {/* Botones de acción para alimentar el procedimiento */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadTypicalProcedure}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-bold transition shadow-2xs"
              title="Cargar pasos base típicos del procedimiento para editarlos con la realidad de tu empresa"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Cargar Procedimiento Típico</span>
            </button>

            {jobPositions.length > 0 && (
              <button
                type="button"
                onClick={handleImportJobResponsibilities}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition"
                title="Traer las funciones del manual de cargos como pasos de este procedimiento"
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                <span>Importar de Cargos</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddStep}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar Paso al Procedimiento</span>
            </button>
          </div>
        </div>

        {/* Resumen narrativo del procedimiento actual */}
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Descripción de cómo realiza actualmente la empresa este procedimiento:</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Aporte de conocimiento del usuario
            </span>
          </div>
          <textarea
            value={process.currentProcedureSummary || ''}
            onChange={(e) => onChange({ currentProcedureSummary: e.target.value })}
            placeholder="Ejemplo: Actualmente, cuando un cliente o área requirente solicita este servicio/bien, el procedimiento inicia con... Intervienen los roles de... Se realizan validaciones de calidad en... y finaliza con la entrega conforme..."
            rows={2}
            className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: PROCEDIMIENTO PASO A PASO Y / O FLUJOGRAMA */}
      <div className={`grid gap-6 ${activeTab === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* COLUMNA O VISTA: LISTA DE PASOS DEL PROCEDIMIENTO ACTUAL (IZQUIERDA EN SPLIT) */}
        {(activeTab === 'procedure' || activeTab === 'split') && (
          <div className={`space-y-4 ${activeTab === 'split' ? 'lg:col-span-5' : 'w-full'}`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Secuencia del Procedimiento ({activities.length} pasos)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddStep}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo paso</span>
                </button>
              </div>

              {activities.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
                  <Workflow className="w-10 h-10 mx-auto text-slate-400" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Aún no has registrado pasos del procedimiento</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Aporta el conocimiento de cómo se hace este proceso en tu empresa, o haz clic en "Cargar Procedimiento Típico" para iniciar rápidamente.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLoadTypicalProcedure}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      Cargar Ejemplo Base
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddStep}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      + Escribir Paso 1
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {activities.map((act, idx) => {
                    const stepTypeInfo = stepTypeLabels[act.stepType || 'operation'];
                    const isSelected = selectedActivity?.id === act.id;

                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivity(act)}
                        className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                        }`}
                      >
                        {/* Cabecera del paso */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-extrabold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${stepTypeInfo.badge}`}>
                              {stepTypeInfo.icon} {stepTypeInfo.label}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${stageColors[act.stage].header}`}>
                              {act.stage}
                            </span>
                          </div>

                          {/* Botones de acción del paso */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(act.id, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Subir en la secuencia"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(act.id, 'down')}
                              disabled={idx === activities.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Bajar en la secuencia"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditStep(act)}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                              title="Editar este paso"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStep(act.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Eliminar paso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nombre del paso */}
                        <p className="font-bold text-slate-900 leading-snug">
                          {act.name}
                        </p>

                        {/* Si es decisión, mostrar criterio */}
                        {act.stepType === 'decision' && act.decisionCriteria && (
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                            <span className="font-bold shrink-0">🔶 Criterio:</span>
                            <span>{act.decisionCriteria}</span>
                          </div>
                        )}

                        {/* Descripción operativa de la empresa */}
                        {act.procedureDescription && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {act.procedureDescription}
                          </p>
                        )}

                        {/* Rol responsable */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            <strong>Ejecuta:</strong> {act.responsibleRole}
                          </span>
                          <span className="text-emerald-700 font-semibold text-[10px]">
                            Módulo 4: Aportar Entradas →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* COLUMNA O VISTA: DIAGRAMA DE FLUJO INTERACTIVO (DERECHA EN SPLIT) */}
        {(activeTab === 'flowchart' || activeTab === 'split') && (
          <div className={`space-y-4 ${activeTab === 'split' ? 'lg:col-span-7' : 'w-full'}`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              
              {/* Barra de herramientas del diagrama */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Flujograma Generado:
                  </span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => handleSetView('swimlanes')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                        activeView === 'swimlanes' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Carriles PHVA</span>
                    </button>
                    <button
                      onClick={() => handleSetView('sequential')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                        activeView === 'sequential' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <GitFork className="w-3 h-3" />
                      <span>Secuencia</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSetZoom((prev: number) => Math.max(0.7, prev - 0.1))}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    title="Reducir zoom"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-slate-500 text-[11px] w-10 text-center">
                    {Math.round(activeZoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleSetZoom((prev: number) => Math.min(1.4, prev + 0.1))}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    title="Aumentar zoom"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSetZoom(1)}
                    className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                    title="Restablecer zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Leyenda ISO */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700">Simbología:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> Inicio/Fin
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Operación
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 transform rotate-45 bg-amber-500"></span> Decisión / Control
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Formato / Registro
                </span>
              </div>

              {/* Contenedor del Diagrama */}
              <div 
                className="overflow-x-auto p-4 bg-slate-50/70 rounded-xl border border-slate-200 min-h-[440px] flex flex-col justify-center transition-all"
                style={{ transform: `scale(${activeZoom})`, transformOrigin: 'top center' }}
              >
                {activities.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 space-y-2">
                    <GitFork className="w-10 h-10 mx-auto opacity-30" />
                    <p className="font-semibold text-xs">No hay actividades para graficar en el diagrama.</p>
                    <p className="text-[11px]">Aporta los pasos del procedimiento en el panel izquierdo para ver el flujograma.</p>
                  </div>
                ) : activeView === 'swimlanes' ? (
                  /* Vista de Carriles PHVA */
                  <div className="space-y-6 min-w-[700px]">
                    
                    {/* Inicio con Aporte del Mapa */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
                      <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-sm border border-slate-950 flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-current text-orange-400" />
                        <span>INICIO: {process.scopeStart || 'Detonante del procedimiento'}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-medium">
                        <span className="text-emerald-700 font-bold">Proveedor:</span> {firstActivitySupplier}
                      </div>
                    </div>

                    {/* 4 Carriles */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      
                      {/* Carril PLANEAR */}
                      <div className="bg-white rounded-xl border-2 border-orange-300 p-2.5 shadow-2xs space-y-2 flex flex-col">
                        <div className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-900 font-extrabold text-xs flex items-center justify-between border border-orange-200">
                          <span>1. PLANEAR</span>
                          <span className="text-[10px] bg-orange-200 px-1.5 py-0.2 rounded-full font-bold">{planActivities.length}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {planActivities.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => setSelectedActivity(act)}
                              className={`p-2 rounded-lg border transition cursor-pointer text-xs ${
                                selectedActivity?.id === act.id
                                  ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20'
                                  : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[10px] mb-0.5">
                                <span className="text-orange-700">Paso #{act.number}</span>
                                <span className="text-slate-400 truncate max-w-[85px]">{act.responsibleRole}</span>
                              </div>
                              <p className="font-semibold text-slate-900 leading-snug text-[11px]">{act.name}</p>
                              {act.stepType === 'decision' && (
                                <div className="mt-1 p-1 bg-amber-50 rounded text-[9px] text-amber-800 border border-amber-200">
                                  🔶 {act.decisionCriteria || 'Control de calidad'}
                                </div>
                              )}
                            </div>
                          ))}
                          {planActivities.length === 0 && (
                            <div className="p-3 text-center text-[10px] text-slate-400 italic bg-slate-50 rounded">
                              Sin pasos en Planear
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Carril HACER */}
                      <div className="bg-white rounded-xl border-2 border-emerald-300 p-2.5 shadow-2xs space-y-2 flex flex-col">
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center justify-between border border-emerald-200">
                          <span>2. HACER</span>
                          <span className="text-[10px] bg-emerald-200 px-1.5 py-0.2 rounded-full font-bold">{doActivities.length}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {doActivities.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => setSelectedActivity(act)}
                              className={`p-2 rounded-lg border transition cursor-pointer text-xs ${
                                selectedActivity?.id === act.id
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                                  : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[10px] mb-0.5">
                                <span className="text-emerald-700">Paso #{act.number}</span>
                                <span className="text-slate-400 truncate max-w-[85px]">{act.responsibleRole}</span>
                              </div>
                              <p className="font-semibold text-slate-900 leading-snug text-[11px]">{act.name}</p>
                              {act.stepType === 'decision' && (
                                <div className="mt-1 p-1 bg-amber-50 rounded text-[9px] text-amber-800 border border-amber-200">
                                  🔶 {act.decisionCriteria || 'Control de calidad'}
                                </div>
                              )}
                            </div>
                          ))}
                          {doActivities.length === 0 && (
                            <div className="p-3 text-center text-[10px] text-slate-400 italic bg-slate-50 rounded">
                              Sin pasos en Hacer
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Carril VERIFICAR */}
                      <div className="bg-white rounded-xl border-2 border-amber-300 p-2.5 shadow-2xs space-y-2 flex flex-col">
                        <div className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-between border border-amber-200">
                          <span>3. VERIFICAR</span>
                          <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded-full font-bold">{checkActivities.length}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {checkActivities.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => setSelectedActivity(act)}
                              className={`p-2 rounded-lg border transition cursor-pointer text-xs ${
                                selectedActivity?.id === act.id
                                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                                  : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[10px] mb-0.5">
                                <span className="text-amber-700">Paso #{act.number}</span>
                                <span className="text-slate-400 truncate max-w-[85px]">{act.responsibleRole}</span>
                              </div>
                              <p className="font-semibold text-slate-900 leading-snug text-[11px]">{act.name}</p>
                              <div className="mt-1 p-1 bg-amber-100 rounded text-[9px] text-amber-900 font-bold border border-amber-300">
                                🔶 {act.decisionCriteria || '¿Cumple especificación?'}
                              </div>
                            </div>
                          ))}
                          {checkActivities.length === 0 && (
                            <div className="p-3 text-center text-[10px] text-slate-400 italic bg-slate-50 rounded">
                              Sin pasos en Verificar
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Carril ACTUAR */}
                      <div className="bg-white rounded-xl border-2 border-purple-300 p-2.5 shadow-2xs space-y-2 flex flex-col">
                        <div className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-between border border-purple-200">
                          <span>4. ACTUAR</span>
                          <span className="text-[10px] bg-purple-200 px-1.5 py-0.2 rounded-full font-bold">{actActivities.length}</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          {actActivities.map((act) => (
                            <div
                              key={act.id}
                              onClick={() => setSelectedActivity(act)}
                              className={`p-2 rounded-lg border transition cursor-pointer text-xs ${
                                selectedActivity?.id === act.id
                                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                                  : 'bg-slate-50 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[10px] mb-0.5">
                                <span className="text-purple-700">Paso #{act.number}</span>
                                <span className="text-slate-400 truncate max-w-[85px]">{act.responsibleRole}</span>
                              </div>
                              <p className="font-semibold text-slate-900 leading-snug text-[11px]">{act.name}</p>
                            </div>
                          ))}
                          {actActivities.length === 0 && (
                            <div className="p-3 text-center text-[10px] text-slate-400 italic bg-slate-50 rounded">
                              Sin pasos en Actuar
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Fin */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 justify-center pt-2">
                      <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-sm border border-slate-950 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-orange-400" />
                        <span>FIN: {process.scopeEnd || 'Producto o servicio entregado conforme'}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-medium">
                        <span className="text-orange-700 font-bold">Cliente:</span> {lastActivityCustomer}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Vista de Secuencia Continua */
                  <div className="max-w-md mx-auto space-y-3 py-2 w-full">
                    <div className="text-center">
                      <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800 text-white font-bold text-xs">
                        INICIO: {process.scopeStart || 'Detonante del proceso'}
                      </div>
                    </div>

                    {activities.map((act, idx) => (
                      <div key={act.id} className="space-y-2">
                        <div className="flex justify-center">
                          <div className="w-0.5 h-4 bg-slate-300"></div>
                        </div>

                        <div
                          onClick={() => setSelectedActivity(act)}
                          className={`p-3 rounded-xl border-2 transition cursor-pointer text-xs ${
                            selectedActivity?.id === act.id
                              ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-slate-200 bg-white hover:border-emerald-400 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-slate-800 text-[11px]">
                              Paso #{act.number} • {act.responsibleRole}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${stageColors[act.stage].header}`}>
                              {act.stage}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-xs">{act.name}</p>
                          {act.stepType === 'decision' && (
                            <div className="mt-1.5 p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900 font-semibold">
                              🔶 Criterio: {act.decisionCriteria || 'Validación de conformidad'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center">
                      <div className="w-0.5 h-4 bg-slate-300"></div>
                    </div>

                    <div className="text-center">
                      <div className="inline-block px-3.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs">
                        FIN: {process.scopeEnd || 'Entregable final conforme'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detalle del paso seleccionado */}
              {selectedActivity && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Paso Seleccionado #{selectedActivity.number}: {selectedActivity.name}
                    </span>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="text-emerald-700 hover:text-emerald-950 font-bold text-[11px]"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 text-[11px] pt-1">
                    <div><strong>Responsable:</strong> {selectedActivity.responsibleRole}</div>
                    <div><strong>Tipo de paso:</strong> {stepTypeLabels[selectedActivity.stepType || 'operation'].label}</div>
                    <div><strong>Fase PHVA:</strong> {selectedActivity.stage}</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* MODAL: AGREGAR O EDITAR PASO DEL PROCEDIMIENTO DE LA EMPRESA */}
      {showStepModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Workflow className="w-4 h-4 text-emerald-700" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {editingStepId ? 'Editar Paso del Procedimiento' : 'Aportar Nuevo Paso del Procedimiento'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStepModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="space-y-3.5 text-xs">
              
              {/* Nombre de la tarea / paso */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  ¿Qué se hace en este paso? (Nombre de la actividad o tarea) *
                </label>
                <input
                  type="text"
                  required
                  value={stepFormData.name}
                  onChange={(e) => setStepFormData({ ...stepFormData, name: e.target.value })}
                  placeholder="Ej: Recepción técnica e inspección de mercancías en almacén"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Responsable del cargo */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  ¿Quién realiza este paso en la empresa? (Cargo Responsable) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={stepFormData.responsibleRole}
                    onChange={(e) => setStepFormData({ ...stepFormData, responsibleRole: e.target.value })}
                    placeholder="Ej: Jefe de Compras / Analista de Almacén"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  {jobPositions.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) setStepFormData({ ...stepFormData, responsibleRole: e.target.value });
                      }}
                      className="text-xs p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="">Seleccionar cargo...</option>
                      {jobPositions.map((j) => (
                        <option key={j.id} value={j.title}>{j.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Tipo de paso en el flujograma */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipo de Paso (Símbolo):</label>
                  <select
                    value={stepFormData.stepType}
                    onChange={(e) => setStepFormData({ ...stepFormData, stepType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="operation">⚙️ Operación / Tarea estándar</option>
                    <option value="decision">🔶 Punto de Decisión / Validación</option>
                    <option value="document">📄 Registro / Documento</option>
                    <option value="milestone">🏁 Hito / Entrega</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fase PHVA de inicio:</label>
                  <select
                    value={stepFormData.stage}
                    onChange={(e) => setStepFormData({ ...stepFormData, stage: e.target.value as DemingStage })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Planear">Planear (P)</option>
                    <option value="Hacer">Hacer (H)</option>
                    <option value="Verificar">Verificar (V)</option>
                    <option value="Actuar">Actuar (A)</option>
                  </select>
                </div>
              </div>

              {/* Si es decisión, criterio */}
              {stepFormData.stepType === 'decision' && (
                <div className="space-y-1 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="font-bold text-amber-900 flex items-center gap-1">
                    <span>🔶 Criterio de Decisión / Control:</span>
                  </label>
                  <input
                    type="text"
                    value={stepFormData.decisionCriteria}
                    onChange={(e) => setStepFormData({ ...stepFormData, decisionCriteria: e.target.value })}
                    placeholder="Ej: ¿Cumple especificaciones y cantidades de la orden?"
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-medium text-xs"
                  />
                  <p className="text-[10px] text-amber-700">
                    Si cumple, el flujo continúa; si no cumple, se genera reproceso o contingencia.
                  </p>
                </div>
              )}

              {/* Cómo se realiza en la empresa */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  ¿Cómo realiza la empresa este paso en la práctica? (Detalle operativo):
                </label>
                <textarea
                  rows={2}
                  value={stepFormData.procedureDescription}
                  onChange={(e) => setStepFormData({ ...stepFormData, procedureDescription: e.target.value })}
                  placeholder="Detalla las instrucciones de trabajo, herramientas usadas o consideraciones especiales..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStepModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition"
                >
                  {editingStepId ? 'Guardar Cambios' : 'Añadir al Procedimiento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BANNER DE VINCULACIÓN AL MÓDULO 4: MAPEO */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-orange-50 p-4 rounded-2xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 text-white rounded-xl shadow-2xs">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-teal-950 text-xs">
              Siguiente paso metodológico: Módulo 4 • Mapeo del Proceso
            </h4>
            <p className="text-slate-600 text-[11px]">
              Una vez aportado el procedimiento de la empresa, en el Módulo 4 se terminarán de aportar las demás entradas requeridas (proveedores, insumos, normativas, salidas y clientes SIPOC) para la construcción del proceso.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 active:scale-95"
        >
          <span>Continuar a Mapeo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Botones de Navegación Inferior */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Normas y Recursos (Paso 2)</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition active:scale-95"
        >
          <span>Continuar a Mapeo del Proceso (Paso 4)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
