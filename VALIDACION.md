# Validación funcional de UrbanInspect

Revisión realizada el 27 de octubre de 2026, hora de Ecuador.

## Resultado de las comprobaciones ejecutadas

- Compilación web de producción: correcta.
- Pruebas unitarias: **28 de 28**, en 15 archivos.
- Pruebas de navegador Chrome móvil: **4 de 4**.
- Compilación Android `assembleDebug`: correcta, con JDK 21 y SDK 36.
- APK instalado y abierto en el emulador Android local: correcto.
- Inicio en Android: muestra los **24 registros reales de MockAPI**, distribuidos en 8 pendientes, 8 en proceso y 8 resueltos al preparar la demostración.
- Seguimiento nativo: se marcaron dos casos, se cerró por completo el proceso, se abrió de nuevo y se verificó que permanecían; se quitaron sin escribir en MockAPI.
- Borrador nativo: se escribieron datos, se salió del formulario, se cerró completamente el proceso, se recuperaron al reabrir y se comprobó el descarte.
- Cámara nativa: se abrió y canceló; el texto del formulario permaneció intacto.
- Ubicación nativa: Geolocation obtuvo las coordenadas del emulador con permisos concedidos.
- Los borradores y marcas de estas comprobaciones locales se limpiaron al terminar.

## Cobertura por requisito

| Requisito | Implementación y comprobación |
| --- | --- |
| R1 | Preferences guarda solo códigos locales. Persistencia probada entre instancias, en navegador y tras cierre completo de Android. |
| R2 | Lista código, tipo, descripción, dirección, sector, fecha, estado y foto; tiene mensajes de vacío/error. |
| R3 | Pide páginas remotas de 8 y concatena resultados; prueba verifica que no pide más al detectar el final. Hay 24 registros para tres páginas. Si la última página está completa, una respuesta vacía permite descubrir el final. |
| R4 | Open-Meteo real, coordenadas de la incidencia, temperatura actual, precipitación horaria y condición. Consulta automática antes de guardar si no hay resultado reciente para esas coordenadas. Umbral estrictamente >5 mm y datos ausentes probados en tests; error no bloquea el registro. |
| R5 | Campos obligatorios y textos sin espacios; foto obligatoria con prioridad alta. POST remoto y código estable al reintentar. |
| R6 | Captura y vista previa, conservación al cancelar, manejo de permisos. Fotografía confirmada se sube a Cloudinary y queda como URL HTTPS en la API y el detalle. |
| R7 | GPS nativo y entrada manual validada; bache exige coordenadas. Tipos restantes admiten solo dirección. |
| R8 | Borrador automático con escritura ordenada, antes de abrir cámara y al salir; continuar/descartar al volver. Persistencia nativa comprobada tras cerrar el proceso. |
| R9 | Transiciones válidas y observación para resolver; tests impiden reabrir resuelta o resolver sin observación. El detalle usa PUT remoto. |
| R10 | Inicio con indicadores reales, pestañas, detalle y registro; recarga al entrar; APK compilado e instalado en emulador. |

## Datos de demostración

Con autorización explícita se respaldaron los 12 registros originales en `.local/backups/`, se corrigieron solamente las 11 filas automáticas inválidas y se agregaron 12 ejemplos. La incidencia real existente se conservó. Hay 24 registros, cinco tipos y tres prioridades. Los ejemplos están identificados como demostración; sus fotos de ejemplo no son evidencia real de infraestructura.

## Límites y preparación de la defensa

- Las pruebas de lluvia >5 mm usan respuestas controladas únicamente dentro de los tests. La app de producción no falsifica el clima; para demostrar lluvia real debe existir esa condición en la API.
- Se probó la apertura/cancelación de cámara en Android. Conviene repetir la captura confirmada, subida y permisos denegados en el teléfono que se llevará a la defensa.
- Si Android termina el proceso antes de confirmar una nueva captura, esa foto puede no recuperarse. Los campos y la última foto ya confirmada se guardan antes de abrir la cámara.
- La lógica de estados está validada automáticamente; ensayar el cambio real con un caso de demostración y verificar el PUT desde MockAPI.
- El repositorio Git local está presente, pero no tiene remoto GitHub configurado. Falta asociarlo a la cuenta/repositorio del estudiante y publicarlo para la entrega.
- No se ha evaluado ni preparado la defensa oral del estudiante. Usar el guion del README y explicar personalmente los servicios, las reglas y la persistencia.

APK entregable: `entrega/UrbanInspect-debug.apk`. Instrucciones: `entrega/COMO_INSTALAR.txt`.

## Rediseño corporativo

Paleta blanca, azul y roja, encabezado y navegación uniformes. Incidencias y Seguimiento muestran fotografía a la izquierda, resumen a la derecha y acciones/estado en una franja inferior. Inicio incluye indicadores pulsables con filtro de estado remoto y accesos rápidos. Nueva se organiza en cuatro paneles: datos, ubicación, fotografía y clima. Detalle mantiene el mismo lenguaje visual.

Se inspeccionaron capturas de móvil (393 px) y escritorio (1440 px), incluyendo la parte inferior del formulario. La prueba de diseño verifica que no exista desbordamiento horizontal, la posición izquierda de la imagen y el filtro remoto de los contadores. El nuevo APK se recompiló correctamente y reemplaza `entrega/UrbanInspect-debug.apk`.
