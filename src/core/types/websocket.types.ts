export interface WebsocketMessage {
  type: 'BUTACA_OCUPADA' | 'BUTACA_LIBERADA' | 'NUEVA_PELICULA';
  payload: any;
}
