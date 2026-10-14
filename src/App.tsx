/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  getStoredOrgContext, 
  saveStoredOrgContext, 
  getStoredProcesses, 
  saveStoredProcesses, 
  getStoredActiveProcessId, 
  saveStoredActiveProcessId,
  createEmptyProcess,
  getStoredJobPositions,
  saveStoredJobPositions,
  getStoredLastSavedTimestamp,
  saveAllProgressSnapshot,
  downloadLocalBackupFile,
  shareOrDownloadBackupFile
} from './utils/storage';
import { OrgContext, ProcessCharacterization, ProcessCategory, DemingStage, MeasurementControl, ManagementIndicator, ProcessActivity, JobPosition } from './types/process';
import { NavigationLevels } from './components/NavigationLevels';
import { Step1General } from './components/Step1General';
import { Step2Resources } from './components/Step2Resources';
import { Step3DemingSIPOC } from './components/Step3DemingSIPOC';
import { Step4Flowchart } from './components/Step4Flowchart';
import { Step5ControlPlan } from './components/Step5ControlPlan';
import { Step6OfficialDoc } from './components/Step6OfficialDoc';
import { OrgContextModal } from './components/OrgContextModal';
import { ProcessMapModal } from './components/ProcessMapModal';
import { AssistantHelpModal } from './components/AssistantHelpModal';
import { JobManualModal } from './components/JobManualModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { SaveLocalModal } from './components/SaveLocalModal';
import { InstallShortcutModal } from './components/InstallShortcutModal';
import { PROCESS_TEMPLATES } from './data/templates';
import { generateProgressPDF, extractProcessDataFromPDF } from './utils/pdfProgressReport';
import { Sparkles, CheckCircle2, AlertTriangle, LogOut, HardDrive, RefreshCw, ShieldCheck, Download, Save, FileDown } from 'lucide-react';

export default function App() {
  const [orgContext, setOrgContext] = useState<OrgContext>(() => getStoredOrgContext());
  const [processes, setProcesses] = useState<ProcessCharacterization[]>(() => getStoredProcesses());
  const [jobPositions, setJobPositions] = useState<JobPosition[]>(() => getStoredJobPositions());
  const [activeProcessId, setActiveProcessId] = useState<string>(() => {
    const stored = getStoredActiveProcessId();
    const procs = getStoredProcesses();
    const exists = procs.find(p => p.id === stored);
    return exists ? stored : (procs[0]?.id || '');
  });

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Flowchart state
  const [flowchartView, setFlowchartView] = useState<'swimlanes' | 'sequential'>('swimlanes');
  const [flowchartZoom, setFlowchartZoom] = useState<number>(1);

  // Modals state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isProcessMapOpen, setIsProcessMapOpen] = useState(false);
  const [isAssistantHelpOpen, setIsAssistantHelpOpen] = useState(false);
  const [isJobManualOpen, setIsJobManualOpen] = useState(false);
  const [showSignaturesDrawer, setShowSignaturesDrawer] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSaveLocalModalOpen, setIsSaveLocalModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Guardado de avances & control de salida
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => getStoredLastSavedTimestamp());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);
  const [importErrorNotification, setImportErrorNotification] = useState<string | null>(null);
  const [sessionExitedState, setSessionExitedState] = useState<{
    mode: 'saved' | 'downloaded' | 'forced';
    time: string;
  } | null>(null);

  // Referencia para evitar marcar 'dirty' en la primera carga
  const isInitialMount = useRef(true);

  // Marcador de cambios pendientes en cualquier aspecto de la caracterización
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, [orgContext, processes, jobPositions, activeProcessId]);

  // Alerta de seguridad antes de cerrar o recargar ventana/pestaña si no se han grabado avances
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'No puedes salir sin grabar los avances en la caracterización.';
        return 'No puedes salir sin grabar los avances en la caracterización.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-sync storage permanente
  useEffect(() => {
    saveStoredOrgContext(orgContext);
  }, [orgContext]);

  useEffect(() => {
    saveStoredProcesses(processes);
  }, [processes]);

  useEffect(() => {
    saveStoredJobPositions(jobPositions);
  }, [jobPositions]);

  useEffect(() => {
    saveStoredActiveProcessId(activeProcessId);
  }, [activeProcessId]);

  // Handler para guardar explícitamente los avances a solicitud del usuario directamente en PC y Celular
  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      // 1. Asegurar persistencia local en almacenamiento del navegador
      const savedAt = saveAllProgressSnapshot(orgContext, processes, jobPositions, activeProcessId);
      setLastSavedTime(savedAt);
      setHasUnsavedChanges(false);

      // 2. Guardar directamente en el computador o celular del usuario
      const res = await shareOrDownloadBackupFile(orgContext, processes, jobPositions, activeProcessId);
      if (res.shared) {
        setSaveSuccessNotification(`¡Avances guardados con éxito en tu dispositivo a las ${savedAt}!`);
      } else {
        setSaveSuccessNotification(`¡Avances guardados en tu dispositivo (${res.filename}) a las ${savedAt}!`);
      }
      setTimeout(() => setSaveSuccessNotification(null), 4500);
    } catch (e) {
      console.error('Error al guardar avances en PC/Celular', e);
      try {
        const res = downloadLocalBackupFile(orgContext, processes, jobPositions, activeProcessId);
        setSaveSuccessNotification(`¡Avances guardados en tu dispositivo (${res.filename})!`);
        setTimeout(() => setSaveSuccessNotification(null), 4500);
      } catch (err) {
        console.error('Error en descarga de respaldo', err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para generar documento PDF con todos los avances (textos, gráficos y respaldo reimportable)
  const handleGenerateProgressPDF = async () => {
    if (!activeProcess) return;
    setIsGeneratingPDF(true);
    try {
      // 1. Guardar primero estado en memoria local para asegurar sincronización
      saveAllProgressSnapshot(orgContext, processes, jobPositions, activeProcessId);
      setHasUnsavedChanges(false);

      // 2. Generar el PDF híbrido con textos, gráficos y datos reimportables
      const res = await generateProgressPDF(orgContext, activeProcess, processes, jobPositions);
      if (res.shared) {
        setSaveSuccessNotification(`¡PDF de avances compartido y guardado (${res.filename})! Incluye textos, gráficos y es 100% reimportable para terminar la ficha.`);
      } else {
        setSaveSuccessNotification(`¡PDF de avances generado exitosamente (${res.filename})! Incluye textos, gráficos y es 100% reimportable para terminar la ficha.`);
      }
      setTimeout(() => setSaveSuccessNotification(null), 5500);
    } catch (e) {
      console.error('Error generando PDF de avances', e);
      setImportErrorNotification('Error al generar el archivo PDF de avances. Por favor intenta de nuevo.');
      setTimeout(() => setImportErrorNotification(null), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handler para descargar respaldo local en el computador o celular
  const handleDownloadLocalBackup = async () => {
    await handleSaveProgress();
  };

  // Handlers para salida de la plataforma
  const handleRequestExit = () => {
    setIsExitModalOpen(true);
  };

  const handleSaveAndExit = () => {
    handleSaveProgress();
    setIsExitModalOpen(false);
    setSessionExitedState({
      mode: 'saved',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  const handleDownloadAndExit = () => {
    handleDownloadLocalBackup();
    setIsExitModalOpen(false);
    setSessionExitedState({
      mode: 'downloaded',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  const handleForceExit = () => {
    setIsExitModalOpen(false);
    setHasUnsavedChanges(false);
    setSessionExitedState({
      mode: 'forced',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
  };

  // Active process reference
  const activeProcess = processes.find(p => p.id === activeProcessId) || processes[0] || createEmptyProcess();

  // Active process updates
  const handleUpdateActiveProcess = (updates: Partial<ProcessCharacterization>) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === activeProcess.id) {
        return {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  // Process management handlers
  const handleSelectProcess = (id: string) => {
    setActiveProcessId(id);
    setCurrentStep(1);
  };

  const handleNewProcess = () => {
    const newProc = createEmptyProcess(`Nuevo Proceso ${processes.length + 1}`);
    setProcesses(prev => [...prev, newProc]);
    setActiveProcessId(newProc.id);
    setCurrentStep(1);
  };

  const handleNewProcessInCategory = (category: ProcessCategory) => {
    const newProc = createEmptyProcess(`Nuevo Proceso ${category}`);
    newProc.category = category;
    setProcesses(prev => [...prev, newProc]);
    setActiveProcessId(newProc.id);
    setCurrentStep(1);
  };

  const handleDuplicateProcess = () => {
    const target = activeProcess;
    if (!target) return;
    const duplicated: ProcessCharacterization = {
      ...JSON.parse(JSON.stringify(target)),
      id: `proc-${Date.now()}`,
      name: `${target.name} (Copia)`,
      code: `${target.code || 'PR'}-C`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProcesses(prev => [...prev, duplicated]);
    setActiveProcessId(duplicated.id);
  };

  const handleDeleteProcess = (id: string) => {
    if (processes.length <= 1) return;
    const remaining = processes.filter(p => p.id !== id);
    setProcesses(remaining);
    if (activeProcessId === id) {
      setActiveProcessId(remaining[0].id);
    }
  };

  const handleLoadTemplate = (template: ProcessCharacterization) => {
    const duplicated: ProcessCharacterization = {
      ...JSON.parse(JSON.stringify(template)),
      id: `proc-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setProcesses(prev => [...prev, duplicated]);
    setActiveProcessId(duplicated.id);
    setCurrentStep(1);
  };

  const handleImportFile = async (file: File) => {
    // Si el archivo es un PDF híbrido de avances generado por la plataforma
    if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const extracted = await extractProcessDataFromPDF(file);
        if (!extracted) {
          setImportErrorNotification(
            'El archivo PDF seleccionado no contiene datos embebidos de caracterización generados por esta plataforma. Asegúrate de seleccionar un PDF generado con el botón "Avances en PDF" o un archivo .json de respaldo.'
          );
          setTimeout(() => setImportErrorNotification(null), 6000);
          return;
        }

        // Caso A: Contiene respaldo multi-proceso completo
        if (extracted.processes && Array.isArray(extracted.processes) && extracted.processes.length > 0) {
          setProcesses(extracted.processes);
          if (extracted.organization) {
            setOrgContext(prev => ({ ...prev, ...extracted.organization }));
          }
          if (extracted.jobPositions && Array.isArray(extracted.jobPositions)) {
            setJobPositions(extracted.jobPositions);
          }
          if (extracted.activeProcessId && extracted.processes.some(p => p.id === extracted.activeProcessId)) {
            setActiveProcessId(extracted.activeProcessId);
          } else {
            setActiveProcessId(extracted.processes[0].id);
          }
          setHasUnsavedChanges(false);
          const activeP = extracted.processes.find(p => p.id === (extracted.activeProcessId || extracted.processes![0].id));
          setSaveSuccessNotification(`¡Avances cargados con éxito desde el PDF! Proceso: "${activeP?.name || 'Proceso'}". Ahora puedes continuar editando y terminar la ficha.`);
          setTimeout(() => setSaveSuccessNotification(null), 5500);
          return;
        }

        // Caso B: Contiene proceso individual
        if (extracted.process && extracted.process.name) {
          const importedProc: ProcessCharacterization = {
            ...createEmptyProcess(extracted.process.name),
            ...extracted.process,
            id: extracted.process.id || `proc-${Date.now()}`
          };
          setProcesses(prev => {
            const exists = prev.some(p => p.id === importedProc.id);
            if (exists) {
              return prev.map(p => p.id === importedProc.id ? importedProc : p);
            }
            return [...prev, importedProc];
          });
          setActiveProcessId(importedProc.id);
          if (extracted.organization) {
            setOrgContext(prev => ({ ...prev, ...extracted.organization }));
          }
          if (extracted.jobPositions && Array.isArray(extracted.jobPositions)) {
            setJobPositions(extracted.jobPositions);
          }
          setHasUnsavedChanges(false);
          setSaveSuccessNotification(`¡Avances cargados con éxito desde el PDF! Proceso: "${importedProc.name}". Ya puedes continuar tu trabajo para terminar la ficha.`);
          setTimeout(() => setSaveSuccessNotification(null), 5500);
          return;
        }

        setImportErrorNotification('El PDF contiene datos pero no se reconoció una estructura de caracterización válida.');
        setTimeout(() => setImportErrorNotification(null), 5000);
        return;
      } catch (err) {
        console.error('Error al procesar PDF reimportable', err);
        setImportErrorNotification('Error al leer los datos del archivo PDF. Intenta nuevamente.');
        setTimeout(() => setImportErrorNotification(null), 5000);
        return;
      }
    }

    // Si el archivo es JSON
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Case 0: Respaldo completo de todos los avances del espacio de trabajo
        if (parsed.processes && Array.isArray(parsed.processes) && parsed.processes.length > 0) {
          setProcesses(parsed.processes);
          if (parsed.organization) {
            setOrgContext(prev => ({ ...prev, ...parsed.organization }));
          }
          if (parsed.jobPositions && Array.isArray(parsed.jobPositions)) {
            setJobPositions(parsed.jobPositions);
          }
          if (parsed.activeProcessId && parsed.processes.some((p: ProcessCharacterization) => p.id === parsed.activeProcessId)) {
            setActiveProcessId(parsed.activeProcessId);
          } else {
            setActiveProcessId(parsed.processes[0].id);
          }
          setHasUnsavedChanges(false);
          setSaveSuccessNotification(`¡Respaldo restaurado con éxito (${parsed.processes.length} procesos cargados)!`);
          setTimeout(() => setSaveSuccessNotification(null), 4000);
          return;
        }

        // Case 1: Formato exportado { organization, process, ... }
        if (parsed.process && parsed.process.name) {
          const importedProc: ProcessCharacterization = {
            ...createEmptyProcess(parsed.process.name),
            ...parsed.process,
            id: `proc-${Date.now()}`
          };
          setProcesses(prev => [...prev, importedProc]);
          setActiveProcessId(importedProc.id);
          if (parsed.organization) {
            setOrgContext(prev => ({ ...prev, ...parsed.organization }));
          }
          setCurrentStep(1);
          setSaveSuccessNotification(`¡Proceso "${importedProc.name}" importado con éxito!`);
          setTimeout(() => setSaveSuccessNotification(null), 4000);
          return;
        }

        // Case 2: Objeto ProcessCharacterization directo
        if (parsed.name && (parsed.activities || parsed.category)) {
          const importedProc: ProcessCharacterization = {
            ...createEmptyProcess(parsed.name),
            ...parsed,
            id: `proc-${Date.now()}`
          };
          setProcesses(prev => [...prev, importedProc]);
          setActiveProcessId(importedProc.id);
          setCurrentStep(1);
          setSaveSuccessNotification(`¡Proceso "${importedProc.name}" importado con éxito!`);
          setTimeout(() => setSaveSuccessNotification(null), 4000);
          return;
        }

        // Formato no reconocido
        setImportErrorNotification('El archivo seleccionado no contiene una estructura reconocida de caracterización o respaldo ISO 9001.');
        setTimeout(() => setImportErrorNotification(null), 5000);
      } catch (err) {
        console.error('Error al importar archivo', err);
        setImportErrorNotification('Error al leer el archivo. Asegúrate de seleccionar un archivo .pdf o .json válido.');
        setTimeout(() => setImportErrorNotification(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleImportJSON = handleImportFile;

  const handleFeedProcessFromJob = (job: JobPosition, mode: 'create_new' | 'update_active') => {
    if (mode === 'create_new') {
      const timestamp = Date.now();
      const codePart = job.code.replace(/[^A-Z0-9]/gi, '').slice(0, 4).toUpperCase() || 'OP';
      
      // Distribute responsibilities into PHVA stages
      const stagesOrder: DemingStage[] = ['Planear', 'Hacer', 'Verificar', 'Actuar'];
      const generatedActivities: ProcessActivity[] = (job.responsibilities || []).map((resp, idx) => ({
        id: `act-${timestamp}-${idx + 1}`,
        number: idx + 1,
        stage: stagesOrder[idx % stagesOrder.length],
        name: resp,
        supplier: job.department || 'Área Operativa',
        inputs: 'Directrices del cargo, recursos e información de entrada',
        outputs: 'Resultado conforme y registros de gestión del cargo',
        customer: 'Procesos clientes / Partes interesadas',
        responsibleRole: job.title
      }));

      // Ensure at least 4 Deming activities if few responsibilities
      if (generatedActivities.length < 4) {
        const missingStages = stagesOrder.filter(st => !generatedActivities.some(a => a.stage === st));
        missingStages.forEach((st, i) => {
          generatedActivities.push({
            id: `act-${timestamp}-fill-${i + 1}`,
            number: generatedActivities.length + 1,
            stage: st,
            name: `${st} las actividades clave asociadas al cargo de ${job.title}`,
            supplier: job.department,
            inputs: 'Requisitos y planes operativos',
            outputs: 'Resultados del proceso conforme a estándares',
            customer: 'Clientes del proceso',
            responsibleRole: job.title
          });
        });
      }

      const newProc: ProcessCharacterization = {
        ...createEmptyProcess(job.associatedProcessName || `Gestión de ${job.department}`),
        id: `proc-${timestamp}`,
        code: `PR-${codePart}-001`,
        category: job.associatedProcessCategory,
        leaderRole: job.title,
        participants: `Equipo subordinado de ${job.department}, Analistas, Auditores`,
        objective: job.objective || `Asegurar el cumplimiento de los objetivos y responsabilidades del área de ${job.department} liderada por ${job.title}.`,
        productOrService: `Productos y servicios gestionados bajo la responsabilidad del cargo ${job.title}.`,
        scopeStart: `Recepción de requerimientos o plan estratégico por parte de ${job.reportsTo || 'la Gerencia'}`,
        scopeEnd: `Entrega conforme de resultados y rendición de cuentas del cargo`,
        humanResources: [
          `Líder del Proceso: ${job.title}`,
          `Formación requerida: ${job.education}`,
          `Experiencia mínima: ${job.experience}`,
          ...(job.competencies || []).map(c => `Competencia laboral: ${c}`)
        ],
        activities: generatedActivities
      };

      setProcesses(prev => [...prev, newProc]);
      setActiveProcessId(newProc.id);
      setCurrentStep(1);
    } else {
      // update_active
      const currentHuman = activeProcess.humanResources || [];
      const leaderNote = `Líder: ${job.title} | Formación: ${job.education} | Exp: ${job.experience}`;
      const newHumanList = currentHuman.includes(leaderNote) ? currentHuman : [...currentHuman, leaderNote];

      // Convert job responsibilities into additional activities if relevant
      const currentActs = activeProcess.activities || [];
      const newActs = [...currentActs];
      const startNum = currentActs.length + 1;
      const stagesOrder: DemingStage[] = ['Planear', 'Hacer', 'Verificar', 'Actuar'];

      (job.responsibilities || []).forEach((resp, idx) => {
        // Only add if not already in activities
        if (!currentActs.some(a => a.name.toLowerCase() === resp.toLowerCase())) {
          newActs.push({
            id: `act-${Date.now()}-${idx + 1}`,
            number: startNum + idx,
            stage: stagesOrder[idx % stagesOrder.length],
            name: resp,
            supplier: job.department || 'Área del Proceso',
            inputs: 'Requerimientos e insumos autorizados',
            outputs: 'Entregable o resultado generado conforme',
            customer: 'Procesos Clientes',
            responsibleRole: job.title
          });
        }
      });

      handleUpdateActiveProcess({
        leaderRole: job.title,
        humanResources: newHumanList,
        activities: newActs
      });
    }
  };

  const handleApplyTemplate = (templateIndex: number) => {
    const tmpl = PROCESS_TEMPLATES[templateIndex];
    if (tmpl) {
      handleUpdateActiveProcess({
        name: tmpl.name,
        category: tmpl.category,
        leaderRole: tmpl.leaderRole,
        participants: tmpl.participants,
        objective: tmpl.objective,
        productOrService: tmpl.productOrService,
        scopeStart: tmpl.scopeStart,
        scopeEnd: tmpl.scopeEnd,
        legalAndTechnicalNorms: [...tmpl.legalAndTechnicalNorms],
        technologicalResources: [...tmpl.technologicalResources],
        informationResources: [...tmpl.informationResources],
        humanResources: [...tmpl.humanResources],
        requiredFormats: [...tmpl.requiredFormats],
        indicators: JSON.parse(JSON.stringify(tmpl.indicators)),
        infrastructureAndEquipment: [...tmpl.infrastructureAndEquipment],
        workEnvironment: [...tmpl.workEnvironment],
        activities: JSON.parse(JSON.stringify(tmpl.activities)),
        measurementPlan: JSON.parse(JSON.stringify(tmpl.measurementPlan))
      });
    }
  };

  // Nivel 3 Contextual Actions:
  const handleStep1SuggestObjective = (type: string) => {
    let objectiveText = '';
    if (type === 'calidad') {
      objectiveText = `Garantizar la calidad y conformidad técnica de los resultados del proceso de ${activeProcess.name}, satisfaciendo los requisitos de los clientes y normas aplicables.`;
    } else if (type === 'eficiencia') {
      objectiveText = `Optimizar los recursos y tiempos de ejecución en el proceso de ${activeProcess.name}, eliminando desperdicios y maximizando la productividad operativa.`;
    } else {
      objectiveText = `Asegurar la entrega oportuna y satisfacción de clientes internos y externos con el producto o servicio generado en el proceso de ${activeProcess.name}.`;
    }
    handleUpdateActiveProcess({ objective: objectiveText });
  };

  const handleStep2AddNorms = () => {
    const typical = [
      'ISO 9001:2015 Sistemas de Gestión de la Calidad (Enfoque basado en procesos)',
      'ISO 14001:2015 Sistemas de Gestión Ambiental',
      'ISO 45001:2018 Sistemas de Gestión de Seguridad y Salud en el Trabajo',
      'Ley 1581 de 2012 de Protección de Datos Personales'
    ];
    const existing = new Set(activeProcess.legalAndTechnicalNorms || []);
    const merged = [...(activeProcess.legalAndTechnicalNorms || [])];
    typical.forEach(t => {
      if (!existing.has(t)) merged.push(t);
    });
    handleUpdateActiveProcess({ legalAndTechnicalNorms: merged });
  };

  const handleStep4AddActivity = () => {
    const acts = activeProcess.activities || [];
    const newAct: ProcessActivity = {
      id: `act-${Date.now()}`,
      number: acts.length + 1,
      stage: 'Planear',
      name: `Actividad operativa #${acts.length + 1} para ${activeProcess.name}`,
      supplier: 'Procesos de Soporte',
      inputs: 'Requerimientos autorizados',
      outputs: 'Resultado o entregable del proceso',
      customer: 'Procesos Clientes',
      responsibleRole: activeProcess.leaderRole || 'Líder del Proceso'
    };
    handleUpdateActiveProcess({ activities: [...acts, newAct] });
  };

  const handleStep4QuickStage = (stage: DemingStage) => {
    const acts = activeProcess.activities || [];
    const stageTemplates: Record<DemingStage, { name: string; supplier: string; inputs: string; outputs: string; customer: string }> = {
      Planear: {
        name: `Planificar recursos, cronograma y parámetros de control para ${activeProcess.name}`,
        supplier: 'Dirección Estratégica / Proceso de Planeación',
        inputs: 'Directrices estratégicas, presupuesto y requisitos del cliente',
        outputs: 'Plan operativo y cronograma de trabajo aprobado',
        customer: 'Equipo ejecutor del proceso'
      },
      Hacer: {
        name: `Ejecutar la operación y prestación conforme de ${activeProcess.productOrService || activeProcess.name}`,
        supplier: 'Proveedores / Almacén / Solicitantes',
        inputs: 'Plan operativo, especificaciones técnicas y recursos asignados',
        outputs: 'Producto o servicio elaborado conforme a estándares',
        customer: 'Clientes del proceso'
      },
      Verificar: {
        name: `Verificar especificaciones de calidad, evaluar indicadores y auditar el proceso`,
        supplier: 'Equipo operativo del proceso',
        inputs: 'Registros de ejecución y productos generados',
        outputs: 'Informe de gestión, cálculo de KPIs y reporte de conformidades',
        customer: 'Líder del Proceso / Comité de Calidad'
      },
      Actuar: {
        name: `Implementar acciones correctivas y proyectos de mejora continua en ${activeProcess.name}`,
        supplier: 'Comité de Calidad / Auditorías Internas',
        inputs: 'Informe de desviaciones, quejas o no conformidades',
        outputs: 'Planes de acción ejecutados y procedimientos actualizados',
        customer: 'Todos los procesos de la empresa'
      }
    };
    const tmpl = stageTemplates[stage];
    const newAct: ProcessActivity = {
      id: `act-${Date.now()}`,
      number: acts.length + 1,
      stage,
      name: tmpl.name,
      supplier: tmpl.supplier,
      inputs: tmpl.inputs,
      outputs: tmpl.outputs,
      customer: tmpl.customer,
      responsibleRole: activeProcess.leaderRole || 'Líder del Proceso'
    };
    handleUpdateActiveProcess({ activities: [...acts, newAct] });
    setSaveSuccessNotification(`¡Actividad de ${stage} agregada exitosamente al mapeo!`);
    setTimeout(() => setSaveSuccessNotification(null), 3000);
  };

  const handleStep5AddControl = () => {
    const ctrls = activeProcess.measurementPlan || [];
    const newControl: MeasurementControl = {
      id: `ctrl-${Date.now()}`,
      activityName: activeProcess.activities?.[0]?.name || 'Operación principal',
      variableToControl: 'Conformidad de especificaciones y tiempos de entrega',
      specification: '100% de cumplimiento de parámetros definidos',
      acceptanceCriteria: 'Aprobación sin no conformidades mayores',
      inspectorRole: activeProcess.leaderRole || 'Inspector de Calidad',
      inspectionRecord: activeProcess.requiredFormats?.[0] || 'FOR-01 Registro de Verificación',
      contingencyAction: 'Rechazar entrega, emitir no conformidad y corregir inmediatamente'
    };
    handleUpdateActiveProcess({ measurementPlan: [...ctrls, newControl] });
    setSaveSuccessNotification('¡Nuevo parámetro de control agregado al Plan de Medición!');
    setTimeout(() => setSaveSuccessNotification(null), 3000);
  };

  const handleStep5GenerateControls = () => {
    const ctrls = activeProcess.measurementPlan || [];
    const existingActs = new Set(ctrls.map(c => c.activityName.trim().toLowerCase()));
    const newControls: MeasurementControl[] = [...ctrls];
    const acts = activeProcess.activities || [];
    const defaultFormat = activeProcess.requiredFormats?.[0] || 'FOR-01 Registro de Control y Verificación';

    let addedCount = 0;
    acts.forEach((act) => {
      if (!existingActs.has(act.name.trim().toLowerCase())) {
        let variable = 'Conformidad técnica y oportunidad de la entrega';
        let spec = '100% de cumplimiento con las especificaciones del cliente y normativas';
        let accept = 'Aprobación del registro de verificación sin no conformidades mayores';
        let conting = 'Suspender entrega, emitir no conformidad e implementar acción correctiva inmediata';

        if (act.stage === 'Planear') {
          variable = 'Oportunidad y completitud del plan operativo y asignación de recursos';
          spec = 'Aprobación de la planificación previa al inicio de operaciones';
          accept = 'Plan formalmente aprobado y recursos garantizados';
          conting = 'Reprogramar actividades y solicitar asignación prioritaria de recursos';
        } else if (act.stage === 'Verificar') {
          variable = 'Evaluación de conformidad de indicadores y auditoría interna';
          spec = 'Meta de eficacia ≥ 95% y cero desviaciones críticas';
          accept = 'Resultado conforme al indicador establecido';
          conting = 'Apertura inmediata de informe de desviación y plan de acción de choque';
        } else if (act.stage === 'Actuar') {
          variable = 'Cierre efectivo de acciones de mejora y lecciones aprendidas';
          spec = '100% de acciones de mejora cerradas dentro del plazo';
          accept = 'Verificación de eficacia aprobada por el responsable';
          conting = 'Revisar causa raíz y actualizar procedimiento operativo';
        }

        newControls.push({
          id: `ctrl-${Date.now()}-${act.number}`,
          activityId: act.id,
          activityName: act.name,
          variableToControl: variable,
          specification: spec,
          acceptanceCriteria: accept,
          inspectorRole: act.responsibleRole || activeProcess.leaderRole || 'Líder del Proceso',
          inspectionRecord: defaultFormat,
          contingencyAction: conting
        });
        existingActs.add(act.name.trim().toLowerCase());
        addedCount++;
      }
    });

    if (addedCount > 0) {
      handleUpdateActiveProcess({ measurementPlan: newControls });
      setSaveSuccessNotification(`¡${addedCount} controles generados automáticamente desde las actividades PHVA!`);
      setTimeout(() => setSaveSuccessNotification(null), 3500);
    } else {
      setSaveSuccessNotification('Todas las actividades ya cuentan con puntos de control definidos.');
      setTimeout(() => setSaveSuccessNotification(null), 3000);
    }
  };

  const handleStep5AddIndicator = () => {
    const inds = activeProcess.indicators || [];
    const newInd: ManagementIndicator = {
      id: `ind-${Date.now()}`,
      name: 'Eficacia de Operación del Proceso',
      formula: '(Resultados conformes / Total resultados evaluados) * 100',
      target: '≥ 95%',
      frequency: 'Mensual',
      responsible: activeProcess.leaderRole || 'Líder del Proceso'
    };
    handleUpdateActiveProcess({ indicators: [...inds, newInd] });
    setSaveSuccessNotification('¡Nuevo indicador de eficacia añadido al proceso!');
    setTimeout(() => setSaveSuccessNotification(null), 3000);
  };

  const handleStep6ExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      organization: orgContext,
      process: activeProcess,
      exportedAt: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Caracterizacion_${activeProcess.code || 'Proceso'}_${activeProcess.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleStep6ExportCSV = () => {
    const escapeCsv = (val: string | undefined | null) => {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csv = '\uFEFF';
    csv += 'FICHA OFICIAL DE CARACTERIZACIÓN DE PROCESO (ISO 9001:2015)\n';
    csv += `Empresa;${escapeCsv(orgContext.name)};NIT;${escapeCsv(orgContext.nit)}\n`;
    csv += `Proceso;${escapeCsv(activeProcess.name)};Código;${escapeCsv(activeProcess.code)};Versión;${escapeCsv(activeProcess.version)}\n`;
    csv += `Categoría;${escapeCsv(activeProcess.category)};Líder del Proceso;${escapeCsv(activeProcess.leaderRole)}\n`;
    csv += `Participantes;${escapeCsv(activeProcess.participants)}\n`;
    csv += `Objetivo del Proceso;${escapeCsv(activeProcess.objective)}\n`;
    csv += `Producto o Servicio;${escapeCsv(activeProcess.productOrService)}\n`;
    csv += `Alcance Inicio;${escapeCsv(activeProcess.scopeStart)};Alcance Fin;${escapeCsv(activeProcess.scopeEnd)}\n\n`;

    csv += 'MATRIZ SIPOC / ACTIVIDADES DEL PROCESO (CICLO PHVA)\n';
    csv += 'No;Etapa PHVA;Actividad;Proceso Proveedor;Entradas / Insumos;Salidas / Entregables;Proceso Cliente;Responsable\n';
    (activeProcess.activities || []).forEach((act) => {
      csv += `${act.number};${escapeCsv(act.stage)};${escapeCsv(act.name)};${escapeCsv(act.supplier)};${escapeCsv(act.inputs)};${escapeCsv(act.outputs)};${escapeCsv(act.customer)};${escapeCsv(act.responsibleRole)}\n`;
    });
    csv += '\n';

    csv += 'PLAN DE SEGUIMIENTO Y MEDICIÓN (CONTROL DEL PROCESO)\n';
    csv += 'No;Actividad Vinculada;Variable a Controlar;Especificación del Control;Criterios de Aceptación/Rechazo;Quién Inspecciona;Registro de Inspección;Acción de Contingencia\n';
    (activeProcess.measurementPlan || []).forEach((ctrl, idx) => {
      csv += `${idx + 1};${escapeCsv(ctrl.activityName)};${escapeCsv(ctrl.variableToControl)};${escapeCsv(ctrl.specification)};${escapeCsv(ctrl.acceptanceCriteria)};${escapeCsv(ctrl.inspectorRole)};${escapeCsv(ctrl.inspectionRecord)};${escapeCsv(ctrl.contingencyAction)}\n`;
    });
    csv += '\n';

    csv += 'INDICADORES DE GESTIÓN\n';
    csv += 'No;Nombre del Indicador;Fórmula de Cálculo;Meta;Frecuencia;Responsable\n';
    (activeProcess.indicators || []).forEach((ind, idx) => {
      csv += `${idx + 1};${escapeCsv(ind.name)};${escapeCsv(ind.formula)};${escapeCsv(ind.target)};${escapeCsv(ind.frequency)};${escapeCsv(ind.responsible)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `Caracterizacion_${activeProcess.code || 'PR'}_${activeProcess.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Deming stats for progress indicators
  const activities = activeProcess.activities || [];
  const demingCounts: Record<DemingStage, number> = {
    Planear: activities.filter(a => a.stage === 'Planear').length,
    Hacer: activities.filter(a => a.stage === 'Hacer').length,
    Verificar: activities.filter(a => a.stage === 'Verificar').length,
    Actuar: activities.filter(a => a.stage === 'Actuar').length
  };

  const isDemingComplete = 
    demingCounts.Planear > 0 &&
    demingCounts.Hacer > 0 &&
    demingCounts.Verificar > 0 &&
    demingCounts.Actuar > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-800">
      
      {/* ========================================================= */}
      {/* 3 NIVELES DE BOTONERÍA JERÁRQUICOS Y ORGANIZADOS          */}
      {/* Nivel 1: Empresa, Procesos y Utilidades                   */}
      {/* Nivel 2: Pasos de la Caracterización (1 a 6)              */}
      {/* Nivel 3: Comandos Contextuales del Paso y Paginación      */}
      {/* ========================================================= */}
      <NavigationLevels
        orgContext={orgContext}
        processes={processes}
        activeProcess={activeProcess}
        onSelectProcess={handleSelectProcess}
        onNewProcess={handleNewProcess}
        onDuplicateProcess={handleDuplicateProcess}
        onImportJSON={handleImportJSON}
        onOpenOrgModal={() => setIsOrgModalOpen(true)}
        onOpenProcessMap={() => setIsProcessMapOpen(true)}
        onOpenAssistantHelp={() => setIsAssistantHelpOpen(true)}
        onOpenJobManual={() => setIsJobManualOpen(true)}
        jobPositionsCount={jobPositions.length}
        onPrintPreview={() => setCurrentStep(6)}
        onSaveProgress={handleSaveProgress}
        onGenerateProgressPDF={handleGenerateProgressPDF}
        isGeneratingPDF={isGeneratingPDF}
        onRequestExit={handleRequestExit}
        onOpenSaveLocalModal={() => setIsSaveLocalModalOpen(true)}
        onDownloadLocalBackup={handleDownloadLocalBackup}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        isSaving={isSaving}
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        totalSteps={6}
        demingCounts={demingCounts}
        isDemingComplete={isDemingComplete}
        onStep1SuggestObjective={handleStep1SuggestObjective}
        onStep2AddNorms={handleStep2AddNorms}
        onStep4AddActivity={handleStep4AddActivity}
        onStep4QuickStage={handleStep4QuickStage}
        onStep5AddControl={handleStep5AddControl}
        onStep5AddIndicator={handleStep5AddIndicator}
        onStep5GenerateControls={handleStep5GenerateControls}
        onStep6ToggleSignatures={() => setShowSignaturesDrawer(prev => !prev)}
        isSignaturesDrawerOpen={showSignaturesDrawer}
        onStep6ExportJSON={handleStep6ExportJSON}
        onStep6ExportCSV={handleStep6ExportCSV}
        flowchartView={flowchartView}
        onToggleFlowchartView={setFlowchartView}
        zoomLevel={flowchartZoom}
        onZoomChange={setFlowchartZoom}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentStep === 1 && (
          <Step1General
            process={activeProcess}
            orgContext={orgContext}
            jobPositions={jobPositions}
            onChange={handleUpdateActiveProcess}
            onNext={() => setCurrentStep(2)}
            onApplyTemplate={handleApplyTemplate}
            onOpenJobManual={() => setIsJobManualOpen(true)}
            onOpenOrgModal={() => setIsOrgModalOpen(true)}
          />
        )}

        {currentStep === 2 && (
          <Step2Resources
            process={activeProcess}
            orgContext={orgContext}
            jobPositions={jobPositions}
            onChange={handleUpdateActiveProcess}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step4Flowchart
            process={activeProcess}
            processes={processes}
            jobPositions={jobPositions}
            onChange={handleUpdateActiveProcess}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
            onOpenProcessMap={() => setIsProcessMapOpen(true)}
            onOpenJobManual={() => setIsJobManualOpen(true)}
            viewMode={flowchartView}
            onViewModeChange={setFlowchartView}
            zoomLevel={flowchartZoom}
            onZoomChange={setFlowchartZoom}
          />
        )}

        {currentStep === 4 && (
          <Step3DemingSIPOC
            process={activeProcess}
            processes={processes}
            jobPositions={jobPositions}
            orgContext={orgContext}
            onChange={handleUpdateActiveProcess}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
            onOpenProcessMap={() => setIsProcessMapOpen(true)}
            onOpenJobManual={() => setIsJobManualOpen(true)}
          />
        )}

        {currentStep === 5 && (
          <Step5ControlPlan
            process={activeProcess}
            onChange={handleUpdateActiveProcess}
            onNext={() => setCurrentStep(6)}
            onPrev={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <Step6OfficialDoc
            orgContext={orgContext}
            process={activeProcess}
            onChange={handleUpdateActiveProcess}
            onPrev={() => setCurrentStep(5)}
            showSignaturesDrawer={showSignaturesDrawer}
            onToggleSignaturesDrawer={() => setShowSignaturesDrawer(prev => !prev)}
          />
        )}
      </main>

      {/* Modals */}
      <OrgContextModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        orgContext={orgContext}
        onSave={(updated) => setOrgContext(updated)}
      />

      <ProcessMapModal
        isOpen={isProcessMapOpen}
        onClose={() => setIsProcessMapOpen(false)}
        processes={processes}
        activeProcessId={activeProcess.id}
        onSelectProcess={handleSelectProcess}
        onNewProcessInCategory={handleNewProcessInCategory}
        onDeleteProcess={handleDeleteProcess}
        onDuplicateProcess={(id) => {
          const target = processes.find(p => p.id === id);
          if (target) {
            const duplicated = {
              ...JSON.parse(JSON.stringify(target)),
              id: `proc-${Date.now()}`,
              name: `${target.name} (Copia)`,
              code: `${target.code || 'PR'}-C`,
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0]
            };
            setProcesses(prev => [...prev, duplicated]);
            setActiveProcessId(duplicated.id);
          }
        }}
        onOpenJobManual={() => {
          setIsProcessMapOpen(false);
          setIsJobManualOpen(true);
        }}
      />

      <AssistantHelpModal
        isOpen={isAssistantHelpOpen}
        onClose={() => setIsAssistantHelpOpen(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <JobManualModal
        isOpen={isJobManualOpen}
        onClose={() => setIsJobManualOpen(false)}
        jobPositions={jobPositions}
        onSaveJobPositions={setJobPositions}
        activeProcess={activeProcess}
        onFeedProcessFromJob={handleFeedProcessFromJob}
      />

      {/* Modal de Advertencia y Confirmación de Salida */}
      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveAndExit={handleSaveAndExit}
        onDownloadAndExit={handleDownloadAndExit}
        onForceExit={handleForceExit}
        activeProcessName={activeProcess ? `[${activeProcess.code || 'S/C'}] ${activeProcess.name}` : undefined}
        lastSavedTime={lastSavedTime}
      />

      {/* Modal para Guardar Avances Localmente en Computador o Celular */}
      <SaveLocalModal
        isOpen={isSaveLocalModalOpen}
        onClose={() => setIsSaveLocalModalOpen(false)}
        orgContext={orgContext}
        processes={processes}
        jobPositions={jobPositions}
        activeProcessId={activeProcessId}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSavedTime={lastSavedTime}
        onSaveBrowserStorage={handleSaveProgress}
        onImportBackupFile={handleImportFile}
        onGenerateProgressPDF={handleGenerateProgressPDF}
        isGeneratingPDF={isGeneratingPDF}
      />

      {/* Modal de Creación de Acceso Directo e Instalación en PC y Celulares */}
      <InstallShortcutModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Notificación flotante de confirmación de guardado */}
      {saveSuccessNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-orange-600 text-white px-4 py-3 rounded-xl shadow-lg border border-orange-500 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-orange-100" />
          <div className="text-xs">
            <span className="font-bold block">Grabado exitoso</span>
            <span className="text-orange-100">{saveSuccessNotification}</span>
          </div>
        </div>
      )}

      {/* Notificación flotante de error en importación */}
      {importErrorNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg border border-rose-500 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-100" />
          <div className="text-xs">
            <span className="font-bold block">Error al importar archivo</span>
            <span className="text-rose-100">{importErrorNotification}</span>
          </div>
        </div>
      )}

      {/* Pantalla / Modal de Sesión Concluida (Reemplazo amigable de window.alert) */}
      {sessionExitedState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800 text-center p-6 space-y-4">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
              sessionExitedState.mode === 'saved' || sessionExitedState.mode === 'downloaded'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {sessionExitedState.mode === 'downloaded' ? (
                <HardDrive className="w-7 h-7" />
              ) : sessionExitedState.mode === 'saved' ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <LogOut className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {sessionExitedState.mode === 'downloaded'
                  ? '¡Avances Guardados y Descargados!'
                  : sessionExitedState.mode === 'saved'
                  ? '¡Avances Grabados Exitosamente!'
                  : 'Sesión Finalizada'}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {sessionExitedState.mode === 'downloaded'
                  ? 'El archivo de respaldo fue descargado en tu computador o celular y todos los datos se resguardaron en este navegador.'
                  : sessionExitedState.mode === 'saved'
                  ? 'Toda la caracterización, mapa de procesos y cargos quedaron grabados de forma segura en este dispositivo.'
                  : 'Has salido de la sesión de trabajo. Los datos permanecen según la última grabación realizada.'}
              </p>
              <div className="mt-2.5 inline-block px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-500">
                Hora: {sessionExitedState.time}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSessionExitedState(null)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reanudar o Continuar Editando</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 text-center print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>
            {orgContext.name} • NIT: {orgContext.nit} • Sistema de Caracterización de Procesos ISO 9001:2015
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold transition"
              title="Instalar en escritorio o celular"
            >
              <Download className="w-3.5 h-3.5 text-orange-500" />
              <span>Acceso directo en PC y Celular</span>
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-400">
              Ciclo PHVA: Planear • Hacer • Verificar • Actuar
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
