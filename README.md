# UrbanInspect

Aplicación de inspección urbana para la Prueba I: Ionic 9, Angular 22 standalone, TypeScript y Capacitor 8.

## Ejecutar en navegador

Requisitos: Node compatible con Angular 22 y npm. Usar HTTPS o localhost para cámara y ubicación.

```sh
npm ci
npm start
```

Abre http://localhost:4200. Las pestañas son Inicio, Incidencias, Seguimiento y Nueva. El detalle se abre desde **Ver detalle**.

## Configuración

La configuración principal está en `src/environments/environment.ts` y su equivalente `environment.prod.ts`:

```ts
export const environment = {
  production: false, // true en environment.prod.ts
  incidenciasUrl: 'https://TU-PROYECTO.mockapi.io/TU-RECURSO/incidencias',
  cloudinaryCloudName: 'TU_CLOUD_NAME',
  cloudinaryPreset: 'TU_PRESET_UNSIGNED',
};
```

`src/app/environments/environment.ts` solo reexporta la configuración principal. El preset debe existir en la misma cuenta de Cloudinary y ser **Unsigned**. No incluir API secret, contraseñas, claves de firma ni credenciales privadas. Los valores de Angular son visibles en el cliente. La API MockAPI de demostración es pública; no registrar datos personales.

## Decisiones técnicas y dependencias

- **HttpClient + RxJS**: API REST, paginación remota y límites de espera. El listado pide grupos de 8, no descarga todo para dividirlo localmente.
- **MockAPI**: recurso `incidencias`, GET por página/código/id, POST y PUT. Campos: id, codigo, tipo, descripcion, direccion, sector, fecha ISO, estado, prioridad, fotoUrl, latitud, longitud y observacion.
- **Open-Meteo**: API meteorológica independiente, sin clave. Temperatura actual y código WMO; precipitación horaria acumulada correspondiente a la última marca horaria no posterior a la hora actual. No se usan datos fijos en la aplicación. https://open-meteo.com/en/docs
- **Camera + PWA Elements**: captura nativa y alternativa de cámara en navegador. La foto confirmada se previsualiza y conserva. Se reduce a 1024 px/calidad 60 antes de subirla.
- **Cloudinary**: almacena la fotografía y la API conserva su URL HTTPS pública, no una ruta temporal.
- **Geolocation**: GPS y permisos; captura de alta precisión con espera de 15 s. Hay entrada manual validada entre -90/90 y -180/180.
- **Preferences**: solo en el dispositivo, códigos de seguimiento y borrador del formulario. Las escrituras se serializan para que el último cambio no sea sobrescrito por uno anterior.
- **App**: guarda el borrador al pasar a segundo plano. Antes de abrir la cámara se espera a guardar el formulario. Si Android termina el proceso antes de que la cámara confirme una nueva foto, esa captura incompleta puede perderse; el formulario y la última foto ya confirmada permanecen.
- **Ionicons**: iconos de navegación y seguimiento. Los plugins Haptics, Keyboard y StatusBar provienen del proyecto Ionic base; no son necesarios para las reglas de negocio.
- **Vitest/HttpTestingController y Playwright**: verifican reglas y navegación. Los datos simulados de pruebas están aislados y nunca sustituyen el clima real de la aplicación.

## Reglas funcionales

- Tipo, descripción, dirección, sector y prioridad obligatorios; textos de solo espacios rechazados.
- Prioridad alta exige foto; baja/media permiten omitirla.
- Bache exige coordenadas GPS o manuales válidas. En otros tipos son opcionales.
- Antes de guardar con coordenadas se consulta el clima si no hay resultado reciente (5 minutos) para esas mismas coordenadas. Cambiar la ubicación invalida el clima anterior. Si falla se informa y se permite guardar; lluvia estrictamente mayor que 5 mm genera advertencia y no bloquea. Sin coordenadas se explica por qué no puede consultarse y se conserva la ubicación opcional de R7.
- Estados: pendiente → en_proceso/resuelta; en_proceso → resuelta; resuelta no puede reabrirse. Resolver exige observación no vacía.
- El borrador se guarda automáticamente al editar y antes de abrir la cámara. Al volver al formulario o reiniciar se ofrece continuar o descartar. No se restaura un clima viejo como si fuera actual.
- Se conserva el mismo código al reintentar; se consulta antes de crear para evitar duplicados tras una respuesta perdida. No es una transacción del servidor: MockAPI no garantiza unicidad frente a clientes concurrentes.
- Inicio recalcula indicadores al entrar y tiene actualización manual. Listado, seguimiento y detalle se recargan al entrar.

## Datos de demostración

```sh
npm run datos:demo
```

Este comando **modifica la API configurada**: respalda los registros existentes en `.local/backups/` y agrega un catálogo de 17 incidencias con direcciones y sectores de Quito: **10 pendientes, 5 en proceso y 2 resueltas**. No elimina ni sobrescribe registros; al repetirlo omite los códigos `UIO-0001` a `UIO-0017` existentes. El listado de 8 permite demostrar tres páginas.

Los títulos visibles no incluyen las etiquetas DEMO ni prueba. El catálogo es ficticio y las fotos de Quito son referencias de los lugares, no evidencia real del daño. Créditos y licencias: [scripts/FOTOS_QUITO.md](scripts/FOTOS_QUITO.md). Vista previa sin acceso a la API: `node scripts/preparar-datos.mjs --preview`.

## Verificaciones

```sh
npm run build
npm run test:unit
npm run test:e2e
```

Las pruebas E2E usan Chrome instalado y respuestas interceptadas; no escriben en MockAPI. Cubren indicadores, marcar sin abrir detalle, persistencia tras recarga, recuperar/descartar formulario, filtro remoto de los contadores y diseño adaptable. Las pruebas unitarias cubren además el umbral de lluvia, falla meteorológica, campos obligatorios, foto obligatoria, ubicación de bache, cancelación de cámara, transiciones y fin de paginación.

## Android y APK

Requisitos: Android Studio, Android SDK 36, Java **21**. El proyecto nativo está en `android/`. El manifiesto declara cámara y ubicación fina/aproximada; no se exige hardware GPS/cámara para instalar.

En PowerShell:

```powershell
./scripts/build-android.ps1
```

Alternativa manual:

```sh
npm run android:sync
npm run android:open
```

Compilar `assembleDebug` desde Android Studio o `android/gradlew.bat`. APK: `android/app/build/outputs/apk/debug/app-debug.apk`. Es un APK de desarrollo firmado, apto para la demostración; no una publicación en Play Store. Instalarlo con `adb install -r RUTA_AL_APK` o abrir el APK en un teléfono permitiendo la instalación desde esa fuente.

## Guion de defensa (dispositivo Android/emulador)

1. Mostrar indicadores, recorrer al menos tres páginas y verificar que no hay peticiones infinitas al terminar.
2. Marcar dos casos, cerrar completamente y volver a abrir; comprobar que permanecen. Desmarcar uno desde Seguimiento y verificar que no modifica MockAPI.
3. Intentar guardar campos vacíos y prioridad alta sin foto; comprobar el bloqueo.
4. Negar ubicación en un bache, ingresar coordenadas manuales válidas y consultar clima con ellas.
5. Mostrar temperatura, precipitación horaria y condición reales. Explicar advertencia >5 mm (probada con HttpTestingController, sin falsear el clima de producción) y probar error de red.
6. Capturar foto y cancelarla sin perder datos; confirmar otra foto y previsualizarla.
7. Escribir un formulario, cambiar de pestaña o cerrar la app, volver, continuar y luego demostrar descarte. Repetir cerrando durante captura: los campos anteriores sobreviven.
8. Guardar, comprobar en MockAPI/listado/Inicio y abrir la fotografía desde Detalle después de reiniciar.
9. Cambiar pendiente a en proceso y luego resuelta con observación. Comprobar que resuelta no ofrece volver atrás y verificar el PUT remoto.

## Repositorio y entrega

Incluir código fuente, `android/`, este README, tests y lockfile. No incluir node_modules, www, builds, `.local/`, `android/local.properties` ni secretos. Crear el repositorio GitHub personal y subirlo antes de la defensa; esa cuenta y la explicación oral corresponden al estudiante. La interfaz funcional se puede mejorar después sin cambiar estas reglas.

## Mejora posterior: splash y logo

Trabajo aislado en `mejoras/splash-logo`. La rama `main` permanece en su commit original `0a77b2e`. La etiqueta `evidencia-antes-splash` conserva además los cambios locales que existían antes de esta mejora. No se fusiona la mejora sobre la versión original.

El logo vectorial propio está en `src/assets/brand/urbaninspect-logo.svg`: edificios dentro de un pin, con la paleta blanca, azul y roja. Se utiliza en encabezados, favicon y pantalla de inicio. Android incluye recursos vectoriales equivalentes para el icono instalable y el splash nativo, compatibles con máscaras adaptativas.

El splash de la interfaz dura 1,2 segundos a partir del primer renderizado y solo aparece al arrancar. No espera a la API ni bloquea por problemas de conexión. Se respeta la preferencia de movimiento reducido y se retira la navegación del foco mientras está visible. Android muestra el mismo símbolo durante la carga nativa.

Cloudinary continúa integrado mediante `ImagenService`; no se modificaron sus credenciales ni el flujo de subida de fotografías. La prueba `e2e/splash.spec.ts` verifica logo visible, desaparición del splash y navegación posterior.
