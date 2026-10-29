# Manual de usuario — FinScript Compiler Web

Este manual explica, paso a paso, cómo usar FinScript Compiler Web. No necesitas saber programar ni conocer de finanzas: cada término se explica la primera vez que aparece y al final hay un glosario.

---

## Índice

1. [¿Qué es FinScript Compiler Web?](#1-qué-es-finscript-compiler-web)
2. [Lo que necesitas antes de empezar](#2-lo-que-necesitas-antes-de-empezar)
3. [Crear tu cuenta](#3-crear-tu-cuenta)
4. [Iniciar sesión](#4-iniciar-sesión)
5. [Conoce la pantalla principal](#5-conoce-la-pantalla-principal)
6. [Cómo escribir un contrato en FinScript](#6-cómo-escribir-un-contrato-en-finscript)
7. [Compilar tu contrato](#7-compilar-tu-contrato)
8. [Entender los resultados](#8-entender-los-resultados)
9. [Cuando algo sale mal: errores y advertencias](#9-cuando-algo-sale-mal-errores-y-advertencias)
10. [Guardar tus contratos](#10-guardar-tus-contratos)
11. [Abrir un contrato guardado](#11-abrir-un-contrato-guardado)
12. [La pantalla "Mis contratos"](#12-la-pantalla-mis-contratos)
13. [Cerrar sesión](#13-cerrar-sesión)
14. [Preguntas frecuentes](#14-preguntas-frecuentes)
15. [Glosario](#15-glosario)

---

## 1. ¿Qué es FinScript Compiler Web?

Es una aplicación web para **simular préstamos**. Tú escribes las condiciones del préstamo (cuánto dinero, a qué tasa de interés y a cuántos meses) y la aplicación calcula cuánto pagarás cada mes y cómo va bajando tu deuda.

Las condiciones se escriben en un formato muy sencillo llamado **FinScript**. Por ejemplo:

```
MONEDA: USD
CAPITAL: 10000
TASA_ANUAL: 12.5%
PLAZO: 6 MESES
```

Esto significa: "Un préstamo de 10,000 dólares, con 12.5 % de interés al año, a pagar en 6 meses".

Al presionar **Compilar contrato**, la aplicación:

1. Lee lo que escribiste.
2. Revisa que esté bien escrito y que tenga sentido (por ejemplo, que el capital sea mayor que cero).
3. Si todo está bien, te muestra la **tabla de amortización**: el detalle de tus pagos mes por mes.
4. Si algo está mal, te dice **en qué línea** está el problema y **por qué**.

Además, puedes **guardar** tus contratos en tu cuenta para volver a abrirlos después.

---

## 2. Lo que necesitas antes de empezar

- Una computadora o tableta con un navegador actualizado (Chrome, Edge, Firefox o Safari).
- Conexión a internet.
- Un correo electrónico al que tengas acceso (para crear tu cuenta).
- La dirección web de la aplicación (te la proporciona quien la instaló; si se ejecuta en tu propia computadora suele ser `http://localhost:8080`).

> **Recomendación:** usa una pantalla de computadora o una tableta en horizontal. En pantallas muy angostas (como un celular) el menú lateral se oculta y la vista dividida se ve muy apretada.

---

## 3. Crear tu cuenta

Solo necesitas hacer esto una vez.

1. Abre la dirección web de la aplicación. Si no has iniciado sesión, verás la pantalla **Acceso**.
2. Arriba del formulario hay dos pestañas: **Iniciar sesión** y **Registrarme**. Haz clic en **Registrarme**.
3. En **Correo**, escribe tu correo electrónico (por ejemplo, `ana@ejemplo.com`).
4. En **Contraseña**, escribe una contraseña de **al menos 6 caracteres**. Anótala en un lugar seguro.
5. Haz clic en **Crear cuenta**.

Puede pasar una de estas dos cosas:

- **Entras directamente al Playground.** Tu cuenta ya está lista.
- **Aparece el mensaje "Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión."** En ese caso:
  1. Abre tu correo y busca un mensaje de confirmación (revisa también la carpeta de *spam* o *correo no deseado*).
  2. Haz clic en el enlace del mensaje.
  3. Regresa a la aplicación e inicia sesión (sección 4).

**Si aparece un error:**

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| "Ingresa un correo válido y una contraseña de 6 caracteres o más." | El correo no tiene `@` o la contraseña es muy corta. | Corrige el correo o usa una contraseña más larga. |
| "User already registered" | Ya existe una cuenta con ese correo. | Usa la pestaña **Iniciar sesión**. |

---

## 4. Iniciar sesión

1. En la pantalla **Acceso**, asegúrate de estar en la pestaña **Iniciar sesión**.
2. Escribe tu **correo** y tu **contraseña**.
3. Haz clic en **Entrar al playground**.

Si todo es correcto verás el mensaje "Sesión iniciada" y entrarás a la pantalla principal.

**Si aparece un error:**

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| "Invalid login credentials" | El correo o la contraseña no coinciden. | Revisa que estén bien escritos (cuidado con mayúsculas). |
| "Email not confirmed" | Aún no confirmas tu correo. | Busca el correo de confirmación y haz clic en el enlace. |

> Tu sesión se mantiene abierta aunque cierres o recargues el navegador. No tendrás que escribir tu contraseña cada vez, a menos que cierres sesión.

---

## 5. Conoce la pantalla principal

La pantalla principal se llama **Playground** (área de pruebas). Tiene cuatro zonas:

```
┌──────────────┬───────────────────────────────────────────────────────────┐
│              │  (B) Barra superior: título · Ejemplos · Cargar · Guardar │
│  (A) Menú    ├─────────────────────────────┬─────────────────────────────┤
│   lateral    │  (C) Editor                 │  (D) Panel de resultados    │
│              │  [Compilar contrato]        │  Pestañas: Resultados,      │
│ Nuevo        │                             │  Consola/Errores, Símbolos, │
│ contrato     │  1 │ MONEDA: USD            │  Direcciones, AST, Tokens   │
│ Mis          │  2 │ CAPITAL: 10000         │                             │
│ contratos    │  3 │ ...                    │                             │
│              │                             │                             │
│ tu correo    │                             │                             │
│ Cerrar sesión│                             │                             │
└──────────────┴─────────────────────────────┴─────────────────────────────┘
```

**(A) Menú lateral (izquierda)**
- **Nuevo contrato:** te lleva al Playground.
- **Mis contratos:** muestra la lista de contratos que has guardado.
- Abajo aparece **tu correo** y el botón **Cerrar sesión**.

**(B) Barra superior**
- A la izquierda ves el **título** del contrato y si está "Contrato guardado" o es un "Borrador no guardado".
- **Ejemplos:** carga contratos de muestra para practicar.
- **Cargar:** abre uno de tus contratos guardados.
- **Guardar:** guarda el contrato actual en tu cuenta.

**(C) Editor (columna izquierda)**
- Aquí escribes tu contrato. A la izquierda del texto hay **números de línea**, que te ayudan a ubicar los errores.
- Arriba está el botón verde **Compilar contrato**.
- Abajo se recuerdan las palabras clave que puedes usar.

**(D) Panel de resultados (columna derecha)**
- Muestra el resultado de la compilación en varias pestañas (se explican en la sección 8).

> **Tip:** la línea vertical entre el editor y los resultados se puede **arrastrar** con el ratón para darle más espacio a una u otra columna.

---

## 6. Cómo escribir un contrato en FinScript

### 6.1 La regla básica

Cada línea tiene la forma:

```
CLAVE: valor
```

- **CLAVE** es el nombre del dato (por ejemplo, `CAPITAL`).
- Después van **dos puntos** `:` (son obligatorios).
- Después va el **valor** (por ejemplo, `10000`).
- Escribe **un dato por línea**.

### 6.2 Las claves disponibles

| Clave | ¿Obligatoria? | Qué significa | Valores permitidos | Ejemplo |
|---|---|---|---|---|
| `MONEDA` | Sí | La moneda del préstamo. | `USD` (dólar), `MXN` (peso mexicano), `EUR` (euro) | `MONEDA: MXN` |
| `CAPITAL` | Sí | La cantidad de dinero que te prestan. | Un número mayor que 0. Puede tener decimales con punto. | `CAPITAL: 250000` |
| `TASA_ANUAL` | Sí | El interés que cobra el préstamo **por año**. | Un número mayor o igual a 0, con o sin `%`. | `TASA_ANUAL: 18%` |
| `PLAZO` | Sí | En cuánto tiempo pagarás el préstamo. | Un número entero seguido de `MESES`, `MES` o `ANIOS`. Si no pones unidad, se entiende que son meses. | `PLAZO: 12 MESES` |
| `METODO` | No | La forma de calcular los pagos (ver 6.4). Si no lo escribes, se usa `FRANCES`. | `FRANCES` o `ALEMAN` | `METODO: ALEMAN` |
| `COMISION` | No | Una comisión en porcentaje. Se registra en el contrato, pero **no cambia** los cálculos de la tabla. | Un número mayor o igual a 0, con o sin `%`. | `COMISION: 1.5%` |

### 6.3 Reglas de escritura importantes

- **Mayúsculas o minúsculas da igual:** `capital: 5000` funciona igual que `CAPITAL: 5000`. Por claridad se recomienda usar mayúsculas.
- **No uses comas ni símbolos de moneda en los números.** Escribe `10000`, no `10,000` ni `$10000`.
- **Los decimales se escriben con punto:** `12.5`, no `12,5`.
- **Para años escribe `ANIOS`** (sin la letra ñ). Ejemplo: `PLAZO: 2 ANIOS` equivale a 24 meses. Si escribes `AÑOS` aparecerá un error.
- **Cada clave solo puede aparecer una vez.** No escribas dos líneas `CAPITAL:`.
- **Comentarios:** todo lo que escribas después de `//` se ignora. Úsalo para dejar notas:
  ```
  // Préstamo para el auto
  CAPITAL: 150000   // precio del auto
  ```
- **Las líneas vacías se ignoran**, así que puedes dejar espacios para que se lea mejor.
- El orden de las líneas no importa.

### 6.4 ¿Francés o alemán? Los dos métodos de pago

- **`FRANCES` (cuota fija):** pagas **la misma cantidad todos los meses**. Al principio, buena parte del pago se va a intereses; al final, casi todo va a reducir tu deuda. Es el más común en préstamos personales e hipotecas.
- **`ALEMAN` (amortización constante):** cada mes reduces tu deuda **en la misma cantidad**, más los intereses de ese mes. Por eso **los primeros pagos son más altos** y van bajando con el tiempo. En total pagas menos intereses que con el método francés.

### 6.5 Ejemplos listos para usar

**Préstamo sencillo en dólares (método francés):**
```
MONEDA: USD
CAPITAL: 10000
TASA_ANUAL: 12.5%
PLAZO: 6 MESES
METODO: FRANCES
```

**Préstamo en pesos a un año (método alemán):**
```
MONEDA: MXN
CAPITAL: 250000
TASA_ANUAL: 18%
PLAZO: 12 MESES
METODO: ALEMAN
```

**Préstamo a 3 años con comentarios:**
```
// Crédito para equipo de oficina
MONEDA: EUR
CAPITAL: 30000
TASA_ANUAL: 9.75%
PLAZO: 3 ANIOS     // = 36 meses
```

> **Atajo:** en lugar de escribir desde cero, haz clic en **Ejemplos** (barra superior) y elige uno. Hay dos ejemplos correctos y dos con errores a propósito, para que veas cómo se reportan.

---

## 7. Compilar tu contrato

"Compilar" significa que la aplicación lee tu contrato, lo revisa y calcula los resultados.

1. Escribe o pega tu contrato en el editor.
2. Haz clic en **Compilar contrato** (botón verde, arriba del editor).
3. Mientras trabaja, el botón muestra un círculo girando. Normalmente tarda menos de un segundo.
4. Verás un mensaje en la esquina de la pantalla:
   - **"Compilado en X ms"** → todo salió bien. Ve a la pestaña **Resultados (Tabla)**.
   - **"N error(es) de compilación"** → hay algo que corregir. Ve a la pestaña **Consola/Errores** (sección 9).

Arriba a la derecha del panel de resultados aparece una etiqueta:
- **Verde "HTTP 200"**: compilación exitosa.
- **Roja "HTTP 400"**: hubo errores.

Junto a ella dice **"compilador local"** o **"backend"**, que indica dónde se hizo el cálculo. Para ti como usuario el resultado es el mismo.

> Puedes compilar todas las veces que quieras. Compilar **no guarda** el contrato; para eso usa **Guardar** (sección 10).

---

## 8. Entender los resultados

El panel derecho tiene seis pestañas. Para el uso normal solo necesitas las dos primeras; las demás son técnicas.

### 8.1 Resultados (Tabla) — la más importante

Si la compilación fue exitosa, verás tres partes.

**a) Cuatro tarjetas de resumen**

| Tarjeta | Qué significa |
|---|---|
| **Cuota mensual** | Lo que pagas cada mes. En el método alemán es el pago del **primer** mes (el más alto). |
| **Tasa mensual** | La tasa anual dividida entre 12. Es el interés que se cobra cada mes. |
| **Total intereses** | Cuánto pagas en intereses durante todo el préstamo, es decir, lo que te "cuesta" pedir prestado. |
| **Compilación** | Cuánto tardó la aplicación en hacer el cálculo (en milisegundos). |

**b) Gráfica de saldo**

Muestra cómo **baja tu deuda** mes a mes hasta llegar a cero. El eje horizontal son los meses y el vertical, lo que aún debes.

**c) Tabla de amortización**

Una fila por cada mes:

| Columna | Qué significa |
|---|---|
| **#** | Número del mes (1, 2, 3…). |
| **Saldo inicial** | Lo que debes al comenzar ese mes. |
| **Cuota** | Lo que pagas ese mes. |
| **Interés** | La parte de tu pago que es interés (el "costo" del préstamo ese mes). |
| **Capital** | La parte de tu pago que **reduce tu deuda**. |
| **Saldo final** | Lo que debes después de pagar ese mes. |

Siempre se cumple: **Cuota = Interés + Capital**, y **Saldo final = Saldo inicial − Capital**. En el último mes el saldo final es 0.

**Ejemplo real** con el primer contrato de la sección 6.5 (10,000 USD, 12.5 % anual, 6 meses, método francés):

| # | Saldo inicial | Cuota | Interés | Capital | Saldo final |
|---|---|---|---|---|---|
| 1 | 10000.00 | 1727.96 | 104.17 | 1623.79 | 8376.21 |
| 2 | 8376.21 | 1727.96 | 87.25 | 1640.70 | 6735.51 |
| 3 | 6735.51 | 1727.96 | 70.16 | 1657.79 | 5077.71 |
| 4 | 5077.71 | 1727.96 | 52.89 | 1675.06 | 3402.65 |
| 5 | 3402.65 | 1727.96 | 35.44 | 1692.51 | 1710.14 |
| 6 | 1710.14 | 1727.96 | 17.81 | 1710.14 | 0.00 |

Resumen: cuota mensual de **1,727.96 USD**, tasa mensual de **1.0417 %** y **367.73 USD** de intereses en total. Observa cómo el interés baja cada mes y la parte que reduce tu deuda sube.

### 8.2 Consola/Errores

Aquí aparecen los mensajes del proceso de compilación:
- **Recuadros rojos:** errores que impiden calcular. Indican el tipo, la línea, la columna y el motivo.
- **Recuadros amarillos:** advertencias. El cálculo se hace, pero algo parece raro (por ejemplo, una tasa mayor a 100 %).
- **Texto gris:** el registro de cada fase del compilador.
- **Texto verde:** "Compilación exitosa sin errores".

Si hay errores, la pestaña muestra un número en rojo con la cantidad.

### 8.3 Pestañas técnicas (opcionales)

Estas pestañas muestran cómo "piensa" el compilador por dentro. Son útiles en un curso de compiladores, pero **no las necesitas** para simular un préstamo.

- **Tabla de Símbolos:** cada dato de tu contrato con su tipo (número, porcentaje, moneda…), valor y línea donde se declaró.
- **Direcciones:** una simulación de cómo se acomodarían los datos en memoria (posición, tamaño y segmento).
- **AST:** el "árbol" que representa la estructura de tu contrato, en forma de lista con sangrías y también en formato JSON.
- **Tokens:** cada "palabra" o símbolo que el compilador reconoció en tu texto, con su tipo, línea y columna.

---

## 9. Cuando algo sale mal: errores y advertencias

### 9.1 Cómo localizar un error

1. Abre la pestaña **Consola/Errores**.
2. Lee el mensaje. Por ejemplo:
   `[SEMANTICO] línea 2, columna 1: CAPITAL debe ser mayor que 0 (se recibió 0).`
3. En el editor, el **número de línea** con error aparece **resaltado en rojo**. Ve a esa línea.
4. Corrige el texto y vuelve a presionar **Compilar contrato**.

### 9.2 Tipos de error

- **LÉXICO:** escribiste un carácter que el compilador no reconoce (por ejemplo `$`, `,` o `ñ`).
- **SINTÁCTICO:** la línea no tiene la forma correcta `CLAVE: valor` (falta `:`, la clave está mal escrita o falta el valor).
- **SEMÁNTICO:** la línea está bien escrita, pero el dato no tiene sentido (capital en cero, moneda no soportada, falta una clave obligatoria, etc.).

> Si hay errores léxicos o sintácticos, el compilador se detiene ahí y no llega a revisar los semánticos. Por eso, al corregir unos errores pueden aparecer otros nuevos; es normal.

### 9.3 Errores más comunes y cómo arreglarlos

| Mensaje (resumido) | Causa | Cómo arreglarlo |
|---|---|---|
| Falta el separador ":" | Escribiste `MONEDA USD`. | Agrega los dos puntos: `MONEDA: USD`. |
| Token desconocido "TASA_ANUL" | La clave está mal escrita. | Usa una clave válida: `TASA_ANUAL`. |
| La declaración "X" no tiene valor asignado | Escribiste `CAPITAL:` sin número. | Agrega el valor: `CAPITAL: 5000`. |
| Símbolo no reconocido: "," | Usaste coma en un número (`10,000`). | Escribe `10000`. Para decimales usa punto. |
| Símbolo no reconocido: "$" | Pusiste el signo de pesos o dólares. | Quítalo; la moneda va en `MONEDA:`. |
| Símbolo no reconocido: "Ñ" | Escribiste `AÑOS`. | Escribe `ANIOS`. |
| Declaración obligatoria ausente: "PLAZO" | Te faltó una clave obligatoria. | Agrega las cuatro: `MONEDA`, `CAPITAL`, `TASA_ANUAL`, `PLAZO`. |
| No se pueden mezclar monedas | Hay dos líneas `MONEDA:`. | Deja solo una. |
| Variable "X" redeclarada | Repetiste una clave. | Borra la línea repetida. |
| Moneda "..." no soportada | Usaste otra moneda (por ejemplo `COP`). | Usa `USD`, `MXN` o `EUR`. |
| CAPITAL debe ser mayor que 0 | Pusiste `0` o un número negativo. | Escribe una cantidad positiva. |
| Símbolo no reconocido: "-" | Escribiste un número negativo, por ejemplo `TASA_ANUAL: -3%`. | Los valores no pueden ser negativos; usa una tasa de 0 o más. |
| PLAZO inválido | Formato raro, por ejemplo `PLAZO: seis meses`. | Usa número y unidad: `PLAZO: 6 MESES`. |
| PLAZO debe ser un número entero de meses | Pusiste `PLAZO: 2.5 MESES` o `0`. | Usa un número entero mayor que 0. |
| METODO "..." no válido | Escribiste otro método. | Usa `FRANCES` o `ALEMAN` (sin acento). |
| No se pudo contactar el backend | El servidor de cálculo no responde. | Avisa al administrador (ver preguntas frecuentes). |

### 9.4 Advertencias

Las advertencias **no impiden** el cálculo; solo te avisan de algo inusual:

- **"Tasa anual inusualmente alta"**: la tasa es mayor a 100 %. Revisa si quisiste escribir, por ejemplo, `12.5%` en vez de `125%`.
- **"Plazo de N meses supera 40 años"**: el plazo es mayor a 480 meses. Verifica que no sea un error de dedo.

---

## 10. Guardar tus contratos

1. Haz clic en **Guardar** (barra superior).
2. Se abre una ventana con el campo **Título**. Escribe un nombre que te ayude a reconocerlo, por ejemplo "Crédito auto 2026". No puede quedar vacío.
3. Haz clic en **Guardar contrato**.
4. Verás el mensaje "Contrato guardado" y, debajo del título, el texto "Contrato guardado".

**Actualizar un contrato que ya guardaste:** si el contrato abierto ya estaba guardado, el botón dice **Actualizar contrato**. Al usarlo se **reemplaza** la versión anterior con lo que tienes en el editor (y el nuevo título, si lo cambiaste).

> **Importante:**
> - Guardar **no compila**. Puedes guardar un contrato aunque tenga errores y corregirlo después.
> - Si cierras o recargas la página sin guardar, **pierdes los cambios**.
> - Tus contratos son **privados**: solo tú puedes verlos, aunque otras personas usen la misma aplicación.

---

## 11. Abrir un contrato guardado

Tienes dos formas:

**Desde el Playground:**
1. Haz clic en **Cargar** (barra superior).
2. Aparece la lista de tus contratos, del más reciente al más antiguo.
3. Haz clic en el que quieras. Se carga en el editor y verás el mensaje "Cargado: (título)".
4. Presiona **Compilar contrato** para ver sus resultados.

**Desde "Mis contratos":** ver la sección 12.

> Si en la lista de **Cargar** aparece "Sin contratos guardados", aún no has guardado ninguno.

---

## 12. La pantalla "Mis contratos"

Haz clic en **Mis contratos** en el menú lateral. Verás una tarjeta por cada contrato guardado con:

- El **título**.
- Un identificador corto y la **fecha y hora** en que se creó.
- Una vista previa del **código** del contrato.

Cada tarjeta tiene dos botones:

- **Abrir:** lleva el contrato al Playground para verlo, compilarlo o modificarlo.
- **Bote de basura (eliminar):** borra el contrato **de inmediato y para siempre**. No hay confirmación ni forma de recuperarlo, así que úsalo con cuidado.

Si no tienes contratos, verás el mensaje "Aún no has guardado contratos" y un botón **Nuevo contrato**.

---

## 13. Cerrar sesión

1. En la parte inferior del menú lateral, haz clic en **Cerrar sesión**.
2. Volverás a la pantalla **Acceso**.

Cierra sesión siempre que uses una computadora compartida o pública.

---

## 14. Preguntas frecuentes

**¿Empezar un contrato nuevo borra el que tengo abierto?**
No borra nada de lo guardado. Si quieres empezar desde cero y al pulsar **Nuevo contrato** sigues viendo el contrato anterior, **recarga la página** (tecla `F5`): el editor vuelve al ejemplo inicial como "Borrador no guardado". Antes de hacerlo, guarda lo que quieras conservar.

**¿Cómo hago una copia de un contrato?**
Abre el contrato, selecciona todo el texto del editor (`Ctrl + A`) y cópialo (`Ctrl + C`). Recarga la página (`F5`), borra el texto del editor, pega el contrato (`Ctrl + V`) y guárdalo con un título nuevo.

**¿Los cálculos son exactos?**
Los montos se redondean a 2 decimales en cada mes. Úsalos como simulación o referencia; un banco puede incluir cargos adicionales (seguros, impuestos, comisiones) que esta herramienta no calcula.

**¿Por qué la "Cuota mensual" no coincide con todos los meses en el método alemán?**
Porque en el método alemán la cuota cambia cada mes. La tarjeta muestra la del primer mes, que es la más alta. Revisa la tabla para ver todas.

**¿Puedo usar la tasa de interés en 0 %?**
Sí. El préstamo se divide en partes iguales y el total de intereses será 0.

**Me aparece "No se pudo contactar el backend". ¿Qué hago?**
Significa que la aplicación está configurada para calcular en un servidor externo y ese servidor no está respondiendo. No es un problema de tu contrato. Avisa a la persona que administra la aplicación.

**Me aparece "No se pudieron cargar los contratos" o "No se pudo guardar".**
Revisa tu conexión a internet y vuelve a intentarlo. Si sigue pasando, cierra sesión, vuelve a entrar e inténtalo otra vez. Si persiste, avisa al administrador.

**La página me regresa a "Acceso" sin razón aparente.**
Tu sesión terminó (por ejemplo, porque cerraste sesión en otra pestaña). Vuelve a iniciar sesión; tus contratos guardados siguen ahí.

**Olvidé mi contraseña.**
La aplicación todavía no tiene la opción "Olvidé mi contraseña". Pide al administrador que te ayude a restablecerla.

---

## 15. Glosario

- **Amortización:** ir pagando una deuda poco a poco hasta dejarla en cero.
- **AST (árbol de sintaxis abstracta):** representación en forma de árbol de cómo está organizado tu contrato. Es un concepto de compiladores.
- **Capital:** el dinero que te prestan. En la tabla, también es la parte de cada pago que reduce tu deuda.
- **Compilar:** leer el contrato, revisar que esté bien y generar los resultados.
- **Cuota:** el pago que haces cada mes.
- **Error léxico / sintáctico / semántico:** un carácter no reconocido, una línea mal formada o un dato sin sentido, respectivamente (ver sección 9.2).
- **FinScript:** el formato sencillo (`CLAVE: valor`) en el que se escriben los contratos de esta aplicación.
- **Interés:** lo que cobra quien presta por prestarte el dinero.
- **Método alemán:** cada mes reduces tu deuda en la misma cantidad; los pagos empiezan altos y van bajando.
- **Método francés:** pagas la misma cuota todos los meses.
- **Plazo:** el tiempo que tienes para pagar el préstamo.
- **Playground:** la pantalla principal donde escribes y compilas contratos.
- **Saldo (o saldo insoluto):** lo que todavía debes.
- **Tabla de amortización:** la tabla que muestra, mes por mes, cuánto pagas, cuánto es interés, cuánto reduce tu deuda y cuánto te falta.
- **Tasa anual:** el porcentaje de interés que se cobra en un año.
- **Tasa mensual:** la tasa anual dividida entre 12.
- **Token:** cada "palabra" o símbolo que el compilador reconoce en tu texto.
