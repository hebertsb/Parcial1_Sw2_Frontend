import { useEffect, useState } from 'react';

/** Skeleton genérico para KPI card */
export const KPISkeleton = () => (
  <div className="p-space-lg rounded-2xl bg-surface-container-low shadow-lg flex flex-col gap-space-2xs">
    <div className="h-4 w-24 bg-surface-container-highest animate-pulse rounded" />
    <div className="h-10 w-32 bg-surface-container-highest animate-pulse rounded" />
  </div>
);

/** Skeleton para tabla con N filas */
export const TablaSkeleton = ({ filas = 5, columnas = 4 }: { filas?: number; columnas?: number }) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg overflow-x-auto">
    <div className="p-space-md pb-0">
      <div className="h-6 w-40 bg-surface-container-highest animate-pulse rounded" />
    </div>
    <table className="w-full min-w-[520px]">
      <thead>
        <tr>
          {Array.from({ length: columnas }).map((_, i) => (
            <th key={i} className="py-space-sm px-space-md text-left font-label-code text-label-code uppercase text-outline">
              <div className="h-4 w-20 bg-surface-container-highest animate-pulse rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {Array.from({ length: filas }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: columnas }).map((_, j) => (
              <td key={j} className="py-space-sm px-space-md font-body-sm text-body-sm text-on-surface">
                <div className="h-5 w-24 bg-surface-container-highest animate-pulse rounded" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Skeleton para gráfico */
export const ChartSkeleton = ({ titulo = 'Gráfico' }: { titulo?: string }) => (
  <div className="rounded-2xl bg-surface-container-low shadow-lg p-space-lg">
    <div className="mb-4">
      <div className="h-6 w-48 bg-surface-container-highest animate-pulse rounded" />
    </div>
    <div className="h-[300px] bg-surface-container-highest animate-pulse rounded" />
  </div>
);

/** Skeleton para KPIs grid (3 o 4 cards) */
export const KPIsGridSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
    {Array.from({ length: count }).map((_, i) => (
      <KPISkeleton key={i} />
    ))}
  </div>
);