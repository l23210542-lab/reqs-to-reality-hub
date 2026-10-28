# Contexto del Proyecto: FinScript Compiler Web (Prototipo Académico)
Actúa como un Ingeniero de Software Principal y Arquitecto de Compiladores. Vamos a construir un prototipo de aplicación web que funciona como un entorno de desarrollo interactivo (Playground) para un Lenguaje de Dominio Específico (DSL) financiero llamado "FinScript". 
El objetivo es que los usuarios escriban reglas de préstamos financieros en este DSL, y el backend analice, valide semánticamente y compile este texto en un modelo matemático (Tabla de Amortización) en formato JSON.

## 1. Arquitectura y Tech Stack
El proyecto está estrictamente dividido en las siguientes tecnologías:
*   **Frontend (Generado por Lovable):** React, Vite, Tailwind CSS, lucide-react (iconos). Componente principal de editor de texto (tipo Monaco Editor o Textarea avanzado) y renderizado de tablas/gráficos.
*   **Backend (Generado por Cursor):** Python 3, FastAPI, Pydantic, librería `lark-parser` (para análisis léxico y sintáctico).
*   **Base de Datos / BaaS:** Supabase (PostgreSQL, Autenticación y API REST).

## 2. Historias de Usuario (User Stories)
*   **US1 - Autenticación:** Como usuario, quiero iniciar sesión o registrarme usando Supabase Auth para mantener mis contratos guardados.
*   **US2 - Entorno de Edición:** Como usuario, quiero una interfaz dividida (Split Pane); a la izquierda escribiré el código fuente en FinScript, y a la derecha veré los resultados de la compilación.
*   **US3 - Compilación:** Como usuario, quiero presionar un botón "Compilar" que envíe el texto al backend, y ver a la derecha la proyección financiera (Tabla de Amortización) generada.
*   **US4 - Reporte de Errores:** Como usuario, si escribo una regla financiera inválida (ej. tasa de interés negativa, o mezclar monedas), quiero ver un panel de errores que me indique la línea y el motivo del fallo semántico o sintáctico.
*   **US5 - Persistencia:** Como usuario, quiero botones para "Guardar" y "Cargar" mis contratos desde la base de datos de Supabase.

## 3. Requisitos Funcionales (FR)
*   **FR1 - Análisis Léxico y Sintáctico:** El backend debe usar `Lark` para parsear una gramática de contratos que incluya tokens de variables (`CAPITAL`, `TASA_ANUAL`, `PLAZO`, `MONEDA`).
*   **FR2 - Tabla de Símbolos (Semántica):** El backend debe construir en memoria una "Tabla de Símbolos" que almacene el tipo de dato, valor y ámbito de cada variable para validar reglas matemáticas financieras antes de generar la salida.
*   **FR3 - Tabla de Direcciones:** El backend debe generar una "Tabla de Direcciones" simulada que asigne offsets y referencias a las variables para la etapa de generación de código (estructuración del JSON final).
*   **FR4 - Generación de Código:** Si no hay errores, el compilador debe devolver un JSON con la estructura del AST, la Tabla de Símbolos y un arreglo de objetos que represente el flujo de caja mes a mes.
*   **FR5 - CRUD de Contratos:** El backend o cliente de Supabase debe permitir operaciones de Insertar, Leer y Actualizar sobre la tabla `contratos` (columnas: `id`, `user_id`, `titulo`, `codigo_fuente`, `created_at`).

## 4. Requisitos No Funcionales (NFR)
*   **NFR1 - Rendimiento:** La compilación y respuesta del backend no debe tardar más de 500ms.
*   **NFR2 - Interfaz Responsiva:** El diseño web debe usar Flexbox/Grid para adaptarse a pantallas de escritorio (prioritario) y tablets.
*   **NFR3 - Tolerancia a Fallos:** Si el parser falla por sintaxis incorrecta, el backend no debe crashear; debe retornar un JSON con HTTP Status 400 y un array estandarizado de `errors: [{line, column, message}]`.

## 5. Flujo de Trabajo (Workflow Principal)
1. El usuario entra a la app y se autentica.
2. Abre la vista "Playground". Escribe el código fuente (ej. `MONEDA: USD \n CAPITAL: 10000 \n TASA_ANUAL: 12.5% \n PLAZO: 6 MESES`).
3. Hace clic en "Compilar". El Frontend hace un `POST /api/compile` enviando el texto.
4. El Backend recibe el texto.
    a. Pasa por el Lexer/Parser (`Lark`). Si hay error, retorna 400.
    b. Crea la Tabla de Símbolos. Pasa por Análisis Semántico. Si hay error (ej. tasa negativa), retorna 400.
    c. Genera el Target (JSON de amortización).
5. Frontend recibe HTTP 200 y pinta 3 pestañas en el panel derecho: "Tabla de Amortización", "Tabla de Símbolos (Debug)", "AST (Debug)".

---

## 6. Instrucciones Específicas para Lovable (IA de Frontend)
*   **Layout Base:** Crea un Dashboard layout. Sidebar a la izquierda con opciones: "Mis Contratos", "Nuevo Contrato", "Cerrar Sesión".
*   **Vista Principal (Editor):** Usa un diseño de dos columnas (50% / 50%). 
    *   *Columna Izquierda:* Un área de texto con fuente monospace (estilo editor de código), con números de línea si es posible, y un botón "Compilar Contrato" (color primario) en la parte superior.
    *   *Columna Derecha:* Un sistema de Tabs (Pestañas). Pestaña 1: "Resultados (Tabla)", Pestaña 2: "Consola/Errores", Pestaña 3: "Tabla de Símbolos".
*   **Estado:** Usa `useState` de React para manejar `sourceCode`, `compiledResults`, `isCompiling`, y `errors`.
*   **Estilos:** Usa un tema "Dark Mode" tecnológico moderno, con colores verde esmeralda y gris oscuro para darle aspecto FinTech.

## 7. Instrucciones Específicas para Cursor (IA de Backend)
*   Crea la estructura de FastAPI en una carpeta `/backend`.
*   Crea el archivo `grammar.lark` con la definición EBNF del lenguaje.
*   Crea un archivo `compiler.py` donde instancies el Lark parser.
*   Implementa clases explícitas en Python usando `@dataclass`: `SymbolTable`, `Symbol`, `AddressTable`. Esta es una exigencia académica estricta.
*   El endpoint `POST /compile` debe aceptar `{ "source_code": "string" }` y orquestar las 4 fases: Lexer -> Parser -> Semantic Analyzer -> Code Generator.
*   Asegúrate de configurar CORS en FastAPI para aceptar peticiones del frontend en localhost.

