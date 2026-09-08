import { useCine } from '../../controllers/CineContext';

export const ResumenCompra = () => {
  const { state, dispatch } = useCine();

  const totalButacas = state.butacasSeleccionadas.reduce((sum, b) => sum + b.precio, 0);
  const totalCandyBar = state.candyBarSeleccionado.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
  const total = totalButacas + totalCandyBar;

  const handleNextStep = () => {
    if (state.estadoCompra === 'seleccionando_asientos') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'seleccionando_candybar' });
    } else if (state.estadoCompra === 'seleccionando_candybar') {
      dispatch({ type: 'SET_ESTADO_COMPRA', payload: 'pago' });
    }
  };

  if (!state.peliculaSeleccionada) return null;

  return (
    <div className="glass-card rounded-[32px] p-8 flex flex-col justify-between sticky top-8 min-h-[500px]">
      <div>
        <span className="text-amber-500 text-[10px] uppercase font-black tracking-[0.2em] mb-6 block">Estado de la Orden</span>
        
        <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
          <img 
            src={state.peliculaSeleccionada.posterUrl} 
            alt={state.peliculaSeleccionada.titulo} 
            className="w-16 h-24 object-cover rounded-xl shadow-lg border border-white/5"
          />
          <div>
            <h4 className="font-bold text-slate-100 leading-tight mb-1">{state.peliculaSeleccionada.titulo}</h4>
            <p className="text-xs text-slate-400 mb-2">{state.peliculaSeleccionada.genero}</p>
            <div className="inline-flex items-center bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">
              {state.horarioSeleccionado}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <h5 className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Entradas ({state.butacasSeleccionadas.length})</h5>
            {state.butacasSeleccionadas.length > 0 ? (
              <div className="flex justify-between items-center text-sm text-slate-300">
                <span>Asientos: {state.butacasSeleccionadas.map(b => b.id).join(', ')}</span>
                <span className="font-bold text-slate-100">${totalButacas.toFixed(2)}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No has seleccionado asientos</p>
            )}
          </div>

          {state.candyBarSeleccionado.length > 0 && (
            <div>
              <h5 className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Candy Bar</h5>
              {state.candyBarSeleccionado.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm text-slate-300 mb-1">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="font-bold text-slate-100">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Subtotal</span>
          <span className="text-3xl font-bold text-amber-500">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={handleNextStep}
          disabled={state.butacasSeleccionadas.length === 0}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-400 text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(217,119,6,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {state.estadoCompra === 'seleccionando_asientos' ? 'Continuar a Dulcería' : 'Proceder al Pago'}
        </button>
      </div>
    </div>
  );
};
