import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share2, 
  Check, 
  Copy, 
  X, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive,
  Laptop
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallShortcutModal: React.FC<InstallShortcutModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install, downloadDesktopShortcut } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pc' | 'android' | 'ios'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'pc'
  );
  const [copied, setCopied] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        setInstalledSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 text-orange-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Crear Acceso Directo e Instalar</h2>
              <p className="text-xs text-emerald-100">
                Accede en 1 clic desde el escritorio de tu PC o la pantalla de tu Celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Highlights */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Direct Actions Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-orange-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {isInstalled 
                      ? '✓ Aplicación ya instalada en este dispositivo' 
                      : 'Instalación Rápida con 1 Clic'}
                  </h3>
                  <p className="text-xs text-emerald-800">
                    {isInstalled 
                      ? 'Esta ventana ya se está ejecutando como aplicación independiente.' 
                      : 'Configura el acceso directo automático para abrir como app de escritorio o móvil.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isInstallable && !isInstalled && (
                  <button
                    onClick={handleTriggerInstall}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicación Ahora</span>
                  </button>
                )}

                <button
                  onClick={downloadDesktopShortcut}
                  className="px-4 py-2 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                  title="Descargar archivo .url para colocar en el escritorio de Windows"
                >
                  <Laptop className="w-4 h-4 text-emerald-700" />
                  <span>Descargar Acceso Directo PC (.url)</span>
                </button>
              </div>
            </div>

            {installedSuccess && (
              <div className="mt-3 p-2 bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-orange-300" />
                <span>¡Excelente! La aplicación fue instalada con éxito en tu escritorio.</span>
              </div>
            )}
          </div>

          {/* Device Tabs */}
          <div>
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('pc')}
                className={`flex-1 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'pc'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>PC / Laptop (Windows & Mac)</span>
              </button>

              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'android'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Celulares Android</span>
              </button>

              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'ios'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>iPhone / iPad (iOS)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-4">
              {activeTab === 'pc' && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white inline-flex items-center justify-center text-[10px] font-bold">1</span>
                      Opción A: Descargar el archivo de acceso directo (.url)
                    </p>
                    <p className="text-slate-600 mb-2">
                      Haz clic en el botón superior <strong>«Descargar Acceso Directo PC (.url)»</strong>. El archivo descargado (<code>GestorProcesos ISO.url</code>) lo puedes mover o arrastrar directamente a tu Escritorio de Windows.
                    </p>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center justify-between">
                      <span className="text-[11px] font-medium">Al hacer doble clic en el escritorio, se abrirá al instante la plataforma.</span>
                      <button
                        onClick={downloadDesktopShortcut}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition"
                      >
                        Descargar archivo
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px] font-bold">2</span>
                      Opción B: Instalar como Aplicación Nativa de Escritorio (PWA)
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>
                        En <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong>, mira el extremo derecho de la barra de direcciones (donde escribes la URL) y busca el icono con una pantalla y flecha hacia abajo (o símbolo <strong>⊕</strong>).
                      </li>
                      <li>
                        Haz clic en <strong>«Instalar GestorProcesos»</strong>.
                      </li>
                      <li>
                        La plataforma se abrirá en una ventana propia sin barras de navegación, exactamente igual que un software de escritorio instalado en tu computador.
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-slate-600 text-white inline-flex items-center justify-center text-[10px] font-bold">3</span>
                      Opción C: Crear acceso directo manual desde el navegador
                    </p>
                    <p className="text-slate-600">
                      En el menú del navegador (tres puntos ⋮ en la esquina superior derecha), ve a <strong>Guardar y compartir</strong> &rarr; <strong>Crear acceso directo...</strong> Marca la casilla <em>«Abrir como ventana»</em> y haz clic en Crear.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'android' && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-2 text-xs">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      Pasos para Celulares con Google Chrome o Samsung Internet:
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                      <li>
                        Abre esta plataforma en el navegador <strong>Google Chrome</strong> de tu celular.
                      </li>
                      <li>
                        Toca el botón de <strong>tres puntos verticales (⋮)</strong> situado en la esquina superior derecha.
                      </li>
                      <li>
                        En el menú desplegable, toca la opción <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.
                      </li>
                      <li>
                        Confirma tocando <strong>«Instalar»</strong> o <strong>«Agregar»</strong>.
                      </li>
                      <li>
                        ¡Listo! En la pantalla de inicio de tu celular aparecerá el icono oficial de la app con el logotipo del Ciclo Deming ISO para entrar directamente.
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Consejo de guardado:</strong> Recuerda usar el botón <em>«Guardar Avances»</em> en la barra superior antes de cerrar la app en tu celular para sincronizar tus avances.
                  </div>
                </div>
              )}

              {activeTab === 'ios' && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="font-bold text-emerald-950 flex items-center gap-2 text-xs">
                      <Share2 className="w-4 h-4 text-emerald-700" />
                      Pasos para iPhone o iPad (Navegador Safari):
                    </h4>
                    <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                      <li>
                        Abre el enlace de la plataforma en el navegador <strong>Safari</strong> de tu iPhone.
                      </li>
                      <li>
                        Toca el botón <strong>Compartir</strong> <span className="font-bold">⎋</span> (el icono de un cuadro con una flecha que apunta hacia arriba en la barra inferior).
                      </li>
                      <li>
                        Desplázate hacia abajo por el menú de acciones y selecciona <strong>«Agregar al inicio»</strong> (o <em>«Añadir a pantalla de inicio»</em>).
                      </li>
                      <li>
                        En la esquina superior derecha de la ventana emergente, toca <strong>«Agregar»</strong>.
                      </li>
                      <li>
                        El icono de GestorProcesos se creará en el escritorio de tu iPhone con soporte a pantalla completa.
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Enlace directo a esta plataforma (para enviártelo a tu celular por WhatsApp o Correo):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-orange-300" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PWA Oficial compatible con Windows, Mac, Android e iOS</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
