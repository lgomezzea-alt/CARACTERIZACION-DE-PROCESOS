import React from 'react';
import { AlertTriangle, Save, LogOut, X, CheckCircle2, ShieldAlert, Download, HardDrive } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnsavedChanges: boolean;
  onSaveAndExit: () => void;
  onDownloadAndExit?: () => void;
  onForceExit: () => void;
  activeProcessName?: string;
  lastSavedTime?: string | null;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onClose,
  hasUnsavedChanges,
  onSaveAndExit,
  onDownloadAndExit,
  onForceExit,
  activeProcessName,
  lastSavedTime
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800">
        
        {/* Header con alerta visual */}
        <div className={`p-5 flex items-start gap-4 border-b ${
          hasUnsavedChanges 
            ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}>
          <div className={`p-3 rounded-xl shrink-0 ${
            hasUnsavedChanges 
              ? 'bg-amber-100 text-amber-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {hasUnsavedChanges ? (
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-orange-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold leading-tight">
              {hasUnsavedChanges 
                ? '¡Atención! Cambios pendientes por grabar' 
                : '¿Deseas salir de la plataforma?'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {hasUnsavedChanges 
                ? 'No puedes salir sin grabar los avances en la caracterización para evitar la pérdida de información.' 
                : 'Todos tus avances de caracterización se encuentran debidamente grabados.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            title="Cancelar y permanecer aquí"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Detalle */}
        <div className="p-5 text-xs text-slate-600 space-y-3">
          {activeProcessName && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Proceso en caracterización:
              </span>
              <span className="font-semibold text-slate-800 text-sm">
                {activeProcessName}
              </span>
              {lastSavedTime && (
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Última grabación registrada: <strong className="text-slate-700">{lastSavedTime}</strong>
                </span>
              )}
            </div>
          )}

          {hasUnsavedChanges ? (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Aviso de seguridad ISO 9001:</span>
                <p className="mt-0.5">
                  Para no perder tus avances, te recomendamos grabar en la memoria local o descargar una copia física en tu computador o celular antes de cerrar la sesión.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Todo al día:</span>
                <p className="mt-0.5">
                  Tus avances están resguardados en este dispositivo. Puedes salir con total confianza o descargar un archivo de respaldo adicional.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Acciones del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
            {hasUnsavedChanges ? (
              <button
                type="button"
                onClick={onSaveAndExit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition active:scale-95"
                title="Guarda en memoria y descarga archivo de respaldo en tu computador o celular antes de salir"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Avances en PC / Celular y Salir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onForceExit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Confirmar Salida Segura</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1"
            >
              Permanecer en la plataforma
            </button>

            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={onForceExit}
                className="text-[11px] text-slate-400 hover:text-red-600 transition py-1"
                title="Salir descartando los últimos cambios no guardados manualmente"
              >
                Salir sin grabar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
