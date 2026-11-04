# Fotografías de referencia de Quito

Los registros del catálogo son ficticios para la práctica académica. Los nombres y direcciones corresponden a sectores de Quito, las coordenadas son referencias aproximadas del sector y las fotografías muestran lugares de Quito; no prueban los daños descritos. No se añade el texto DEMO ni prueba a los títulos visibles.

Las imágenes se muestran con su fuente y licencia en el detalle. Se enlazan los archivos originales, sin edición; la interfaz puede recortar visualmente la miniatura.

- **Parque La Carolina**: 2210777dak. [Fuente](https://commons.wikimedia.org/wiki/File:Parque_La_Carolina_-_Quito.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Avenida Amazonas, La Mariscal**: Cancillería del Ecuador. [Fuente](https://commons.wikimedia.org/wiki/File:Avenida_Amazonas,_La_Mariscal_(Quito).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/).
- **Parque El Ejido**: Quitolabicicleta. [Fuente](https://commons.wikimedia.org/wiki/File:Parque_El_Ejido_Quito_Ecuador.JPG), [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

Ejecutar `npm run datos:demo` crea los códigos UIO-0001 a UIO-0017: 10 pendientes, 5 en proceso y 2 resueltas. Repetir el comando omite códigos existentes: no borra ni sobrescribe casos que hayas editado. `node scripts/preparar-datos.mjs --preview` permite revisar el catálogo sin acceder a la API.

Para actualizar únicamente los enlaces y créditos fotográficos de estos códigos, conservando los demás campos: `node scripts/preparar-datos.mjs --actualizar-fotos`.
