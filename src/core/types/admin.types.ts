export interface AdminMetrics {
  totalVentas: number;
  entradasVendidas: number;
  peliculasPopulares: { titulo: string; ventas: number }[];
}
