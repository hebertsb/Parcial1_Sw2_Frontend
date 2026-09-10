/**
 * El backend no tiene columna de poster para `peliculas` (no hay upload de imágenes en
 * el esquema) — se usa un set fijo de posters de stock como placeholder visual,
 * asignados de forma determinística por `idPelicula` para que cada tarjeta se vea
 * distinta. No representan el poster real de la película.
 */
const POSTER_PLACEHOLDERS: string[] = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBqKJAHKMk2UrBZxP-Q2Oe8t1ByJbEN0aj8n1-cEh-Zh2XZ-QQeovFwzMA_7Fy9YCg702os4PGj8E1M0bN3jgy3Iip349uC-mvILF7TXvJUJRHXsvg-ra-G9-JyxoCoBq-OdGs8RfJwXFdVwV3ER0-Ojmya7JN3eR1vC6ijBCCFC1fDyt_LcU9PK_LXahPRtQ7L1-xxBf258bdExlV_DZnPUFahs5EdFBZibNcPoLKUHotD06rhGWpO6w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAoSaJow42RXnlL9NO45KLL2-1nWag1KjqkvePsaZarrDK6jTQRAudG7VG4_I6q0pXeB7KT5RQX9WfYHXpfUdIJR6TvQB1QpsXOalCzLvtBLvzRJIObXWVHgjn5UGtLfnG3pRnVac4jou7Ni41etAoy6vBUT5luybCcjwKs10lGIHLIuo293-jB_ycipjctz0YZgtDEs0deepZfCEC44PaDsWY8r1vW9qnzv_AJAUray-ryiVTAH9ILug',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYry0C1IcnL4Ltv4OFETHIWyBkrHbvpjPXzDqTucsL10WlZMB4PgNlS_t7pTaYCy1sOUOBFLVd_O-f2nM4xHy-UHQ_pZKSUp1sS0O9lEw_8A3YqsWBR8Kov0D9vIWj6DqHGGsDHKbPwvBoNaLDIbnMU5nveCOou1dosTK5hb72iD2ZHVaeaLN3o-TGU35nEmafISH2D4Kl7K0eJB32cjynfenu7fZhPpREt4Oegiws7QCrf5knifSgCg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCz9gT6ZQ8Y8b-AyeZPc3ZPaTL4cgKdqq_7U2KzuJFz2zJQSwlhH6l4T3RS72t2o0h-Fh67VDg71TYs9vwlVIowLIxALu4vnZurMs6vo9bG8_o6bfFh0bpgi4RaDElYLTRtzOYiel9cZNQTXpRRBIeE6DUupXywfGaCtQthq1K21K6HOTPwnL7FVD3mf3n58PA5wmzPt-8-nT-Q-hhSwpTz0nN8gWJuEY6jW10pO7TFUKhNIVwRbYE5ZA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCo6z4UdTfATjr6Eqlu1pEZvmT0DwoX5B0qZ96XgQKe9VMJQ706-cHHeQd7-lotLmFcptZsLDzeeI9xzCqc9nYssjD_vJXtiUpX8_vy9_VClazA7swJiklxwsHzOZresTirl8XAyHk9WmFESbZubvPdm-pGQREFD15VGe5voLGhA3bqD5uYEZRRq5M3BPUW13w0C_HNGiRCnqH2gfpNNbwyrdiA4uTvXeWrbeSuv-B037tgKPPRbv0LEA',
];

export function posterFor(idPelicula: number): string {
  return POSTER_PLACEHOLDERS[idPelicula % POSTER_PLACEHOLDERS.length];
}
