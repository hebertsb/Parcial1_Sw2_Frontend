// Apoyo compartido de las pruebas de navegador.
//
// La cartelera de la demo (scripts/poblar_base_de_datos.py) tiene varias funciones por película: decir «quiero entradas para X» a
// secas hace que el agente PREGUNTE a cuál ir (que es lo correcto), pero las pruebas que miden cómo la pantalla salta a los
// asientos necesitan que la función quede elegida. Esto arma la frase con un día y una hora REALES de la base.
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const fechaLocalISO = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

/** «Quiero dos entradas para Oppenheimer el 20 de septiembre a las 13:30»: la primera función programada de mañana en adelante. */
async function fraseDeEntradas(apiUrl, token, titulo, cantidad = 'dos') {
  const get = async (ruta) => (await fetch(`${apiUrl}${ruta}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  const [peliculas, funciones] = await Promise.all([get('/peliculas'), get('/funciones')]);
  const pelicula = peliculas.find((p) => p.titulo === titulo && p.estado === 'activa');
  const hoy = fechaLocalISO(new Date());
  const funcion = (pelicula ? funciones : [])
    .filter((f) => f.idPelicula === pelicula.idPelicula && f.estado === 'programada' && String(f.fecha).slice(0, 10) > hoy)
    .sort((a, b) => `${a.fecha}${a.horaInicio}`.localeCompare(`${b.fecha}${b.horaInicio}`))[0];
  const base = `Quiero ${cantidad} entradas para ${titulo}`;
  if (!funcion) return base;
  const [, mes, dia] = String(funcion.fecha).slice(0, 10).split('-').map(Number);
  return `${base} el ${dia} de ${MESES[mes - 1]} a las ${String(funcion.horaInicio).slice(0, 5)}`;
}

module.exports = { fraseDeEntradas };
