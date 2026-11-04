import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Datos ficticios para la aplicación académica, con lugares y fotografías de referencia de Quito.
// El catálogo visible utiliza títulos naturales; las fotos no certifican los daños descritos.
const fotos = {
  carolina: {
    fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Parque_La_Carolina_-_Quito.jpg',
    fotoCredito: '2210777dak · CC BY-SA 4.0',
    fotoFuente: 'https://commons.wikimedia.org/wiki/File:Parque_La_Carolina_-_Quito.jpg',
    fotoLicencia: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  amazonas: {
    fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Avenida_Amazonas%2C_La_Mariscal_%28Quito%29.jpg',
    fotoCredito: 'Cancillería del Ecuador · CC BY-SA 2.0',
    fotoFuente: 'https://commons.wikimedia.org/wiki/File:Avenida_Amazonas,_La_Mariscal_(Quito).jpg',
    fotoLicencia: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },
  ejido: {
    fotoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Parque_El_Ejido_Quito_Ecuador.JPG',
    fotoCredito: 'Quitolabicicleta · CC BY-SA 3.0',
    fotoFuente: 'https://commons.wikimedia.org/wiki/File:Parque_El_Ejido_Quito_Ecuador.JPG',
    fotoLicencia: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
};
const casos = [
  [
    'luminaria',
    'Luminaria apagada en el sendero de La Carolina',
    'Parque La Carolina, acceso por la avenida de los Shyris',
    'Iñaquito',
    'alta',
    'carolina',
  ],
  [
    'bache',
    'Hundimiento en la calzada junto al parque La Carolina',
    'Avenida de los Shyris y avenida República del Salvador',
    'Iñaquito',
    'alta',
    'carolina',
  ],
  [
    'señalizacion',
    'Señal peatonal con visibilidad reducida',
    'Avenida Amazonas y Jorge Washington',
    'La Mariscal',
    'media',
    'amazonas',
  ],
  [
    'alcantarilla',
    'Sumidero obstruido por hojas junto a El Ejido',
    'Avenida Patria, borde norte del parque El Ejido',
    'El Ejido',
    'alta',
    'ejido',
  ],
  [
    'parque',
    'Banca con piezas sueltas en La Carolina',
    'Parque La Carolina, sendero próximo a la avenida Amazonas',
    'Iñaquito',
    'media',
    'carolina',
  ],
  [
    'luminaria',
    'Iluminación intermitente en el corredor peatonal',
    'Avenida Amazonas y Veintimilla',
    'La Mariscal',
    'media',
    'amazonas',
  ],
  [
    'bache',
    'Deterioro del pavimento en el cruce de la avenida Patria',
    'Avenida Patria y avenida 6 de Diciembre',
    'El Ejido',
    'alta',
    'ejido',
  ],
  [
    'señalizacion',
    'Pintura desgastada en el paso peatonal',
    'Avenida de los Shyris y Naciones Unidas',
    'Iñaquito',
    'media',
    'carolina',
  ],
  [
    'alcantarilla',
    'Rejilla de drenaje con acumulación de residuos',
    'Avenida Amazonas y Vicente Ramón Roca',
    'La Mariscal',
    'media',
    'amazonas',
  ],
  [
    'parque',
    'Borde de sendero deteriorado en el parque El Ejido',
    'Parque El Ejido, acceso por la avenida 6 de Diciembre',
    'El Ejido',
    'baja',
    'ejido',
  ],
  [
    'luminaria',
    'Revisión de luminarias en el entorno de La Carolina',
    'Avenida de los Shyris, frente al parque La Carolina',
    'Iñaquito',
    'media',
    'carolina',
  ],
  [
    'bache',
    'Reparación de bache en el corredor de la avenida Amazonas',
    'Avenida Amazonas y Robles',
    'La Mariscal',
    'alta',
    'amazonas',
  ],
  [
    'señalizacion',
    'Reposición de señal de cruce peatonal',
    'Avenida Patria y avenida Amazonas',
    'El Ejido',
    'media',
    'ejido',
  ],
  [
    'alcantarilla',
    'Limpieza de sumidero en el perímetro de La Carolina',
    'Avenida Eloy Alfaro y avenida de los Shyris',
    'Iñaquito',
    'alta',
    'carolina',
  ],
  [
    'parque',
    'Mantenimiento de mobiliario en el parque El Ejido',
    'Parque El Ejido, sendero próximo a la avenida Patria',
    'El Ejido',
    'media',
    'ejido',
  ],
  [
    'luminaria',
    'Luminaria restablecida en la avenida Amazonas',
    'Avenida Amazonas y Wilson',
    'La Mariscal',
    'media',
    'amazonas',
  ],
  [
    'parque',
    'Banca reparada en el parque La Carolina',
    'Parque La Carolina, acceso por la avenida República',
    'Iñaquito',
    'baja',
    'carolina',
  ],
];
const centros = { carolina: [-0.1817, -78.4847], amazonas: [-0.2026, -78.4922], ejido: [-0.2107, -78.4984] };
const registros = casos.map(([tipo, descripcion, direccion, sector, prioridad, lugar], n) => ({
  codigo: `UIO-${String(n + 1).padStart(4, '0')}`,
  tipo,
  descripcion,
  direccion,
  sector,
  prioridad,
  estado: n < 10 ? 'pendiente' : n < 15 ? 'en_proceso' : 'resuelta',
  fecha: new Date(Date.now() - (n + 1) * 3600000).toISOString(),
  ...fotos[lugar],
  latitud: centros[lugar][0],
  longitud: centros[lugar][1],
  observacion:
    n === 15
      ? 'Se reemplazó la luminaria y se comprobó su funcionamiento.'
      : n === 16
        ? 'Se fijaron las piezas de la banca y se verificó su estabilidad.'
        : '',
}));
const resumen = (lista) =>
  lista.reduce((r, i) => {
    r[i.estado] = (r[i.estado] || 0) + 1;
    return r;
  }, {});
const esperado = resumen(registros);
if (registros.length !== 17 || esperado.pendiente !== 10 || esperado.en_proceso !== 5 || esperado.resuelta !== 2)
  throw new Error('La distribución del catálogo no es válida.');
if (new Set(registros.map((i) => i.codigo)).size !== registros.length) throw new Error('Códigos repetidos.');
if (process.argv.includes('--preview')) {
  console.log(JSON.stringify({ total: registros.length, estados: esperado, registros }, null, 2));
  process.exit(0);
}
const config = await readFile(new URL('../src/environments/environment.ts', import.meta.url), 'utf8');
const apiUrl = config.match(/incidenciasUrl\s*:\s*['"]([^'"]+)['"]/u)?.[1];
if (!apiUrl?.startsWith('https://')) throw new Error('Configura incidenciasUrl en src/environments/environment.ts.');
async function consultar(path = '', body, method = body ? 'POST' : 'GET') {
  const respuesta = await fetch(apiUrl + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  if (!body && respuesta.status === 404) {
    const texto = await respuesta.text();
    if (/not found/i.test(texto)) throw new Error('La API respondió 404. Verifica que el recurso incidencias exista.');
    throw new Error('No se pudo consultar la API (404).');
  }
  if (!respuesta.ok) throw new Error(`La API respondió HTTP ${respuesta.status}. No se borró ningún registro.`);
  return respuesta.json();
}
const actuales = await consultar();
if (!Array.isArray(actuales)) throw new Error('La API no devolvió una lista de incidencias.');
const backupDir = new URL('../.local/backups/', import.meta.url);
await mkdir(backupDir, { recursive: true });
await writeFile(new URL(`incidencias-${Date.now()}.json`, backupDir), JSON.stringify(actuales, null, 2));
let creados = 0;
for (const registro of registros) {
  const existente = actuales.find((i) => i.codigo === registro.codigo);
  if (existente) {
    if (process.argv.includes('--actualizar-fotos')) {
      const { fotoUrl, fotoCredito, fotoFuente, fotoLicencia } = registro;
      await consultar(`/${encodeURIComponent(existente.id)}`, { fotoUrl, fotoCredito, fotoFuente, fotoLicencia }, 'PUT');
    }
    continue;
  }
  await consultar('', registro);
  creados++;
}
const final = await consultar();
const cargados = final.filter((i) => registros.some((r) => r.codigo === i.codigo));
console.log(
  JSON.stringify(
    {
      creados,
      totalEnAPI: final.length,
      estadosEnAPI: resumen(final),
      codigosDelCatalogo: cargados.length,
      respaldo: fileURLToPath(backupDir),
    },
    null,
    2,
  ),
);
