import type { ReportePorPelicula, ReportePorFuncion } from '../../core/types/reporte.types';

const THEAD = 'py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline';
const TD = 'py-space-sm px-space-md font-body-sm text-body-sm text-on-surface';

export const ReportesTablaPelicula = ({ filas }: { filas: ReportePorPelicula[] }) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <h2 className="font-headline-sm text-headline-sm text-on-surface p-space-md pb-0">Ventas por película</h2>
    <table className="w-full min-w-[520px]">
      <thead>
        <tr>
          <th className={THEAD}>Película</th>
          <th className={THEAD}>Ventas</th>
          <th className={THEAD}>Entradas</th>
          <th className={THEAD}>Monto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {filas.length === 0 ? (
          <tr><td className={TD} colSpan={4}>Sin ventas en el rango seleccionado.</td></tr>
        ) : (
          filas.map((fila) => (
            <tr key={fila.idPelicula}>
              <td className={TD}>{fila.titulo}</td>
              <td className={TD}>{fila.totalVentas}</td>
              <td className={TD}>{fila.cantidadEntradas}</td>
              <td className={TD}>{fila.montoTotal} Bs</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const ReportesTablaFuncion = ({ filas }: { filas: ReportePorFuncion[] }) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <h2 className="font-headline-sm text-headline-sm text-on-surface p-space-md pb-0">Ventas por función</h2>
    <table className="w-full min-w-[620px]">
      <thead>
        <tr>
          <th className={THEAD}>Película</th>
          <th className={THEAD}>Fecha</th>
          <th className={THEAD}>Hora</th>
          <th className={THEAD}>Ventas</th>
          <th className={THEAD}>Entradas</th>
          <th className={THEAD}>Monto</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {filas.length === 0 ? (
          <tr><td className={TD} colSpan={6}>Sin ventas en el rango seleccionado.</td></tr>
        ) : (
          filas.map((fila) => (
            <tr key={fila.idFuncion}>
              <td className={TD}>{fila.titulo}</td>
              {/* Este endpoint arma `fecha` con QueryBuilder crudo, así que a diferencia
                  de GET /funciones (que devuelve "YYYY-MM-DD" plano) acá puede llegar
                  como timestamp ISO completo — nos quedamos solo con la fecha. */}
              <td className={TD}>{fila.fecha.slice(0, 10)}</td>
              <td className={TD}>{fila.horaInicio.slice(0, 5)}</td>
              <td className={TD}>{fila.totalVentas}</td>
              <td className={TD}>{fila.cantidadEntradas}</td>
              <td className={TD}>{fila.montoTotal} Bs</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
