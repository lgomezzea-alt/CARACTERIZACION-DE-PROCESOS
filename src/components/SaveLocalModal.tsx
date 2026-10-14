import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Download, 
  Upload, 
  Share2, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  HardDrive, 
  Clock, 
  ShieldCheck,
  Building2,
  FolderGit2,
  FileDown
} from 'lucide-react';
import { OrgContext, ProcessCharacterization, JobPosition } from '../types/process';
import { downloadLocalBackupFile, shareOrDownloadBackupFile } from '../utils/storage';

interface SaveLocalModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgContext: OrgContext;
  processes: ProcessCharacterization[];
  jobPositions: JobPosition[];
  activeProcessId: string;
  hasUnsavedChanges: boolean;
  lastSavedTime: string | null;
  onSaveBrowserStorage: () => void;
  onImportBackupFile: (file: File) => void;
  onGenerateProgressPDF?: () => void;
  isGeneratingPDF?: boolean;
}

export const SaveLocalModal: React.FC<SaveLocalModalProps> = ({
  isOpen,
  onClose,
  orgContext,
  processes,
  jobPositions,
  activeProcessId,
  hasUnsavedChanges,
  lastSavedTime,
  onSaveBrowserStorage,
  onImportBackupFile,
  onGenerateProgressPDF,
  isGeneratingPDF = false
}) => {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  const supportsShare = typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator;

  const handleDownloadFile = () => {
    setIsProcessing(true);
    try {
      // Primero aseguramos guardado en memoria del navegador
      onSaveBrowserStorage();
      const res = downloadLocalBackupFile(orgContext, processes, jobPositions, activeProcessId);
      setDownloadSuccessMessage(`¡Archivo "${res.filename}" guardado exitosamente en tus Descargas!`);
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
    } catch (e) {
      console.error('Error al descargar archivo local', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareMobile = async () => {
    setIsProcessing(true);
    try {
      onSaveBrowserStorage();
      const res = await shareOrDownloadBackupFile(orgContext, processes, jobPositions, activeProcessId);
      if (res.shared) {
        setDownloadSuccessMessage('¡Avances compartidos y guardados con éxito!');
      } else {
        setDownloadSuccessMessage(`¡Archivo "${res.filename}" descargado en tu dispositivo!`);
      }
      setTimeout(() => setDownloadSuccessMessage(null), 5000);
    } catch (e) {
      console.error('Error al compartir archivo', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Encabezado */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Guardar Avances en tu Dispositivo
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Almacenamiento seguro en tu computador o celular (sin requerir servidores externos)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del paquete de avances */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{orgContext.name || 'Sin empresa'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>{processes.length}</strong> {processes.length === 1 ? 'proceso' : 'procesos'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-600">
              <span><strong>{jobPositions.length}</strong> cargos</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {lastSavedTime ? `Última grabación: ${lastSavedTime}` : 'Sin grabación manual aún'}
            </span>
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                Cambios pendientes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800">
                Al día
              </span>
            )}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {downloadSuccessMessage && (
            <div className="p-3.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs">{downloadSuccessMessage}</p>
                <p className="text-[11px] text-orange-700 mt-0.5">
                  Tus datos se encuentran resguardados en este dispositivo. Puedes transferir el archivo o abrirlo en cualquier momento.
                </p>
              </div>
            </div>
          )}

          {/* Tarjeta 1: Descargar archivo local (La forma más segura y permanente para Celular y PC) */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 relative">
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {isMobile ? <Smartphone className="w-3 h-3" /> : <Laptop className="w-3 h-3" />}
              <span>Recomendado</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-16 sm:pr-20">
                <h3 className="font-bold text-sm text-slate-900">
                  Descargar archivo local en tu {isMobile ? 'Celular' : 'Computador'} (.json)
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  Guarda un archivo físico completo con todas las caracterizaciones, mapa de procesos, cargos y formatos en la carpeta de <strong>Descargas</strong> o <strong>Archivos</strong> de tu equipo.
                </p>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-500 list-disc list-inside">
                  <li>No se borra aunque limpies el historial o las cookies de tu navegador.</li>
                  <li>Puedes llevarlo en una USB, enviártelo por correo o compartirlo por WhatsApp.</li>
                  <li>Permite continuar tu trabajo en cualquier computador o celular.</li>
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadFile}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo a este dispositivo</span>
                  </button>

                  {supportsShare && (
                    <button
                      onClick={handleShareMobile}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Guardar / Compartir en Celular</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Guardar en memoria local del navegador (LocalStorage) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <Save className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Guardar en el almacenamiento del navegador
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  Almacena tus avances en la memoria interna de este navegador (Chrome, Edge, Safari, Firefox). Se recargará automáticamente la próxima vez que abras esta aplicación en este mismo equipo o celular.
                </p>
                
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSaveBrowserStorage();
                      setDownloadSuccessMessage('¡Avances grabados con éxito en la memoria del navegador!');
                      setTimeout(() => setDownloadSuccessMessage(null), 4000);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar en navegador ahora</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Generar Avances en PDF (Híbrido y Reimportable) */}
          {onGenerateProgressPDF && (
            <div className="p-4 sm:p-5 rounded-2xl border border-orange-200 bg-orange-50/50">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-orange-600 text-white shrink-0 shadow-xs">
                  <FileDown className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      Generar Avances en PDF (con Textos, Gráficos y Reimportable)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-200 text-orange-900">
                      Reimportable
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1">
                    Crea un informe ejecutivo en PDF que incluye el estado de avance, barras de porcentaje, gráfica del ciclo Deming PHVA, alcance, flujograma y matriz SIPOC. Este mismo PDF puede ser importado más adelante para reanudar el trabajo y terminar la ficha.
                  </p>

                  <div className="mt-3">
                    <button
                      onClick={() => {
                        onGenerateProgressPDF();
                        onClose();
                      }}
                      disabled={isGeneratingPDF}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition"
                    >
                      <FileDown className={`w-4 h-4 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
                      <span>{isGeneratingPDF ? 'Generando PDF...' : 'Generar y Descargar PDF de Avances'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta 4: Restaurar archivo local previo (JSON o PDF) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-slate-900">
                  Cargar / Restaurar avances desde tu computador o celular
                </h3>
                <p className="text-slate-600 text-xs mt-1">
                  ¿Tienes un archivo <code>.pdf</code> o <code>.json</code> guardado previamente en tu computador o teléfono? Selecciónalo para restaurar todas tus caracterizaciones al instante y terminar tu ficha.
                </p>

                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seleccionar archivo .pdf o .json del dispositivo</span>
                    <input
                      type="file"
                      accept=".json,.pdf,application/pdf,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImportBackupFile(file);
                          setDownloadSuccessMessage(`¡Archivo "${file.name}" cargado y restaurado exitosamente!`);
                          setTimeout(() => setDownloadSuccessMessage(null), 5000);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Nota de garantía de privacidad */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p>
              <strong>Privacidad y seguridad total:</strong> Todos los datos de caracterización se gestionan localmente en el cliente (tu equipo o celular). No se envían a servidores de terceros y se mantienen bajo tu control absoluto.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Formato estándar compatible con ISO 9001:2015
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition"
          >
            Listo / Volver a la Caracterización
          </button>
        </div>

      </div>
    </div>
  );
};
