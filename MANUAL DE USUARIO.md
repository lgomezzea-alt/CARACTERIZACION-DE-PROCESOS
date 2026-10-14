# MANUAL DE USUARIO
## Sistema de Caracterización de Procesos y Gestión del Ciclo Deming (PHVA)
### Conforme a la Norma Internacional ISO 9001:2015

---

## 📌 1. INTRODUCCIÓN Y PROPÓSITO DE LA PLATAFORMA

Bienvenido a la **Plataforma de Caracterización de Procesos y Ciclo Deming (ISO 9001:2015)**. Esta aplicación web ha sido concebida como una herramienta integral, intuitiva y metodológicamente rigurosa para estructurar, estandarizar, auditar y documentar el Sistema de Gestión de Calidad (SGC) de cualquier organización.

### 🎯 Objetivos Principales:
1. **Estandarizar los Procesos:** Garantizar que cada proceso cuente con su ficha técnica oficial de caracterización conforme a los numerales 4.4, 7 y 8 de la norma ISO 9001:2015.
2. **Garantizar el Ciclo PHVA:** Asegurar que ningún proceso sea meramente lineal u operativo, sino que cumpla de forma continua con las cuatro fases de Deming: **Planear (P)**, **Hacer (H)**, **Verificar (V)** y **Actuar (A)**.
3. **Asegurar la Trazabilidad Interprocesos (Enfoque Sistémico):** Interconectar el Contexto Organizacional, el Manual de Cargos, el Mapa de Procesos, el Flujograma gráfico, la Matriz SIPOC y el Plan de Seguimiento y Control.
4. **Facilitar la Auditoría y Exportación:** Generar fichas técnicas imprimibles de 2 páginas idénticas al formato oficial de auditoría, así como exportaciones en formatos estructurados (**JSON** para respaldos e importaciones, y **CSV/Excel** para análisis de datos).

---

## 🏛️ 2. ARQUITECTURA DE LA INTERFAZ: LOS 3 NIVELES DE NAVEGACIÓN

Para brindar una experiencia ordenada sin saturar la pantalla, la botonera superior está dividida en **3 niveles jerárquicos**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ NIVEL 1: GESTIÓN EMPRESARIAL, PROCESO ACTIVO, CARGOS Y HERRAMIENTAS    │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 2: RUTA METODOLÓGICA DE 6 PASOS (1 -> 2 -> 3 -> 4 -> 5 -> 6)     │
├────────────────────────────────────────────────────────────────────────┤
│ NIVEL 3: COMANDOS CONTEXTUALES DEL PASO ACTIVO Y ACCIONES RÁPIDAS      │
└────────────────────────────────────────────────────────────────────────┘
```

### 🔹 Nivel 1: Nivel Corporativo y Utilidades Globales
Ubicado en la franja oscura superior (`bg-slate-900`):
- **Identidad Organizacional (Botón Izquierdo):** Muestra el logo o iniciales, la razón social y el NIT. Al hacer clic se abre el modal de **Contexto Organizacional**.
- **Selector de Proceso Activo:** Menú desplegable que lista todos los procesos registrados, su código y su categoría. Permite cambiar instantáneamente de proceso en edición.
- **Acciones sobre el Proceso:**
  - `+ Nuevo Proceso`: Crea un proceso en blanco.
  - `Duplicar`: Clona el proceso activo para crear variantes rápidamente.
  - `Importar JSON`: Restaura procesos o caracterizaciones previamente guardadas.
- **Herramientas Transversales:**
  - `Mapa de Procesos`: Visualiza la red completa de procesos y el semáforo de salud PHVA.
  - `Manual de Cargos`: Administra los perfiles de cargo, sus responsabilidades y competencias.
  - `Plantillas ISO`: Permite cargar procesos prototipo prediseñados (Estratégico, Comercial, Operativo, Gestión Humana, etc.).
  - `Imprimir / PDF` (Ficha Oficial): Salta directamente a la vista oficial para impresión o descarga PDF.
  - `💾 Guardar Avances`: Botón ubicado en la primera botonera que permite guardar y consolidar todos los avances de la caracterización a solicitud del usuario. Almacena fecha/hora exacta del grabado y notifica visualmente si hay cambios pendientes por grabar (indicador con pulso ámbar).
  - `💻📱 PC / Celular (Guardado Local en Dispositivo)`: Botón dedicado en la primera botonera que abre el gestor de respaldo para guardar y descargar archivos locales `.json` directamente en la carpeta de Descargas o Archivos de tu computador o celular, así como restaurar respaldos previos.
  - `🚪 Salir (Control de Salida)`: Botón que verifica la integridad documental antes de cerrar o salir de la plataforma. Si existen avances no guardados, despliega un aviso impidiendo el cierre accidental sin grabar previamente los avances, ofreciendo la opción de descargar el archivo a tu equipo antes de salir. Adicionalmente, el navegador activa un guardia de seguridad `beforeunload` si el usuario intenta recargar o cerrar la pestaña.

### 🔹 Nivel 2: Pasos de la Caracterización (Secuencia Guiada)
Permite recorrer cronológicamente las fases de estructuración del proceso:
1. **Identificación:** Definición básica, categoría, líder, objetivos y alcance.
2. **Normas y Recursos:** Marco técnico/legal y dotación de recursos (Humanos, TI, Infraestructura).
3. **Flujograma:** Representación visual en carriles PHVA o flujo continuo con decisiones.
4. **Mapeo PHVA:** Matriz SIPOC detallada por etapas de Deming.
5. **Control y KPIs:** Plan de seguimiento, inspección de calidad y medición de indicadores.
6. **Ficha Oficial:** Consolidación final del documento estandarizado en dos páginas con firmas.

### 🔹 Nivel 3: Barra de Comandos Contextuales
Se adapta en tiempo real según el paso en el que te encuentres:
- **En Paso 1:** Asistente de redacción de objetivos (Calidad, Eficiencia, Servicio, Misional).
- **En Paso 2:** Sugerencia inteligente de normas aplicables (ISO 9001, 14001, 45001, Habeas Data).
- **En Paso 3:** Alternador de vistas (Carriles PHVA vs. Secuencia) y controles de zoom (`+` / `-`).
- **En Paso 4:** Botón de nueva actividad y atajos rápidos `+P`, `+H`, `+V`, `+A`.
- **En Paso 5:** Botón **⚡ Autogenerar desde PHVA**, nuevo control y nuevo indicador.
- **En Paso 6:** Toggle de edición de firmas, exportación a JSON, exportación a Excel/CSV e impresión.

---

## 🏢 3. MÓDULOS GLOBALES TRANSVERSALES

Antes de diligenciar los pasos individuales, es recomendable configurar los cimientos del sistema:

### 3.1. Contexto Organizacional (`Modal Contexto`)
Se accede haciendo clic sobre la tarjeta de la empresa en la esquina superior izquierda. Permite configurar:
- **Datos Básicos:** Razón Social, NIT, Eslogan corporativo, Sector económico y Representante Legal.
- **Logo Empresarial:** Enlace URL a la imagen del logo institucional (se refleja automáticamente en el encabezado de todas las fichas).
- **Misión Institucional:** Cuenta con un **Constructor Asistido de Misión** con 4 componentes clave:
  1. *Quiénes somos* (Nombre de la organización).
  2. *Qué hacemos* (Actividad fundamental o propuesta de valor).
  3. *Para quién* (Mercado objetivo o clientes).
  4. *Factor diferenciador* (Sello de calidad, tecnología, innovación o cercanía).
- **Visión Institucional:** Cuenta con un **Constructor Asistido de Visión**:
  1. *Horizonte temporal* (Año meta, ej. 2030).
  2. *Objetivo de posicionamiento* (Ser reconocidos como líderes en...).
  3. *Herramientas y métodos* (A través de procesos de excelencia...).
  4. *Impacto esperado* (Generando valor sostenible...).
- **Políticas y Valores Institucionales:** Listado de directrices corporativas que orientarán los objetivos de los procesos.

### 3.2. Manual de Funciones y Perfiles de Cargo (`Modal Cargos`)
La norma ISO 9001:2015 exige determinar la competencia y autoridad de las personas que afectan el desempeño del proceso (numeral 7.2).
- **Creación de Cargos:** Permite ingresar Código del cargo (ej. `CAR-101`), Nombre del cargo, Departamento, Cargo al que reporta y Rol en el sistema (Líder de Proceso, Participante / Operativo, Auditor / Control).
- **Perfil de Competencia:** Educación formal requerida, Años de experiencia mínima y Competencias técnicas y conductuales.
- **Responsabilidades Clave:** Lista de funciones principales del cargo.
- **🔥 Función Estrella - Alimentación Bidireccional:**
  - Al pulsar **"Crear Proceso desde este Cargo"**, la plataforma crea automáticamente un proceso completo asignando al cargo como líder y convirtiendo sus responsabilidades en actividades PHVA.
  - Al pulsar **"Vincular al Proceso Activo"**, actualiza al líder del proceso actual y añade los requisitos de competencia a la sección de talento humano.

### 3.3. Mapa General de Procesos (`Modal Mapa`)
Brinda la vista macro del sistema dividida en las 4 familias estándar:
1. **Procesos Estratégicos:** Definen el direccionamiento, políticas y metas corporativas.
2. **Procesos Misionales (Cadena de Valor):** Producen y entregan directamente los productos o servicios al cliente.
3. **Procesos de Apoyo / Soporte:** Proveen personal, tecnología, compras e infraestructura.
4. **Procesos de Evaluación y Control:** Monitorean el desempeño, auditorías y mejora continua.

> **Semáforo de Salud PHVA:**
> En cada tarjeta del mapa de procesos verás un indicador que muestra cuántas etapas del ciclo de Deming tiene cubiertas el proceso (ej. `4/4 PHVA` en color verde o `2/4 PHVA` en ámbar). Esto permite a la dirección identificar de inmediato si un proceso tiene vacíos de verificación o mejora.

---

## 📋 4. GUÍA PASO A PASO: DILIGENCIAMIENTO DE LA CARACTERIZACIÓN

---

### 🔹 PASO 1: IDENTIFICACIÓN GENERAL, OBJETIVOS Y ALCANCE

Este paso establece la "cédula de ciudadanía" del proceso.

#### Campos a diligenciar:
1. **Nombre del Proceso:** Especifícalo con claridad (ej. *Gestión de Talento Humano*, *Producción Metalmecánica*, *Gestión Comercial*).
2. **Código y Versión:** Código alfanumérico según tu codificación documental (ej. `PR-TH-001`, Versión `01`).
3. **Categoría del Proceso:** Selecciona si es *Estratégico*, *Misional*, *Apoyo* o *Evaluación y Control*.
4. **Dueño o Líder del Proceso:** Cargo responsable (ej. *Gerente de Operaciones*, *Director de Calidad*). Si tienes cargos registrados en el manual, puedes seleccionarlo con un clic.
5. **Participantes:** Cargos que integran el equipo operativo o de soporte del proceso.
6. **Objetivo del Proceso:**
   - **Regla de oro metodológica:** Inicia siempre con un verbo en infinitivo (*Garantizar*, *Desarrollar*, *Suministrar*, *Evaluar*) + *Qué hace* + *Para qué lo hace*.
   - **Asistente en barra superior:** Puedes usar los botones sugeridos en el Nivel 3 (*Objetivo Calidad*, *Objetivo Eficiencia*, *Objetivo Servicio*, *Objetivo Estratégico*).
7. **Producto o Servicio del Proceso:** Especifica el entregable tangible o intangible principal que genera el proceso (ej. *Software desplegado en producción*, *Personal competente contratado*, *Informes de auditoría interna*).
8. **Alcance Delimitado:**
   - **Inicio (Evento disparador):** Desde dónde arranca el proceso (ej. *Recepción de la solicitud de compra o requerimiento de usuario*).
   - **Fin (Entregable final):** Dónde culmina (ej. *Entrega conforme del insumo y radicación de factura en contabilidad*).

---

### 🔹 PASO 2: NORMAS TÉCNICAS Y RECURSOS DETERMINADOS (ISO 9001:2015 CAP. 7)

Establece el marco regulatorio y los recursos requeridos para que el proceso funcione de manera idónea y controlada.

#### Secciones a diligenciar:
1. **Normas y Marco Legal Aplicable:**
   - Leyes, resoluciones, normas técnicas sectoriales o numerales de la norma ISO 9001 que rigen el proceso.
   - **Asistente Inteligente:** En el Nivel 3, haz clic en **"Sugerir Normas ISO y SST"** para precargar las normas aplicables según la categoría del proceso (ej. Numeral 8 para procesos Misionales, Numeral 7 para Apoyo, Numerales 9 y 10 para Evaluación).
2. **Talento Humano (Competencias 7.2):**
   - Personal requerido, roles clave y requisitos de formación o experiencia previa. Si vinculaste un cargo del manual, sus competencias se incorporan aquí automáticamente.
3. **Recursos Tecnológicos:**
   - Sistemas de software, bases de datos, redes, ERP, licencias o herramientas digitales necesarias para la operación.
4. **Recursos de Información y Documentación:**
   - Manuales técnicos, especificaciones de diseño, políticas de seguridad y guías operativas.
5. **Formatos y Registros Requeridos (7.5):**
   - Hojas de verificación, bitácoras, registros de inspección o actas donde queda constancia de la ejecución.
6. **Infraestructura y Dotación (7.1.3):**
   - Espacio físico, maquinaria, vehículos, instrumentos de medición o mobiliario.
7. **Ambiente de Trabajo (7.1.4):**
   - Factores ergonómicos, iluminación, temperatura, orden, aseo y factores psicosociales que garantizan la conformidad y seguridad.

---

### 🔹 PASO 3: FLUJOGRAMA VISUAL DEL PROCESO

El flujograma traduce el alcance y las normas en un recorrido visual intuitivo.

#### Características y Vistas:
1. **Vista de Carriles PHVA (Swimlanes):**
   - Divide horizontalmente el flujo en 4 carriles: **Planear (Verde)**, **Hacer (Azul)**, **Verificar (Ámbar)** y **Actuar (Morado)**.
   - Cada actividad se posiciona dentro de su fase correspondiente.
   - Incluye el rombo de decisión de calidad: *¿Cumple especificaciones técnicas?*
     - **Sí:** Continúa hacia la entrega del producto/servicio al cliente.
     - **No:** Se desvía hacia el carril de *Actuar* para corregir la no conformidad.
2. **Vista de Secuencia Continua:**
   - Muestra el flujo en una línea de tiempo continua de izquierda a derecha con nodos interconectados.
3. **Controles de Zoom:**
   - Ubicados en la barra de comandos de Nivel 3 (`Zoom +`, `Zoom -`).
4. **Detalle de Actividad al Clic:**
   - Al pulsar sobre cualquier tarjeta del flujo, se despliega una ficha técnica con su proveedor, entradas, salidas, cliente y responsable.

---

### 🔹 PASO 4: MAPEO DE ACTIVIDADES CON CICLO PHVA Y MATRIZ SIPOC

El corazón del análisis operativo. Conecta de forma exhaustiva cada etapa con sus proveedores y clientes mediante la metodología **SIPOC** (*Suppliers, Inputs, Process, Outputs, Customers*).

#### ¿Cómo estructurar cada actividad?
Al pulsar **"+ Nueva Actividad"** o editar una existente, completa:
- **Etapa de Deming:** Selecciona entre *Planear*, *Hacer*, *Verificar* o *Actuar*.
- **Nombre de la Actividad:** Describe la tarea de forma concisa (ej. *Realizar pruebas de control de calidad sobre lote terminado*).
- **Proceso Proveedor (S):** ¿Quién suministra el insumo para iniciar esta tarea? (ej. *Almacén central*, *Gestión de Compras*, *Cliente externo*).
- **Entrada / Insumo (I):** ¿Qué información, documento o materia prima se recibe? (ej. *Muestra del lote y ficha técnica*).
- **Salida / Entregable (O):** ¿Qué resultado tangible o registro se obtiene? (ej. *Certificado de conformidad de calidad*).
- **Proceso Cliente (C):** ¿A quién se le entrega el resultado? (ej. *Despachos y Distribución*, *Cliente final*).
- **Responsable de la Actividad:** Cargo ejecutor de la tarea.

#### 💡 Atajos y Herramientas Rápidas en Nivel 3:
- **Botones Rápidos `+P`, `+H`, `+V`, `+A`:** Agregan con un solo clic una actividad prediseñada para cualquiera de las 4 fases que le falten a tu proceso, garantizando el 100% de cumplimiento del ciclo de Deming.
- **Importar Funciones de Cargo:** Si el líder tiene funciones registradas en el Manual de Cargos, aparecerá el botón *Importar Funciones* para convertirlas en actividades SIPOC sin tener que reescribirlas.

---

### 🔹 PASO 5: PLAN DE CONTROL OPERATIVO, MEDICIÓN E INDICADORES (KPIs)

Ningún proceso está completo si no se definen sus puntos de inspección y sus métricas de eficacia.

#### 5.1. Plan de Seguimiento y Medición (Controles de Calidad)
Define cómo se inspecciona que las actividades no fallen.
- **⚡ Botón Inteligente "Autogenerar desde PHVA":**
  - Ubicado en la barra superior de Nivel 3 y en el encabezado del paso.
  - Al presionarlo, el sistema analiza todas las actividades registradas en el Paso 4 y **crea automáticamente los controles correspondientes**, formulando variables, especificaciones, criterios de aceptación y acciones de contingencia basadas en si la actividad es de Planear, Hacer, Verificar o Actuar.
- **Campos de cada Control:**
  - *Actividad vinculada:* Tarea sobre la cual recae el control.
  - *Variable a controlar:* Qué propiedad se mide (ej. *Tiempos de entrega*, *Hermeticidad*, *Conformidad documental*).
  - *Especificación del control:* Parámetro técnico o tolerancia aceptada (ej. *100% de cumplimiento*, *Margen de error ≤ 2%*).
  - *Criterios de Aceptación / Rechazo:* Cuándo se aprueba o se declara no conforme.
  - *Quién inspecciona:* Cargo responsable de la verificación.
  - *Registro de inspección:* Formato, acta o sistema donde queda la evidencia (ej. `FOR-CAL-02 Lista de Chequeo`).
  - *¿Qué hago si no cumple? (Acción de Contingencia):* Procedimiento inmediato para contener la falla (ej. *Rechazar entrega, emitir no conformidad e iniciar reproceso*).

#### 5.2. Indicadores de Gestión (KPIs)
Define las métricas numéricas periódicas para evaluar la eficacia del proceso:
- *Nombre del Indicador:* (ej. *Eficacia Operativa*, *Índice de Satisfacción del Cliente*, *Oportunidad de Entrega*).
- *Fórmula de Cálculo:* Expresión matemática clara (ej. `(Entregas a tiempo / Total entregas programadas) * 100`).
- *Meta:* Objetivo numérico cuantificable (ej. `≥ 95%`).
- *Frecuencia:* Periodicidad de medición (*Mensual*, *Trimestral*, *Semestral*, *Anual*).
- *Responsable:* Cargo encargado de consolidar y analizar la métrica.

---

### 🔹 PASO 6: FICHA TÉCNICA OFICIAL ISO 9001, FIRMAS Y EXPORTACIONES

Es la consolidación final del trabajo realizado en los 5 pasos anteriores. Diseñada para cumplir con los estándares de auditoría de certificación (como ICONTEC, SGS, Bureau Veritas, TÜV, etc.).

#### Estructura del Documento Oficial (2 Páginas Estandarizadas):
1. **PÁGINA 1: FICHA DE CARACTERIZACIÓN**
   - **Encabezado Institucional:** Logo de la empresa, Razón Social, Nombre del Proceso, Código, Versión y Página.
   - **Metadatos:** Objetivo, Producto/Servicio, Alcance delimitado (Desde / Hasta), Responsables, Normas técnicas y Recursos (Talento Humano, TI, Formatos).
   - **Bloque de 3 Columnas:** Indicadores de gestión, Infraestructura y Dotación, y Ambiente de Trabajo.
   - **Síntesis Visual Gráfica del Ciclo PHVA:** Resumen gráfico de las 4 fases de Deming con sus cantidades y actividades clave.
   - **Tabla SIPOC Oficial:** Matriz completa de Proveedores, Entradas, Actividades (con número y fase), Salidas y Clientes.
2. **PÁGINA 2: PLAN DE SEGUIMIENTO Y MEDICIÓN**
   - **Encabezado Institucional homologado.**
   - **Tabla de Seguimiento y Medición:** Actividad, Variable, Especificación, Criterios de Aceptación, Inspector, Formato de Registro y Acción si no cumple.
   - **Bloque Oficial de Firmas y Control de Cambios:**
     - *Elaborado por:* Nombre, Cargo, Fecha y Firma del líder del proceso.
     - *Revisado por:* Nombre, Cargo, Fecha y Firma del Coordinador SGC / Calidad.
     - *Aprobado por:* Nombre, Cargo, Fecha y Firma de la Gerencia General o Alta Dirección.

#### Opciones de Exportación y Descarga:
- **Editar / Configurar Firmas:** Al pulsar el botón `Firmas` (en Nivel 3 o en el encabezado) se despliega el formulario para ingresar los nombres, cargos y fechas de elaboración, revisión y aprobación.
- **Imprimir / Descargar PDF:** Abre la ventana del navegador con estilos optimizados para impresión en hoja carta / A4 (`Ctrl + P` o `Cmd + P`), ocultando automáticamente barras de navegación y controles de edición.
- **Exportar Excel / CSV:** Genera un archivo `.csv` con codificación UTF-8 BOM que abre de forma nativa en Microsoft Excel o Google Sheets con las tablas SIPOC y de Controles separadas y legibles.
- **Exportar JSON:** Genera un archivo `.json` con la copia exacta del proceso y la organización, permitiendo respaldar la información o transferirla a otra computadora.

---

## 💾 5. PROTOCOLO DE GUARDADO LOCAL EN COMPUTADOR Y CELULAR

La plataforma está diseñada con una arquitectura centrada en la **privacidad y la soberanía de los datos** del usuario. No requiere bases de datos en la nube ni registro con contraseñas: todos los avances se almacenan y resguardan localmente en tu propio dispositivo (computador o celular).

### 5.1. Mecanismos de Guardado Disponibles

1. **Memoria Local del Navegador (`localStorage`):**
   - **Cómo funciona:** Al pulsar el botón **"Guardar Avances"** en la primera botonera (Nivel 1), la aplicación consolida el contexto empresarial, todos los procesos registrados, los cargos y las actividades PHVA directamente en el almacenamiento interno seguro del navegador web de tu computador o teléfono móvil.
   - **Ventaja:** Permite continuar el trabajo inmediatamente al abrir de nuevo el navegador en el mismo dispositivo, sin necesidad de cargar ningún archivo.
   - **Indicador:** Muestra la hora exacta del último guardado (ej. `14:35:10`) y cambia el botón de ámbar a azul cuando todo está al día.

2. **Descarga de Archivo Físico Local (`.json`):**
   - **Cómo funciona:** Al pulsar el botón **"PC / Celular"** en la primera botonera (o en el modal de salida), se genera y descarga un archivo físico estándar con nombre descriptivo (ej. `Avances_Caracterizacion_MiEmpresa_2026-10-12_14-35.json`).
   - **En Computadores (Windows, Mac, Linux):** El archivo se guarda directamente en tu carpeta de **Descargas** o en la ubicación que elijas.
   - **En Teléfonos Móviles y Tablets (Android / iPhone / iPad):**
     - El archivo se guarda en la carpeta **Descargas** o en la aplicación **Archivos / Files**.
     - En dispositivos compatibles con la función de compartir nativa, la plataforma ofrece el botón **"Compartir / Guardar en Celular"**, permitiendo enviarlo directamente a **WhatsApp**, **Google Drive**, **iCloud** o correo electrónico personal.
   - **Ventaja:** Protección permanente contra limpieza accidental de caché o historial del navegador. Permite transferir el archivo entre diferentes computadores y celulares o almacenarlo en memorias USB corporativas.

3. **Cargar / Restaurar Avances Previos:**
   - Para continuar trabajando en otro computador o celular, basta con pulsar el botón **"Importar (.json)"** en la primera botonera o abrir el gestor **"PC / Celular"** y seleccionar el archivo `.json` guardado previamente. La plataforma restaura automáticamente la empresa, todos los procesos, el mapa y los manuales de cargo.

4. **Protocolo de Protección contra Salida Accidental:**
   - Si tienes cambios no guardados e intentas hacer clic en **"Salir"**, se abre el **Modal de Control de Salida** con tres opciones claras:
     - `Descargar archivo en PC / Celular y Salir`: Guarda en memoria, descarga el archivo en tu dispositivo y finaliza de manera 100% segura.
     - `Grabar Avances y Salir`: Guarda en el almacenamiento local del navegador y finaliza.
     - `Permanecer en la plataforma`: Cancela la salida para seguir editando.
   - Si intentas cerrar la pestaña o recargar la página directamente desde los controles del navegador, se activa el guardia `window.beforeunload` alertando que no puedes salir sin grabar tus avances.

---

## 💡 6. RECOMENDACIONES Y CONSEJOS PARA AUDITORÍAS DE CALIDAD

1. **Evite Procesos "Aislados":** Asegúrese de que el Proceso Proveedor del primer paso de su matriz SIPOC provenga de otro proceso de su mapa, y que el Proceso Cliente de la última salida alimente a otro proceso o al cliente externo. Esto evidencia la interacción requerida por el numeral 4.4.1 de ISO 9001.
2. **No salte la fase "Actuar":** Una no conformidad frecuente en auditorías es tener procesos con actividades de *Planear* y *Hacer*, pero sin actividades explícitas de tratamiento de no conformidades o lecciones aprendidas (*Actuar*). Use el botón rápido `+A` para garantizar esta fase.
3. **Consistencia entre Controles y Formatos:** Si en el Paso 2 listó el formato `FOR-01 Lista de Chequeo`, asegúrese de que en el Paso 5 ese mismo código aparezca en la columna *Registro de Inspección*.
4. **Respaldo Periódico:** Use periódicamente la función **PC / Celular** para descargar copias de seguridad de sus avances en su computador o teléfono móvil.

---

## 📞 7. GLOSARIO DE TÉRMINOS CLAVE

- **PHVA (Deming):** Ciclo metodológico de mejora continua compuesto por Planear, Hacer, Verificar y Actuar.
- **SIPOC:** Acrónimo en inglés de Proveedores (*Suppliers*), Entradas (*Inputs*), Proceso (*Process*), Salidas (*Outputs*) y Clientes (*Customers*).
- **Proceso:** Conjunto de actividades mutuamente relacionadas o que interactúan, las cuales transforman elementos de entrada en resultados.
- **Salida No Conforme:** Resultado o producto que no cumple con los requisitos o especificaciones definidos.
- **KPI:** *Key Performance Indicator* (Indicador Clave de Desempeño), métrica cuantitativa utilizada para medir la eficacia del proceso.
- **Alcance:** Límites del proceso determinados por el evento disparador de inicio y el entregable final.

---

## 📱 8. ACCESO DIRECTO E INSTALACIÓN EN ESCRITORIO (PC Y CELULARES)

La plataforma cuenta con soporte estándar de **Aplicación Web Progresiva (PWA)** y generador de accesos directos, permitiendo que cualquier usuario en su computador o celular la coloque en su pantalla de inicio como una aplicación nativa.

### 💻 En Computadores (Windows / Mac / Linux):
1. **Opción A (Archivo directo):** En la barra superior haz clic en **"Acceso Directo"** y pulsa **"Descargar Acceso Directo PC (.url)"**. El archivo descargado `GestorProcesos ISO.url` se puede arrastrar directamente al Escritorio de Windows para abrir la plataforma en 1 clic.
2. **Opción B (Instalar como App de Escritorio):** En Google Chrome o Microsoft Edge, haz clic en el icono **"Instalar aplicación"** (⊕) en la barra de direcciones o ve al menú de tres puntos (⋮) → **"Instalar GestorProcesos"**. Se abrirá en una ventana limpia e independiente sin barras de navegador.

### 📱 En Celulares Android:
1. Abre el enlace de la plataforma en **Google Chrome** en tu teléfono.
2. Toca el menú de tres puntos verticales (**⋮**) en la esquina superior derecha.
3. Elige la opción **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
4. Confirma y el icono oficial de la plataforma quedará colocado en tu escritorio móvil.

### 🍏 En iPhone / iPad (iOS):
1. Abre la plataforma en el navegador **Safari**.
2. Toca el botón de **Compartir** (⎋, icono de cuadro con flecha hacia arriba en la barra inferior).
3. Desplázate y selecciona **"Agregar al inicio"** (*Add to Home Screen*).
4. Toca **"Agregar"** en la esquina superior derecha.

---

## 📄 9. GENERACIÓN DE AVANCES EN PDF Y REIMPORTACIÓN HÍBRIDA

Junto al botón **«Guardar Avances»** en la barra superior (Nivel 1) y dentro del modal de guardado, encontrarás el botón **«Avances en PDF»**.

### 🌟 Características del PDF de Avances:
1. **Gráficos y Métricas Visuales:**
   - **Barra y Porcentaje de Avance:** Muestra el cálculo de avance del proceso (ej. 75% completado).
   - **Semáforo de los 6 Pasos:** Indica claramente qué módulos están listos y cuáles están pendientes.
   - **Balance Gráfico del Ciclo Deming (PHVA):** Tarjeta con 4 bloques a color (P-Planear, H-Hacer, V-Verificar, A-Actuar) con conteos de actividades y balance ISO 9001.
   - **Diagrama Visual de Alcance:** Representación en cajas y flecha de inicio (evento disparador) a fin (entregable final).
   - **Flujograma Operativo:** Pasos del procedimiento con tipo de actividad (Operación, Decisión, Documento, Hito) y criterio de decisión.
   - **Matriz SIPOC:** Tabla completa con entradas, proveedores, actividades, salidas y clientes.
   - **KPIs y Controles:** Tabla de indicadores con fórmulas y metas.

2. **Reimportación Directa para Terminar la Ficha:**
   - El archivo PDF generado contiene **datos estructurados híbridos embebidos**.
   - Para reanudar el trabajo en cualquier momento, basta con hacer clic en el botón **«Importar»** en la barra superior y seleccionar el archivo `.pdf` generado.
   - La plataforma extraerá automáticamente toda la información del proceso, restaurará el estado y te permitirá continuar la caracterización hasta finalizar la ficha oficial.

