# Estado actual del sistema — FinScript Compiler Web

**Fecha de corte:** 28 de octubre de 2026
**Último commit:** `46c6f7d` ("hardcode")

Este documento describe qué tiene hoy el sistema: qué pantallas existen, qué se puede hacer en cada una, qué partes del [PRD](./prd.md) están cumplidas y qué falta. Para el detalle de uso consulta el [manual de usuario](./manual-de-usuario.md); para el detalle técnico, el [manual para desarrolladores](./manual-desarrolladores.md).

---

## 1. Resumen ejecutivo

- **El sistema es usable de punta a punta desde el navegador:** registro e inicio de sesión reales con Supabase, editor de contratos FinScript, compilación con resultados detallados, y guardar, cargar y eliminar contratos en la base de datos.
- **La compilación se hace en el navegador** con un compilador en TypeScript que implementa las 4 fases (léxico, sintáctico, semántico y generación). Da los mismos resultados que se esperan del backend.
- **El backend en Python (FastAPI + Lark) existe solo como esqueleto.** Tiene CORS y un endpoint de salud, pero todavía no tiene el endpoint `/compile` ni las clases `SymbolTable`, `Symbol` y `AddressTable` que exige el PRD. Es la principal tarea pendiente.
- **Ya no hay datos simulados:** se eliminó la sesión falsa y el almacenamiento local de contratos; todo va contra Supabase usando las credenciales de `.env`.

| Área | Estado |
|---|---|
| Frontend (pantallas y flujo) | ✅ Completo |
| Autenticación (Supabase Auth) | ✅ Completo |
| Base de datos y CRUD de contratos | ✅ Completo (requiere aplicar la migración en Supabase) |
| Compilador (versión navegador, TypeScript) | ✅ Completo |
| Compilador (versión backend, Python + Lark) | ❌ Pendiente |
| Documentación | ✅ PRD, manual de usuario y manual para desarrolladores |
| Pruebas automatizadas | ❌ No existen |

---

## 2. Pantallas existentes

El sistema tiene **3 pantallas** principales y **2 pantallas de sistema**.

### 2.1 Acceso — `/auth`

Pantalla de entrada para usuarios sin sesión.

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Iniciar sesión con correo y contraseña | ✅ | Usa Supabase Auth. Al entrar, redirige al Playground. |
| Registro de cuenta nueva | ✅ | Crea el usuario en Supabase. Si el proyecto exige confirmar el correo, avisa al usuario y lo lleva a la pestaña de login. |
| Validación del formulario | ✅ | Correo con `@` y contraseña de 6 caracteres o más. |
| Mensajes de error | ✅ | Notificación con el error de Supabase (los textos vienen en inglés). |
| Botón deshabilitado mientras se procesa | ✅ | Evita envíos dobles. |
| Recuperar contraseña | ❌ | No existe. |

### 2.2 Playground (editor) — `/`

Pantalla principal. Requiere sesión; si no la hay, redirige a `/auth`.

**Barra superior**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Título del contrato y estado | ✅ | Muestra "Contrato guardado" o "Borrador no guardado". |
| Menú **Ejemplos** | ✅ | 4 contratos de muestra: sistema francés, sistema alemán, error semántico y error sintáctico. |
| Menú **Cargar** | ✅ | Lista los contratos del usuario, del más reciente al más antiguo, y los abre en el editor. |
| Botón **Guardar** | ✅ | Diálogo para escribir el título. Inserta un contrato nuevo o actualiza el que está abierto. Valida que el título no esté vacío. |
| Abrir un contrato desde un enlace (`/?contrato=<id>`) | ✅ | Lo usa el botón "Abrir" de "Mis contratos". Avisa si el contrato no existe o no es del usuario. |

**Columna izquierda — editor**

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Área de texto monoespaciada | ✅ | Estilo editor de código. |
| Números de línea | ✅ | Sincronizados con el desplazamiento. |
| Resaltado de líneas con error | ✅ | El número de línea se pinta en rojo. |
| Botón **Compilar contrato** | ✅ | Muestra indicador de carga y una notificación con el tiempo o el número de errores. |
| Recordatorio de claves soportadas | ✅ | Al pie del editor. |
| Resaltado de sintaxis por colores | ❌ | No existe (es un `textarea`). |

**Columna derecha — resultados (6 pestañas)**

| Pestaña | Estado | Contenido |
|---|---|---|
| Resultados (Tabla) | ✅ | 4 indicadores (cuota mensual, tasa mensual, total de intereses, tiempo de compilación), gráfica del saldo por mes y tabla de amortización completa. |
| Consola/Errores | ✅ | Errores con tipo, línea, columna y motivo; advertencias; registro de cada fase del compilador. Muestra un contador de errores. |
| Tabla de Símbolos | ✅ | Identificador, tipo, valor, ámbito, línea y si es mutable. |
| Direcciones | ✅ | Tabla de direcciones simulada: offset, tamaño, segmento y referencia. |
| AST | ✅ | Árbol de sintaxis en forma visual y en JSON. |
| Tokens | ✅ | Salida del analizador léxico: tipo, lexema, línea y columna. |

Además, una etiqueta indica **HTTP 200 / HTTP 400** y si el cálculo lo hizo el "compilador local" o el "backend". La división entre editor y resultados se puede **redimensionar** arrastrando.

### 2.3 Mis contratos — `/contratos`

Requiere sesión.

| Funcionalidad | Estado | Detalle |
|---|---|---|
| Listado de contratos del usuario | ✅ | Título, id corto, fecha de creación y vista previa del código. |
| Indicador de carga | ✅ | Mientras se consulta la base de datos. |
| Estado vacío | ✅ | Mensaje y botón "Nuevo contrato". |
| Botón **Abrir** | ✅ | Abre el contrato en el Playground. |
| Botón **Eliminar** | ✅ | Borra el contrato de la base de datos. **No pide confirmación.** |
| Búsqueda o filtros | ❌ | No existen. |

### 2.4 Elementos comunes

- **Menú lateral:** "Nuevo contrato", "Mis contratos", correo del usuario y "Cerrar sesión" (cierra la sesión en Supabase). Se oculta en pantallas angostas (celulares) y no tiene un menú alternativo.
- **Notificaciones** emergentes (arriba a la derecha) para éxitos y errores.
- **Tema oscuro** con acentos verde esmeralda (estilo FinTech).

### 2.5 Pantallas de sistema

- **404 — Página no encontrada:** existe, pero en inglés ("Page not found").
- **Error inesperado:** pantalla de "This page didn't load" con botones para reintentar o volver al inicio (en inglés).

---

## 3. El lenguaje FinScript (lo que el compilador acepta hoy)

| Clave | Obligatoria | Valores |
|---|---|---|
| `MONEDA` | Sí | `USD`, `MXN`, `EUR` |
| `CAPITAL` | Sí | Número mayor que 0 |
| `TASA_ANUAL` | Sí | Porcentaje ≥ 0 (con o sin `%`) |
| `PLAZO` | Sí | Entero en `MESES`, `MES` o `ANIOS` |
| `METODO` | No (por defecto `FRANCES`) | `FRANCES` (cuota fija) o `ALEMAN` (amortización constante) |
| `COMISION` | No | Porcentaje ≥ 0. Se valida, pero **no afecta los cálculos**. |

También admite comentarios con `//`, líneas vacías, mayúsculas o minúsculas indistintamente y `;` opcional al final.

**Validaciones implementadas:**
- **Léxicas:** caracteres no reconocidos (`$`, `,`, `-`, `ñ`…).
- **Sintácticas:** falta de `:`, clave desconocida, clave sin valor.
- **Semánticas:** moneda repetida ("mezclar monedas"), claves repetidas, moneda o método no soportados, capital ≤ 0, plazo no entero o ≤ 0, falta de claves obligatorias.
- **Advertencias:** tasa > 100 % y plazo > 480 meses.

---

## 4. Cumplimiento del PRD

### 4.1 Historias de usuario

| ID | Historia | Estado | Comentario |
|---|---|---|---|
| US1 | Autenticación con Supabase Auth | ✅ | Login, registro y cierre de sesión reales. |
| US2 | Interfaz dividida (editor / resultados) | ✅ | Panel 50/50 redimensionable. |
| US3 | Botón "Compilar" y tabla de amortización | ✅ | Hoy compila el motor local; el backend aún no. |
| US4 | Panel de errores con línea y motivo | ✅ | Pestaña Consola/Errores y resaltado de líneas. |
| US5 | Guardar y cargar contratos en Supabase | ✅ | También permite eliminar. |

### 4.2 Requisitos funcionales

| ID | Requisito | Estado | Comentario |
|---|---|---|---|
| FR1 | Análisis léxico y sintáctico con **Lark** | ⚠️ Parcial | Implementado en TypeScript (navegador). Falta la versión con Lark en el backend. |
| FR2 | Tabla de símbolos (tipo, valor, ámbito) | ⚠️ Parcial | Funciona en el navegador. Faltan las clases `@dataclass` en Python. |
| FR3 | Tabla de direcciones simulada | ⚠️ Parcial | Funciona en el navegador. Falta `AddressTable` en Python. |
| FR4 | Salida JSON con AST, símbolos y flujo de caja | ⚠️ Parcial | Se genera en el navegador. Falta el endpoint del backend. |
| FR5 | CRUD de la tabla `contratos` | ✅ | Insertar, leer y actualizar (y eliminar) contra Supabase. |

### 4.3 Requisitos no funcionales

| ID | Requisito | Estado | Comentario |
|---|---|---|---|
| NFR1 | Compilación en menos de 500 ms | ✅ | El motor local tarda unos pocos milisegundos. Habrá que medirlo de nuevo con el backend. |
| NFR2 | Diseño responsivo (escritorio y tableta) | ⚠️ Parcial | Bien en escritorio. En pantallas angostas el menú lateral desaparece sin alternativa. |
| NFR3 | Backend tolerante a fallos (HTTP 400 + `errors[]`) | ⚠️ Parcial | El frontend ya interpreta esa respuesta, pero el backend todavía no la produce. |

### 4.4 Instrucciones de la sección 6 (frontend)

| Instrucción | Estado |
|---|---|
| Dashboard con menú lateral (Mis contratos, Nuevo contrato, Cerrar sesión) | ✅ |
| Dos columnas 50/50 con editor y botón "Compilar Contrato" | ✅ |
| Pestañas "Resultados (Tabla)", "Consola/Errores", "Tabla de Símbolos" | ✅ (más 3 extra: Direcciones, AST, Tokens) |
| Estado con `sourceCode`, `compiledResults`, `isCompiling`, `errors` | ✅ |
| Tema oscuro verde esmeralda / gris oscuro | ✅ |

### 4.5 Instrucciones de la sección 7 (backend)

| Instrucción | Estado |
|---|---|
| Estructura FastAPI en `/backend` | ✅ |
| CORS para localhost | ✅ |
| `grammar.lark` | ❌ |
| `compiler.py` con el parser Lark | ❌ |
| Clases `@dataclass` `SymbolTable`, `Symbol`, `AddressTable` | ❌ |
| `POST /compile` con las 4 fases | ❌ |

---

## 5. Infraestructura y configuración

| Elemento | Estado | Detalle |
|---|---|---|
| Repositorio | ✅ | Frontend en la raíz (exigencia de Lovable) y backend en `backend/`. |
| Sincronización con Lovable | ✅ | Activa. Hay que configurar en Lovable las variables `VITE_SUPABASE_*`, porque `.env` no se sube al repositorio. |
| Variables de entorno | ✅ | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_API_URL` (opcional). Plantilla en `.env.example`. |
| Migración de base de datos | ✅ Escrita | `backend/supabase/migrations/20261026000000_create_contratos.sql`: tabla, índice, trigger y seguridad por usuario (RLS). **Debe ejecutarse en el proyecto de Supabase** para que funcione guardar y cargar. |
| Datos de ejemplo | ✅ | `backend/supabase/seed.sql` (opcional, solo desarrollo). |
| Verificación de tipos (TypeScript) | ✅ | Pasa sin errores. |
| Lint | ✅ | Sin errores de código; solo avisos de fin de línea de Windows (CRLF), que no afectan. |
| Pruebas automatizadas | ❌ | No hay pruebas unitarias ni de integración. |
| Despliegue de producción | ❌ | No configurado (solo la vista previa de Lovable y el entorno local). |

---

## 6. Limitaciones y errores conocidos

**Funcionales**
1. "Nuevo contrato" no limpia el editor si ya estás en el Playground; hay que recargar la página.
2. Eliminar un contrato no pide confirmación.
3. No existe "Olvidé mi contraseña".
4. No se puede duplicar un contrato ("Guardar como…").

**Del lenguaje / compilador**
5. `AÑOS` (con ñ) da error léxico; hay que escribir `ANIOS`.
6. Los números negativos (por ejemplo `-3%`) dan un error léxico en vez del mensaje semántico "tasa negativa". Por eso el ejemplo "Error semántico" muestra además errores léxicos.
7. No se aceptan separadores de miles (`10,000`).
8. `COMISION` no se refleja en la tabla de amortización.

**De interfaz**
9. El menú lateral se oculta en pantallas angostas sin un menú alternativo.
10. La página 404, la de error y el título de la pestaña del navegador siguen con textos de la plantilla, en inglés ("Lovable App").
11. Los mensajes de error de Supabase Auth aparecen en inglés.
12. Si el backend responde algo que no es JSON, el mensaje dice "No se pudo contactar el backend" aunque sí haya respondido.

---

## 7. Próximos pasos sugeridos

En orden de prioridad:

1. **Backend del compilador** (requisito académico central): `grammar.lark`, `compiler.py` con las clases `@dataclass` y `POST /compile`, siguiendo el formato de respuesta descrito en el manual para desarrolladores (sección 10.3). Después, configurar `VITE_API_URL`.
2. **Pruebas automatizadas** del compilador (Vitest para la versión TypeScript, pytest para la de Python), comparando ambos resultados.
3. **Corregir el lexer:** soporte de `ñ`, números negativos (para que llegue el error semántico) y separadores de miles.
4. **Mejoras de uso:** confirmación al eliminar, "Nuevo contrato" que limpie el editor, recuperación de contraseña y menú para móvil.
5. **Pulido:** traducir la página 404 y la de error, y cambiar el título y los metadatos de "Lovable App" a "FinScript Compiler Web".
6. **Despliegue:** configurar las variables en Lovable o en el hosting elegido y publicar el backend.
