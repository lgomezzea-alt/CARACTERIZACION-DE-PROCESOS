import React, { useState } from 'react';
import { 
  Workflow, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Edit2,
  Copy,
  Info,
  Briefcase,
  FolderGit2,
  Scale,
  Compass,
  Building2,
  Check,
  Download,
  ListPlus,
  Package,
  Layers,
  FileText,
  HelpCircle,
  ShieldCheck,
  Lightbulb
} from 'lucide-react';
import { ProcessCharacterization, ProcessActivity, DemingStage, JobPosition, OrgContext } from '../types/process';
import { DEMING_GUIDES } from '../data/templates';

interface Step3DemingSIPOCProps {
  process: ProcessCharacterization;
  processes?: ProcessCharacterization[];
  jobPositions?: JobPosition[];
  orgContext?: OrgContext;
  onChange: (updated: Partial<ProcessCharacterization>) => void;
  onNext: () => void;
  onPrev: () => void;
  onOpenProcessMap?: () => void;
  onOpenJobManual?: () => void;
}

export const Step3DemingSIPOC: React.FC<Step3DemingSIPOCProps> = ({
  process,
  processes = [],
  jobPositions = [],
  orgContext,
  onChange,
  onNext,
  onPrev,
  onOpenProcessMap,
  onOpenJobManual
}) => {
  const [selectedStageFilter, setSelectedStageFilter] = useState<'All' | DemingStage>('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [showGlobalInputsPanel, setShowGlobalInputsPanel] = useState(true);
  const [showConvergenceCard, setShowConvergenceCard] = useState(true);

  // New activity / input mapping form state
  const [formData, setFormData] = useState<Partial<ProcessActivity>>({
    stage: 'Planear',
    name: '',
    supplier: '',
    inputs: '',
    outputs: '',
    customer: '',
    responsibleRole: process.leaderRole || ''
  });

  const activities = process.activities || [];
  const norms = process.legalAndTechnicalNorms || [];
  const globalInputs = process.globalInputs || [];

  // Diagnóstico de completitud de entradas
  const activitiesWithInputs = activities.filter(
    (a) => a.inputs && a.inputs.trim() !== '' && a.supplier && a.supplier.trim() !== ''
  );
  const inputsCompletionPercentage = activities.length > 0 
    ? Math.round((activitiesWithInputs.length / activities.length) * 100) 
    : 0;

  // Sugerir y autocompletar entradas y proveedores estándar para los pasos del procedimiento
  const handleAutocompleteStandardInputs = () => {
    const updated = activities.map((act) => {
      let sup = act.supplier;
      let inp = act.inputs;
      let out = act.outputs;
      let cust = act.customer;

      const actLower = act.name.toLowerCase();

      // Si falta proveedor o entrada, asignar según la fase PHVA y contexto
      if (!sup || sup === 'Proceso Proveedor asignado' || sup.includes('soporte')) {
        if (act.stage === 'Planear') {
          sup = 'Dirección Estratégica / Proceso Requirente';
        } else if (act.stage === 'Hacer') {
          sup = 'Procesos de Soporte / Almacén / Proveedores';
        } else if (act.stage === 'Verificar') {
          sup = 'Equipo Operativo del Proceso';
        } else if (act.stage === 'Actuar') {
          sup = 'Comité de Calidad / Auditorías Internas';
        }
      }

      if (!inp || inp === 'Insumos y especificaciones del procedimiento' || inp === 'Insumos requeridos para el paso' || inp.trim() === '') {
        if (act.stage === 'Planear') {
          inp = 'Directrices institucionales, necesidades del cliente y presupuesto autorizado';
        } else if (act.stage === 'Hacer') {
          if (actLower.includes('compra') || actLower.includes('cotiz')) {
            inp = 'Requisición de compras autorizada, cuadro de ofertas y especificaciones técnicas';
          } else if (actLower.includes('producc') || actLower.includes('fabric')) {
            inp = 'Orden de producción, materia prima verificada y ficha técnica de manufactura';
          } else {
            inp = 'Plan operativo aprobado, recursos asignados y requerimientos autorizados';
          }
        } else if (act.stage === 'Verificar') {
          inp = 'Registros de ejecución, productos generados y criterios de aceptación técnica';
        } else if (act.stage === 'Actuar') {
          inp = 'Informe de desviaciones, resultados de auditorías y oportunidades de mejora';
        }
      }

      if (!out || out === 'Resultado o entregable del paso ejecutado' || out === 'Entregable o resultado del procedimiento' || out.trim() === '') {
        if (act.stage === 'Planear') {
          out = 'Plan operativo y cronograma de actividades aprobado';
        } else if (act.stage === 'Hacer') {
          out = 'Producto o servicio elaborado conforme a especificaciones';
        } else if (act.stage === 'Verificar') {
          out = 'Informe de control de calidad, KPIs calculados y acta de conformidad';
        } else if (act.stage === 'Actuar') {
          out = 'Procedimiento actualizado y planes de acción de mejora cerrados';
        }
      }

      if (!cust || cust === 'Proceso Cliente o siguiente etapa' || cust === 'Proceso Cliente del mapa' || cust.trim() === '') {
        if (act.stage === 'Planear') {
          cust = 'Líder del Proceso y Equipo Ejecutor';
        } else if (act.stage === 'Hacer') {
          cust = 'Área usuaria / Cliente final / Almacén';
        } else if (act.stage === 'Verificar') {
          cust = 'Comité de Calidad / Alta Dirección';
        } else if (act.stage === 'Actuar') {
          cust = 'Todos los procesos de la organización';
        }
      }

      return {
        ...act,
        supplier: sup,
        inputs: inp,
        outputs: out,
        customer: cust
      };
    });

    // Asegurar entradas globales del proceso si están vacías
    let newGlobalInputs = [...globalInputs];
    if (newGlobalInputs.length === 0) {
      newGlobalInputs = [
        'Requisitos y necesidades de clientes internos y externos',
        'Directrices estratégicas y políticas institucionales de calidad',
        'Presupuesto y recursos autorizados por la Dirección',
        'Normas técnicas y requisitos legales aplicables'
      ];
    }

    onChange({
      activities: updated,
      globalInputs: newGlobalInputs
    });
  };

  // Manejo de entradas globales
  const handleAddGlobalInput = (text: string) => {
    if (!text.trim()) return;
    const current = process.globalInputs || [];
    if (!current.includes(text.trim())) {
      onChange({ globalInputs: [...current, text.trim()] });
    }
  };

  const handleRemoveGlobalInput = (index: number) => {
    const current = [...(process.globalInputs || [])];
    current.splice(index, 1);
    onChange({ globalInputs: current });
  };

  // Guardar actividad en la matriz SIPOC
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingActivityId) {
      // Modificar existente
      const updated = activities.map((act) =>
        act.id === editingActivityId
          ? {
              ...act,
              stage: formData.stage || 'Planear',
              name: formData.name!.trim(),
              supplier: formData.supplier?.trim() || 'Proceso Proveedor',
              inputs: formData.inputs?.trim() || 'Entradas e información requerida',
              outputs: formData.outputs?.trim() || 'Resultado conforme generado',
              customer: formData.customer?.trim() || 'Proceso Cliente',
              responsibleRole: formData.responsibleRole?.trim() || process.leaderRole || 'Responsable'
            }
          : act
      );
      onChange({ activities: updated });
      setEditingActivityId(null);
    } else {
      // Añadir nueva
      const newAct: ProcessActivity = {
        id: `act-${Date.now()}`,
        number: activities.length + 1,
        stage: formData.stage || 'Planear',
        name: formData.name.trim(),
        supplier: formData.supplier?.trim() || 'Procesos de soporte',
        inputs: formData.inputs?.trim() || 'Requerimientos e información de entrada',
        outputs: formData.outputs?.trim() || 'Resultado o entregable del proceso',
        customer: formData.customer?.trim() || 'Procesos clientes',
        responsibleRole: formData.responsibleRole?.trim() || process.leaderRole || 'Responsable'
      };
      onChange({ activities: [...activities, newAct] });
    }

    setFormData({
      stage: 'Planear',
      name: '',
      supplier: '',
      inputs: '',
      outputs: '',
      customer: '',
      responsibleRole: process.leaderRole || ''
    });
    setShowAddForm(false);
  };

  const handleEditClick = (act: ProcessActivity) => {
    setEditingActivityId(act.id);
    setFormData({ ...act });
    setShowAddForm(true);
  };

  const handleDeleteActivity = (id: string) => {
    const filtered = activities
      .filter((a) => a.id !== id)
      .map((a, idx) => ({ ...a, number: idx + 1 }));
    onChange({ activities: filtered });
  };

  const handleMoveActivity = (activityId: string, direction: 'up' | 'down') => {
    const currentIndex = activities.findIndex((a) => a.id === activityId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;
    const reordered = [...activities];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    const renumbered = reordered.map((a, idx) => ({ ...a, number: idx + 1 }));
    onChange({ activities: renumbered });
  };

  // Deming stats
  const demingCounts: Record<DemingStage, number> = {
    Planear: activities.filter((a) => a.stage === 'Planear').length,
    Hacer: activities.filter((a) => a.stage === 'Hacer').length,
    Verificar: activities.filter((a) => a.stage === 'Verificar').length,
    Actuar: activities.filter((a) => a.stage === 'Actuar').length
  };

  const isCycleComplete =
    demingCounts.Planear > 0 &&
    demingCounts.Hacer > 0 &&
    demingCounts.Verificar > 0 &&
    demingCounts.Actuar > 0;

  const filteredActivities =
    selectedStageFilter === 'All'
      ? activities
      : activities.filter((a) => a.stage === selectedStageFilter);

  const getStageColorBadge = (stage: DemingStage) => {
    switch (stage) {
      case 'Planear':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Hacer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Verificar':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Actuar':
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Guidance Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Módulo 4 de 6 • Mapeo del Proceso & Aporte de Entradas
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {activitiesWithInputs.length} de {activities.length} pasos con entradas completas ({inputsCompletionPercentage}%)
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Mapeo del Proceso: Aporte de Entradas, Proveedores y Convergencia SIPOC
            </h2>
            <p className="text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
              Sobre la base del procedimiento levantado en el <strong>Módulo 3 "Flujograma"</strong>, aquí se terminan de aportar las demás entradas requeridas para la construcción técnica del proceso: proveedores de origen, insumos de entrada, directrices, clasificación balanceada en el Ciclo PHVA (Planear, Hacer, Verificar, Actuar) y salidas entregadas a los procesos clientes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAutocompleteStandardInputs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold border border-orange-500/40 shadow-xs transition active:scale-95"
              title="Autocompletar entradas técnicas y proveedores estándar sugeridos por ISO 9001"
            >
              <Sparkles className="w-4 h-4 text-orange-200" />
              <span>Autocompletar Entradas Estándar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingActivityId(null);
                setFormData({
                  stage: 'Planear',
                  name: '',
                  supplier: '',
                  inputs: '',
                  outputs: '',
                  customer: '',
                  responsibleRole: process.leaderRole || ''
                });
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Actividad SIPOC</span>
            </button>
          </div>
        </div>
      </div>

      {/* PANEL 1: ENTRADAS GLOBALES REQUERIDAS PARA LA CONSTRUCCIÓN DEL PROCESO */}
      <div className="bg-gradient-to-r from-slate-50 via-emerald-50/40 to-teal-50/40 rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <span>Entradas Globales Requeridas para la Construcción del Proceso</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  Insumos & Directrices
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                Todo proceso requiere entradas detonantes: solicitudes de clientes, directrices estratégicas, presupuestos y requisitos normativos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGlobalInputsPanel(!showGlobalInputsPanel)}
            className="text-[11px] text-emerald-700 hover:underline font-bold"
          >
            {showGlobalInputsPanel ? 'Contraer Entradas Globales' : 'Expandir Entradas Globales'}
          </button>
        </div>

        {showGlobalInputsPanel && (
          <div className="space-y-3 pt-1 text-xs">
            {/* 4 Pilares de Entradas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* 1. Entradas del Cliente */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  1. Entradas del Cliente
                </span>
                <p className="text-[11px] text-slate-600 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                  {process.scopeStart || 'Solicitud formal, pedido o requerimiento de partes interesadas'}
                </p>
              </div>

              {/* 2. Entradas Estratégicas */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  2. Entradas Estratégicas
                </span>
                <p className="text-[11px] text-slate-600 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                  {orgContext?.policies?.[0] || 'Política de Calidad, plan operativo anual y asignación de presupuesto'}
                </p>
              </div>

              {/* 3. Entradas Normativas */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  3. Entradas Normativas
                </span>
                <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-100 truncate">
                  {norms[0] || 'ISO 9001:2015 numerales aplicables y normas técnicas sectoriales'}
                </p>
              </div>

              {/* 4. Entradas del Mapa de Procesos */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <FolderGit2 className="w-3.5 h-3.5 text-orange-600" />
                  4. Proveedores del Mapa
                </span>
                <p className="text-[11px] text-slate-600 bg-orange-50/60 p-2 rounded-lg border border-orange-100">
                  {activities[0]?.supplier || 'Procesos de Dirección, Soporte o Abastecimiento de la empresa'}
                </p>
              </div>

            </div>

            {/* Listado dinámico de entradas globales */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs">
                  Entradas clave aportadas para la construcción integral de este proceso:
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {globalInputs.length} registradas
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {globalInputs.map((inp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
                  >
                    <span>📥 {inp}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGlobalInput(idx)}
                      className="text-emerald-500 hover:text-emerald-800 font-bold ml-1"
                      title="Eliminar entrada"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Input rápido para agregar entrada global */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Escribe una entrada requerida por el proceso (ej: Fichas técnicas, Plan de presupuesto, Orden de servicio autorizada)..."
                  id="new-global-input-box"
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGlobalInput((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new-global-input-box') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      handleAddGlobalInput(el.value);
                      el.value = '';
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                >
                  + Agregar Entrada
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL 2: CONVERGENCIA PHVA Y ESTADO DEL CICLO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-sm font-extrabold text-slate-900">
              Convergencia Metodológica: Procedimiento (Módulo 3) → Mapeo PHVA y SIPOC (Módulo 4)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">Filtro PHVA:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {(['All', 'Planear', 'Hacer', 'Verificar', 'Actuar'] as const).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStageFilter(stage)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                    selectedStageFilter === stage
                      ? 'bg-white shadow-2xs text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {stage === 'All' ? 'Todas' : stage}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerta de Ciclo de Deming Incompleto */}
        {!isCycleComplete && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Atención de Calidad ISO 9001:</span>
              <p className="text-[11px] text-amber-800">
                Para que la construcción del proceso sea conforme con la norma, debe contemplar actividades en las 4 fases de Deming. Actualmente te falta completar:{' '}
                {demingCounts.Planear === 0 && '«Planear» '}
                {demingCounts.Hacer === 0 && '«Hacer» '}
                {demingCounts.Verificar === 0 && '«Verificar» '}
                {demingCounts.Actuar === 0 && '«Actuar» '}.
              </p>
            </div>
          </div>
        )}

        {/* FORMULARIO DE EDICIÓN O ADICIÓN DE ACTIVIDAD SIPOC */}
        {showAddForm && (
          <div className="p-4 bg-slate-50 rounded-xl border border-emerald-300 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-emerald-600" />
                {editingActivityId ? 'Editar Detalle de Entradas, Salidas y Mapeo' : 'Aportar Nueva Actividad con Entradas y SIPOC'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs"
              >
                ✕ Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fase PHVA: *</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as DemingStage })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="Planear">Planear (P)</option>
                    <option value="Hacer">Hacer (H)</option>
                    <option value="Verificar">Verificar (V)</option>
                    <option value="Actuar">Actuar (A)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Nombre de la Actividad / Tarea: *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Solicitar cotizaciones y elaborar cuadro comparativo"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* ENTRADAS Y PROVEEDOR (FOCO PRINCIPAL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-950 flex items-center gap-1">
                    <span>🏢 Proveedor de la Entrada (¿Quién la suministra?): *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Ej: Dirección Financiera / Proveedores Externos / Proceso Requirente"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-emerald-950 flex items-center gap-1">
                    <span>📥 Entradas e Insumos Requeridos (¿Qué se necesita para iniciar?): *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.inputs || ''}
                    onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                    placeholder="Ej: Requisición autorizada, fichas técnicas y presupuesto disponible"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* SALIDAS Y CLIENTE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-orange-50/60 rounded-xl border border-orange-200">
                <div className="space-y-1">
                  <label className="font-bold text-orange-950 flex items-center gap-1">
                    <span>📤 Salidas / Entregables Generados (¿Qué resultado produce?): *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.outputs || ''}
                    onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                    placeholder="Ej: Cuadro comparativo evaluado y cotizaciones aprobadas"
                    className="w-full p-2 bg-white border border-orange-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-orange-950 flex items-center gap-1">
                    <span>👥 Cliente de la Salida (¿Quién recibe el resultado?): *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer || ''}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Ej: Comité de Compras / Área Solicitante / Contabilidad"
                    className="w-full p-2 bg-white border border-orange-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* RESPONSABLE */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Cargo Responsable que ejecuta: *</label>
                <input
                  type="text"
                  required
                  value={formData.responsibleRole || ''}
                  onChange={(e) => setFormData({ ...formData, responsibleRole: e.target.value })}
                  placeholder="Ej: Jefe de Compras / Analista de Almacén"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  {editingActivityId ? 'Guardar Cambios de Mapeo' : 'Añadir Actividad SIPOC'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TABLA MATRIZ SIPOC CON ÉNFASIS EN ENTRADAS */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3 w-14 text-center">No.</th>
                <th className="p-3 w-24">Fase</th>
                <th className="p-3 w-40 bg-emerald-950 text-emerald-200">🏢 Proveedor</th>
                <th className="p-3 w-52 bg-emerald-900 text-white">📥 Entradas e Insumos</th>
                <th className="p-3 min-w-[200px]">Actividad del Proceso</th>
                <th className="p-3 w-52 bg-orange-950 text-orange-200">📤 Salidas Generadas</th>
                <th className="p-3 w-40 bg-orange-900 text-white">👥 Cliente</th>
                <th className="p-3 w-32">Responsable</th>
                <th className="p-3 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Workflow className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
                    <p className="font-semibold text-xs">No hay actividades para mostrar en este filtro.</p>
                    <p className="text-[11px]">Agrega actividades o regresa al Módulo 3 para aportar el procedimiento.</p>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act, idx) => {
                  const hasCompleteInputs = act.inputs && act.inputs.trim() !== '' && act.supplier && act.supplier.trim() !== '';

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-center font-bold text-slate-700">
                        {act.number}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStageColorBadge(act.stage)}`}>
                          {act.stage}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium bg-emerald-50/30">
                        {act.supplier || <span className="text-red-500 italic">Sin proveedor</span>}
                      </td>
                      <td className="p-3 text-slate-900 font-medium bg-emerald-50/50">
                        {act.inputs ? (
                          <div className="flex items-start gap-1">
                            <span className="text-emerald-600 font-bold shrink-0">📥</span>
                            <span>{act.inputs}</span>
                          </div>
                        ) : (
                          <span className="text-red-500 font-bold italic">⚠️ Entrada pendiente</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>
                          <span>{act.name}</span>
                          {act.procedureDescription && (
                            <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                              {act.procedureDescription}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-800 font-medium bg-orange-50/30">
                        {act.outputs ? (
                          <div className="flex items-start gap-1">
                            <span className="text-orange-600 font-bold shrink-0">📤</span>
                            <span>{act.outputs}</span>
                          </div>
                        ) : (
                          <span className="text-amber-500 italic">Pendiente</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-800 font-medium bg-orange-50/50">
                        {act.customer || <span className="text-amber-500 italic">Pendiente</span>}
                      </td>
                      <td className="p-3 text-slate-600 truncate max-w-[120px]">
                        {act.responsibleRole}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditClick(act)}
                            className="p-1 text-emerald-600 hover:text-emerald-800"
                            title="Editar entradas y mapeo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Eliminar actividad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Botones de Navegación Inferior */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Módulo 3: Flujograma y Procedimiento</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition active:scale-95"
        >
          <span>Continuar a Módulo 5: Control y KPIs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
