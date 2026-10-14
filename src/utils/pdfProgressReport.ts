import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OrgContext, ProcessCharacterization, JobPosition } from '../types/process';

export interface ProgressPDFResult {
  success: boolean;
  filename: string;
  blob: Blob;
  shared?: boolean;
}

// Delimitadores inequívocos para incrustar y extraer los datos en el PDF híbrido
export const PDF_DATA_MARKER_START = '%%GESTION_PROCESO_DATA_START%%';
export const PDF_DATA_MARKER_END = '%%GESTION_PROCESO_DATA_END%%';

/**
 * Codifica una cadena a base64 de forma segura con soporte UTF-8 completo
 */
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    // Fallback con TextEncoder
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Decodifica una cadena base64 a UTF-8 de forma segura
 */
function base64ToUtf8(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64.trim())));
  } catch (e) {
    const binary = atob(base64.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
}

/**
 * Calcula métricas detalladas de avance para representar en texto y gráficos
 */
export function calculateProcessProgress(process: ProcessCharacterization) {
  const steps = [
    {
      step: 1,
      name: 'Identificación',
      done: Boolean(process.name && process.code && process.objective && process.leaderRole && process.scopeStart && process.scopeEnd),
      weight: 20
    },
    {
      step: 2,
      name: 'Normas y Recursos',
      done: Boolean(
        (process.legalAndTechnicalNorms && process.legalAndTechnicalNorms.length > 0) ||
        (process.humanResources && process.humanResources.length > 0) ||
        (process.technologicalResources && process.technologicalResources.length > 0)
      ),
      weight: 15
    },
    {
      step: 3,
      name: 'Flujograma / Procedimiento Empresa',
      done: Boolean(
        process.currentProcedureSummary ||
        (process.activities && process.activities.some(a => a.procedureDescription || a.stepType))
      ),
      weight: 15
    },
    {
      step: 4,
      name: 'Mapeo SIPOC & Entradas',
      done: Boolean(
        process.activities && process.activities.length >= 2 &&
        process.activities.some(a => a.inputs && a.outputs)
      ),
      weight: 20
    },
    {
      step: 5,
      name: 'Control y KPIs',
      done: Boolean(
        (process.indicators && process.indicators.length > 0) ||
        (process.measurementPlan && process.measurementPlan.length > 0)
      ),
      weight: 15
    },
    {
      step: 6,
      name: 'Aprobaciones y Ficha Oficial',
      done: Boolean(
        process.approvals &&
        process.approvals.elaboratedBy?.name &&
        process.approvals.reviewedBy?.name &&
        process.approvals.approvedBy?.name
      ),
      weight: 15
    }
  ];

  const totalScore = steps.reduce((acc, curr) => acc + (curr.done ? curr.weight : 0), 0);

  const demingCounts = {
    Planear: process.activities?.filter(a => a.stage === 'Planear').length || 0,
    Hacer: process.activities?.filter(a => a.stage === 'Hacer').length || 0,
    Verificar: process.activities?.filter(a => a.stage === 'Verificar').length || 0,
    Actuar: process.activities?.filter(a => a.stage === 'Actuar').length || 0,
  };

  const isDemingBalanced = 
    demingCounts.Planear > 0 &&
    demingCounts.Hacer > 0 &&
    demingCounts.Verificar > 0 &&
    demingCounts.Actuar > 0;

  return {
    steps,
    totalScore,
    demingCounts,
    isDemingBalanced,
    totalActivities: process.activities?.length || 0,
    totalIndicators: process.indicators?.length || 0,
    totalControls: process.measurementPlan?.length || 0
  };
}

/**
 * Genera el documento PDF interactivo e híbrido con textos, gráficos y datos reimportables
 */
export async function generateProgressPDF(
  orgContext: OrgContext,
  process: ProcessCharacterization,
  processes: ProcessCharacterization[] = [],
  jobPositions: JobPosition[] = []
): Promise<ProgressPDFResult> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  const progress = calculateProcessProgress(process);

  // Paleta de colores institucional
  const primaryColor: [number, number, number] = [4, 120, 87]; // Emerald 700
  const secondaryColor: [number, number, number] = [234, 88, 12]; // Orange 600
  const darkSlate: [number, number, number] = [15, 23, 42]; // Slate 900
  const lightSlate: [number, number, number] = [241, 245, 249]; // Slate 100
  const borderSlate: [number, number, number] = [203, 213, 225]; // Slate 300
  const textMuted: [number, number, number] = [100, 116, 139]; // Slate 500

  // Función para agregar encabezado institucional en cada página
  const drawPageHeader = (pageTitle: string) => {
    // Barra superior decorativa bicolor
    doc.setFillColor(...primaryColor);
    doc.rect(margin, 8, contentWidth * 0.7, 2, 'F');
    doc.setFillColor(...secondaryColor);
    doc.rect(margin + contentWidth * 0.7, 8, contentWidth * 0.3, 2, 'F');

    // Fila de encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text(orgContext.name || 'GESTIÓN DE PROCESOS ISO 9001', margin, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`NIT: ${orgContext.nit || 'Sin NIT'} | Proceso: [${process.code || 'S/C'}] ${process.name}`, margin + 55, 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text(pageTitle, pageWidth - margin, 14, { align: 'right' });

    // Línea divisoria
    doc.setDrawColor(...borderSlate);
    doc.setLineWidth(0.3);
    doc.line(margin, 16, pageWidth - margin, 16);
  };

  // Función para agregar pie de página en cada página
  const drawPageFooter = (pageNum: number, totalPagesEst: number) => {
    doc.setDrawColor(...borderSlate);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...primaryColor);
    doc.text('ARCHIVO HÍBRIDO REIMPORTABLE', margin, pageHeight - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text('Este PDF contiene los datos del proceso embebidos. Puedes importarlo nuevamente a la plataforma para continuar la edición.', margin + 48, pageHeight - 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkSlate);
    doc.text(`Pág. ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ==========================================
  // PÁGINA 1: DASHBOARD DE AVANCES Y GRÁFICOS
  // ==========================================
  drawPageHeader('INFORME EJECUTIVO DE AVANCES');
  currentY = 22;

  // Banner Titular Principal
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkSlate);
  doc.text(`AVANCES DE CARACTERIZACIÓN: ${process.name.toUpperCase()}`, margin + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Código: ${process.code || 'PR-001'} | Versión: ${process.version || '01'} | Categoría: Proceso ${process.category} | Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin + 4, currentY + 13);
  doc.text(`Organización: ${orgContext.name || 'Empresa'} (NIT: ${orgContext.nit || 'N/A'}) | Líder Responsable: ${process.leaderRole || 'Por definir'}`, margin + 4, currentY + 19);

  currentY += 28;

  // TARJETA 1: GRÁFICA DE PORCENTAJE TOTAL DE AVANCE (Barra Gráfica Vectorial)
  doc.setFillColor(...lightSlate);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(...borderSlate);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkSlate);
  doc.text('1. Nivel de Avance de la Caracterización del Proceso', margin + 4, currentY + 6);

  // Insignia de porcentaje
  const badgeWidth = 26;
  const badgeHeight = 7;
  const badgeX = pageWidth - margin - badgeWidth - 4;
  const badgeY = currentY + 2.5;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`${progress.totalScore}% Listo`, badgeX + badgeWidth / 2, badgeY + 4.8, { align: 'center' });

  // Barra de progreso visual
  const barX = margin + 4;
  const barY = currentY + 11;
  const barWidth = contentWidth - 8;
  const barHeight = 6;

  // Fondo barra
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(barX, barY, barWidth, barHeight, 1.5, 1.5, 'F');

  // Relleno barra de progreso
  const fillWidth = Math.max(2, (barWidth * progress.totalScore) / 100);
  doc.setFillColor(...primaryColor);
  doc.roundedRect(barX, barY, fillWidth, barHeight, 1.5, 1.5, 'F');

  // Texto explicativo bajo la barra
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  const statusSummary = progress.totalScore === 100 
    ? '¡Ficha completa! Cumple con todos los requisitos para aprobación y auditoría ISO 9001:2015.'
    : progress.totalScore >= 60 
    ? 'Avance significativo: Se han estructurado los componentes operativos principales. Faltan detalles de formalización.'
    : 'Avance inicial en construcción: Continúa aportando entradas, flujograma y controles para finalizar.';
  doc.text(statusSummary, margin + 4, currentY + 22);

  currentY += 30;

  // TARJETA 2: ESTADO GRÁFICO DE LAS 6 ETAPAS DEL PROCESO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkSlate);
  doc.text('2. Desglose del Progreso por Módulos de Construcción', margin, currentY);
  currentY += 4;

  const colWidth = (contentWidth - (5 * 2)) / 6;
  progress.steps.forEach((st, idx) => {
    const cardX = margin + (idx * (colWidth + 2));
    const cardY = currentY;
    const cardH = 20;

    // Fondo y borde según estado
    if (st.done) {
      doc.setFillColor(236, 253, 245); // Emerald-50
      doc.setDrawColor(...primaryColor);
    } else {
      doc.setFillColor(255, 247, 237); // Orange-50
      doc.setDrawColor(...secondaryColor);
    }
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, cardY, colWidth, cardH, 1.5, 1.5, 'FD');

    // Número de paso
    doc.setFillColor(st.done ? primaryColor[0] : secondaryColor[0], st.done ? primaryColor[1] : secondaryColor[1], st.done ? primaryColor[2] : secondaryColor[2]);
    doc.circle(cardX + 4, cardY + 4.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(String(st.step), cardX + 4, cardY + 5.5, { align: 'center' });

    // Estado Icono / Check
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(st.done ? primaryColor[0] : secondaryColor[0], st.done ? primaryColor[1] : secondaryColor[1], st.done ? primaryColor[2] : secondaryColor[2]);
    doc.text(st.done ? 'COMPLETADO' : 'PENDIENTE', cardX + colWidth - 2, cardY + 5.5, { align: 'right' });

    // Título de la etapa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...darkSlate);
    const splitTitle = doc.splitTextToSize(st.name, colWidth - 4);
    doc.text(splitTitle, cardX + 2, cardY + 11);
  });

  currentY += 25;

  // TARJETA 3: GRÁFICO DEL BALANCE DEL CICLO DEMING (PHVA)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkSlate);
  doc.text('3. Balance Gráfico del Ciclo Deming (PHVA / ISO 9001:2015)', margin, currentY);
  currentY += 4;

  doc.setFillColor(...lightSlate);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'F');
  doc.setDrawColor(...borderSlate);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'S');

  // Cuatro bloques gráficos para P, H, V, A
  const demingStages = [
    { key: 'Planear', label: 'P - PLANEAR', count: progress.demingCounts.Planear, color: [234, 88, 12] as [number, number, number], desc: 'Objetivos, metas y planes' },
    { key: 'Hacer', label: 'H - HACER', count: progress.demingCounts.Hacer, color: [4, 120, 87] as [number, number, number], desc: 'Ejecución y transformación' },
    { key: 'Verificar', label: 'V - VERIFICAR', count: progress.demingCounts.Verificar, color: [217, 119, 6] as [number, number, number], desc: 'Control, auditoría y KPIs' },
    { key: 'Actuar', label: 'A - ACTUAR', count: progress.demingCounts.Actuar, color: [124, 58, 237] as [number, number, number], desc: 'Mejora y contingencias' }
  ];

  const dBlockWidth = (contentWidth - 10) / 4;
  demingStages.forEach((ds, idx) => {
    const bX = margin + 2 + (idx * (dBlockWidth + 2));
    const bY = currentY + 3;
    const bH = 20;

    // Caja interior
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bX, bY, dBlockWidth, bH, 1.5, 1.5, 'F');
    doc.setDrawColor(...ds.color);
    doc.setLineWidth(0.6);
    doc.roundedRect(bX, bY, dBlockWidth, bH, 1.5, 1.5, 'S');

    // Título de la etapa
    doc.setFillColor(...ds.color);
    doc.roundedRect(bX, bY, dBlockWidth, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(ds.label, bX + (dBlockWidth / 2), bY + 3.8, { align: 'center' });

    // Contador de actividades
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...ds.color);
    doc.text(String(ds.count), bX + 6, bY + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...textMuted);
    doc.text('actividades', bX + 13, bY + 12);
    doc.text(ds.desc, bX + 3, bY + 18, { maxWidth: dBlockWidth - 6 });
  });

  // Mensaje de auditoría PHVA al pie de la tarjeta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (progress.isDemingBalanced) {
    doc.setTextColor(...primaryColor);
    doc.text('✓ Ciclo PHVA Balanceado: El proceso cuenta con actividades en las 4 fases de Deming.', margin + 4, currentY + 28);
  } else {
    doc.setTextColor(...secondaryColor);
    doc.text('! Atención: El ciclo PHVA presenta fases vacías. Se recomienda agregar actividades en las etapas con 0.', margin + 4, currentY + 28);
  }

  currentY += 37;

  // TARJETA 4: RESUMEN GRÁFICO DE ALCANCE Y LÍMITES DEL PROCESO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkSlate);
  doc.text('4. Alcance Operativo: Límites y Entregables', margin, currentY);
  currentY += 4;

  const scopeBoxW = (contentWidth - 12) / 2;
  const scopeBoxH = 18;

  // Caja de Inicio / Disparador
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, scopeBoxW, scopeBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(...secondaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, scopeBoxW, scopeBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...secondaryColor);
  doc.text('INICIO DEL PROCESO (Evento Disparador):', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  const startLines = doc.splitTextToSize(process.scopeStart || 'No especificado aún.', scopeBoxW - 6);
  doc.text(startLines, margin + 3, currentY + 10);

  // Flecha central
  const arrowX = margin + scopeBoxW + 6;
  const arrowY = currentY + (scopeBoxH / 2);
  doc.setFillColor(...primaryColor);
  doc.triangle(arrowX + 2, arrowY, arrowX - 2, arrowY - 3, arrowX - 2, arrowY + 3, 'F');

  // Caja de Fin / Entregable
  const endBoxX = margin + scopeBoxW + 12;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(endBoxX, currentY, scopeBoxW, scopeBoxH, 1.5, 1.5, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(endBoxX, currentY, scopeBoxW, scopeBoxH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryColor);
  doc.text('FINAL DEL PROCESO (Entregable / Salida Final):', endBoxX + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  const endLines = doc.splitTextToSize(process.scopeEnd || 'No especificado aún.', scopeBoxW - 6);
  doc.text(endLines, endBoxX + 3, currentY + 10);

  currentY += 23;

  // TARJETA INFORMATIVA DE REIMPORTACIÓN
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('¿CÓMO REANUDAR Y TERMINAR LA FICHA CON ESTE ARCHIVO?', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.text('Este documento PDF contiene una copia digital exacta y estructurada de todos los avances. Para continuar editándolo, simplemente entra a la plataforma y presiona el botón «Importar» en la barra superior o en el modal de guardado, seleccionando este mismo archivo .pdf.', margin + 4, currentY + 10, { maxWidth: contentWidth - 8 });

  drawPageFooter(1, 3);

  // ==============================================================
  // PÁGINA 2: PROCEDIMIENTO ACTUAL DE LA EMPRESA Y FLUJOGRAMA (PASO 3)
  // ==============================================================
  doc.addPage();
  drawPageHeader('MÓDULO 3: FLUJOGRAMA Y PROCEDIMIENTO ACTUAL');
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkSlate);
  doc.text('Conocimiento del Procedimiento que Realiza Actualmente la Empresa', margin, currentY);
  currentY += 5;

  // Caja de texto del procedimiento actual
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);
  doc.text('DESCRIPCIÓN OPERATIVA DEL PROCEDIMIENTO ACTUAL:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkSlate);
  const procDesc = process.currentProcedureSummary || 'El usuario aún no ha aportado la descripción narrativa del procedimiento actual de la empresa.';
  const splitProc = doc.splitTextToSize(procDesc, contentWidth - 8);
  doc.text(splitProc.slice(0, 4), margin + 4, currentY + 10);

  currentY += 28;

  // Observaciones si existen
  if (process.currentProcedureNotes) {
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text('NOTAS Y OBSERVACIONES PRÁCTICAS:', margin + 4, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(146, 64, 14);
    const splitNotes = doc.splitTextToSize(process.currentProcedureNotes, contentWidth - 8);
    doc.text(splitNotes.slice(0, 2), margin + 4, currentY + 8);

    currentY += 16;
  }

  // Diagrama de Flujo Paso a Paso
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkSlate);
  doc.text('Diagrama de Flujo de Operaciones (Flujograma Representativo)', margin, currentY);
  currentY += 5;

  // Tabla con los pasos del flujograma y el procedimiento práctico
  const flowchartData = (process.activities || []).map((act, index) => {
    const stepTypeLabel = act.stepType === 'decision' 
      ? 'Decisión' 
      : act.stepType === 'document' 
      ? 'Documento' 
      : act.stepType === 'milestone' 
      ? 'Hito' 
      : 'Operación';

    const practicalDesc = act.procedureDescription || act.description || 'Paso estándar del procedimiento.';
    const decisionText = act.decisionCriteria ? ` [Criterio: ${act.decisionCriteria}]` : '';

    return [
      String(act.number || index + 1),
      act.stage,
      stepTypeLabel,
      act.name,
      practicalDesc + decisionText,
      act.responsibleRole || 'Líder'
    ];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Fase', 'Tipo Paso', 'Nombre de la Actividad / Decisión', 'Cómo se realiza en la práctica (Procedimiento Empresa)', 'Responsable']],
    body: flowchartData.length > 0 ? flowchartData : [['1', 'Planear', 'Operación', 'Inicio del proceso', 'Pendiente de definir', 'Líder']],
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: borderSlate,
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 16, fontStyle: 'bold' },
      2: { cellWidth: 16 },
      3: { cellWidth: 40, fontStyle: 'bold' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 26 }
    },
    didDrawCell: (data) => {
      // Colorear badge de etapa
      if (data.section === 'body' && data.column.index === 1) {
        const text = String(data.cell.raw);
        if (text === 'Planear') doc.setTextColor(...secondaryColor);
        else if (text === 'Hacer') doc.setTextColor(...primaryColor);
        else if (text === 'Verificar') doc.setTextColor(217, 119, 6);
        else if (text === 'Actuar') doc.setTextColor(124, 58, 237);
      }
    }
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ENTRADAS GLOBALES Y REQUISITOS (PASO 4)
  if (currentY < pageHeight - 50) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkSlate);
    doc.text('Entradas Globales Requeridas para la Construcción del Proceso', margin, currentY);
    currentY += 4;

    const globalInputsList = process.globalInputs && process.globalInputs.length > 0
      ? process.globalInputs
      : ['Requisitos legales y reglamentarios', 'Directrices estratégicas de la gerencia', 'Expectativas y necesidades de los clientes'];

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, Math.min(30, (globalInputsList.length * 5) + 6), 1.5, 1.5, 'FD');
    doc.setDrawColor(...borderSlate);
    doc.roundedRect(margin, currentY, contentWidth, Math.min(30, (globalInputsList.length * 5) + 6), 1.5, 1.5, 'S');

    globalInputsList.slice(0, 5).forEach((inputItem, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...primaryColor);
      doc.text('•', margin + 4, currentY + 4 + (idx * 5));

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkSlate);
      doc.text(inputItem, margin + 8, currentY + 4 + (idx * 5), { maxWidth: contentWidth - 12 });
    });
  }

  drawPageFooter(2, 3);

  // ==============================================================
  // PÁGINA 3: MATRIZ SIPOC, CONTROLES, KPIS Y FIRMAS OFICIALES
  // ==============================================================
  doc.addPage();
  drawPageHeader('MÓDULOS 4, 5 Y 6: SIPOC, KPIS Y APROBACIONES');
  currentY = 22;

  // 1. Matriz SIPOC Completa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkSlate);
  doc.text('Matriz SIPOC (Proveedor -> Entrada -> Actividad -> Salida -> Cliente)', margin, currentY);
  currentY += 4;

  const sipocRows = (process.activities || []).map((act) => [
    act.stage,
    act.supplier || 'N/A',
    act.inputs || 'N/A',
    act.name,
    act.outputs || 'N/A',
    act.customer || 'N/A'
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Etapa PHVA', 'Proveedor', 'Entradas / Insumos', 'Actividad Clave', 'Salidas / Entregables', 'Cliente']],
    body: sipocRows.length > 0 ? sipocRows : [['Planear', 'Dirección', 'Requisitos', 'Planificar', 'Plan', 'Operaciones']],
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: borderSlate,
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 28 },
      2: { cellWidth: 34 },
      3: { cellWidth: 38, fontStyle: 'bold' },
      4: { cellWidth: 34 },
      5: { cellWidth: 'auto' }
    }
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // 2. Indicadores de Gestión y Controles (Paso 5)
  if (currentY < pageHeight - 70) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...darkSlate);
    doc.text('Indicadores de Gestión (KPIs) y Plan de Medición', margin, currentY);
    currentY += 4;

    const kpiRows = (process.indicators || []).map((ind) => [
      ind.name,
      ind.formula,
      ind.target,
      ind.frequency,
      ind.responsible
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Indicador de Gestión', 'Fórmula de Cálculo', 'Meta Esperada', 'Frecuencia', 'Responsable']],
      body: kpiRows.length > 0 ? kpiRows : [['Cumplimiento del Proceso', '(Ejecutado/Programado)*100', '≥ 90%', 'Mensual', 'Líder del Proceso']],
      theme: 'grid',
      styles: {
        fontSize: 6.5,
        cellPadding: 1.5,
        lineColor: borderSlate,
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 55 },
        2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // 3. Cuadro de Firmas Oficiales y Aprobación
  const sigBoxW = (contentWidth - 6) / 3;
  const sigBoxH = 22;
  const sigY = pageHeight - 38;

  const signaturesData = [
    { label: 'ELABORÓ (Líder del Proceso)', sig: process.approvals?.elaboratedBy },
    { label: 'REVISÓ (Calidad / SIG)', sig: process.approvals?.reviewedBy },
    { label: 'APROBÓ (Alta Dirección)', sig: process.approvals?.approvedBy }
  ];

  signaturesData.forEach((item, idx) => {
    const sX = margin + (idx * (sigBoxW + 3));
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(sX, sigY, sigBoxW, sigBoxH, 1, 1, 'F');
    doc.setDrawColor(...borderSlate);
    doc.setLineWidth(0.4);
    doc.roundedRect(sX, sigY, sigBoxW, sigBoxH, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...primaryColor);
    doc.text(item.label, sX + 2, sigY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...darkSlate);
    doc.text(`Nombre: ${item.sig?.name || '________________________'}`, sX + 2, sigY + 10);
    doc.text(`Cargo: ${item.sig?.role || 'Líder / Responsable'}`, sX + 2, sigY + 14);
    doc.text(`Fecha: ${item.sig?.date || new Date().toISOString().split('T')[0]}`, sX + 2, sigY + 18);
  });

  drawPageFooter(3, 3);

  // =========================================================================
  // EMBEBER LOS DATOS ESTRUCTURADOS DEL PROCESO PARA REIMPORTACIÓN DIRECTA
  // =========================================================================
  // Empaquetamos el respaldo completo en formato estándar
  const snapshotData = {
    format: 'ISO9001_PROCESS_CHARACTERIZATION_HYBRID_PDF',
    version: '1.2',
    exportedAt: new Date().toISOString(),
    organization: orgContext,
    process: process,
    processes: processes.length > 0 ? processes : [process],
    jobPositions: jobPositions,
    activeProcessId: process.id
  };

  const jsonString = JSON.stringify(snapshotData);
  const base64Data = utf8ToBase64(jsonString);

  // 1. Guardar en metadatos del PDF
  doc.setProperties({
    title: `Avances Caracterización - ${process.name}`,
    subject: `Respaldo Híbrido ISO 9001: ${process.code}`,
    author: orgContext.name || 'GestorProcesos ISO 9001',
    keywords: `ISO9001,GestorProcesos,Caracterizacion,${process.name}`,
    creator: 'GestorProcesos Build Platform'
  });

  // 2. Obtener Blob del PDF generado
  const pdfBlob = doc.output('blob');

  // 3. Incrustar los delimitadores binarios al final del PDF
  // La especificación de PDF ignora los datos después de %%EOF durante la visualización,
  // permitiendo que el PDF sea 100% visual y a su vez un contenedor exacto de datos.
  const payloadBytes = `\n${PDF_DATA_MARKER_START}\n${base64Data}\n${PDF_DATA_MARKER_END}\n`;
  const hybridBlob = new Blob([pdfBlob, payloadBytes], { type: 'application/pdf' });

  // Nombre del archivo
  const procClean = (process.name || 'Proceso').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Avances_Caracterizacion_${procClean}_${dateStr}.pdf`;

  // Descarga o Compartir en PC y Celular
  const supportsShare = typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;
  if (supportsShare) {
    try {
      const file = new File([hybridBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Avances de Caracterización - ${process.name}`,
          text: `Documento PDF interactivo de avances con respaldo reimportable.`,
          files: [file]
        });
        return { success: true, filename, blob: hybridBlob, shared: true };
      }
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error && error.name === 'AbortError') {
        return { success: true, filename, blob: hybridBlob, shared: false };
      }
      console.warn('Fallback a descarga directa en navegador', err);
    }
  }

  // Descarga directa tradicional
  const url = URL.createObjectURL(hybridBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  return { success: true, filename, blob: hybridBlob, shared: false };
}

/**
 * Extrae los datos del proceso embebidos dentro de un archivo PDF híbrido
 */
export async function extractProcessDataFromPDF(file: File): Promise<{
  process?: ProcessCharacterization;
  processes?: ProcessCharacterization[];
  organization?: OrgContext;
  jobPositions?: JobPosition[];
  activeProcessId?: string;
} | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;

        // Búsqueda de delimitadores en el contenido del archivo
        const startIndex = text.indexOf(PDF_DATA_MARKER_START);
        const endIndex = text.indexOf(PDF_DATA_MARKER_END);

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const rawBase64 = text.substring(startIndex + PDF_DATA_MARKER_START.length, endIndex).trim();
          const jsonText = base64ToUtf8(rawBase64);
          const parsed = JSON.parse(jsonText);
          resolve(parsed);
          return;
        }

        // Si no se encontró en el delimitador directo, revisar si se guardó como string JSON directo
        resolve(null);
      } catch (err) {
        console.error('Error al parsear datos embebidos del PDF', err);
        resolve(null);
      }
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo PDF.'));
    };

    reader.readAsText(file);
  });
}
