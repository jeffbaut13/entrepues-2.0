import { useState, useEffect } from "react";
import useAdminStore from "../../store/adminStore";
import {
  CalendarDays,
  Trash2,
  Eye,
  X,
  Users,
  Clock,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";

const Spinner = ({ size = 14, className = "" }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} />
);

/**
 * Componente para gestionar las reservas del restaurante
 * Permite ver, buscar y eliminar reservas de Firestore
 */
export default function ReservasManager() {
  const {
    reservas,
    loading,
    actionLoading,
    cargarReservas,
    eliminarReservaAdmin,
    clearMessages,
  } = useAdminStore();

  const isActionLoading = (key) => actionLoading === key;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, []);

  const handleDelete = async (id) => {
    await eliminarReservaAdmin(id);
    setConfirmDelete(null);
    setSelectedReserva(null);
  };

  const reservasFiltradas = reservas.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      (r.nombre || "").toLowerCase().includes(query) ||
      (r.email || "").toLowerCase().includes(query) ||
      (r.whatsapp || "").toLowerCase().includes(query) ||
      (r.id || "").toLowerCase().includes(query) ||
      (r.numeroReserva || "").toLowerCase().includes(query)
    );
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "—";
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString("es-CO");
    }
    return String(timestamp);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-parkson mb-2">
            Gestión de Reservas
          </h2>
          <p className="text-[#fff6ea]/50 text-sm">
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""} encontrada{reservas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            cargarReservas();
            clearMessages();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1412] rounded-lg text-sm text-[#fff6ea]/70 hover:text-[#fff6ea] hover:bg-[#352821]/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fff6ea]/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="w-full bg-[#1a1412] border border-[#352821]/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fff6ea] placeholder:text-[#fff6ea]/30 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1412] rounded-xl border border-[#352821]/30 overflow-hidden">
        {loading && reservas.length === 0 ? (
          <div className="p-12 text-center text-[#fff6ea]/30 text-sm">
            Cargando reservas...
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-[#fff6ea]/30 text-sm">
            <CalendarDays size={48} className="mx-auto mb-4 opacity-20" />
            {searchQuery ? "Sin resultados para la búsqueda" : "No hay reservas registradas"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#352821]/30 text-[#fff6ea]/50 text-xs">
                  <th className="text-left p-4 font-medium">Nombre</th>
                  <th className="text-left p-4 font-medium">Contacto</th>
                  <th className="text-left p-4 font-medium">Fecha</th>
                  <th className="text-left p-4 font-medium">Hora</th>
                  <th className="text-left p-4 font-medium">Personas</th>
                  <th className="text-left p-4 font-medium">Creada</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#352821]/10">
                {reservasFiltradas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-[#352821]/10 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-medium">{reserva.nombre || "—"}</span>
                        {reserva.numeroReserva && (
                          <p className="text-xs text-[#fff6ea]/40">
                            #{reserva.numeroReserva}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {reserva.email && (
                          <div className="flex items-center gap-1.5 text-[#fff6ea]/60">
                            <Mail size={12} />
                            <span className="text-xs">{reserva.email}</span>
                          </div>
                        )}
                        {reserva.whatsapp && (
                          <div className="flex items-center gap-1.5 text-[#fff6ea]/60">
                            <Phone size={12} />
                            <span className="text-xs">{reserva.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-[#fff6ea]/70">
                      {reserva.fecha || "—"}
                    </td>
                    <td className="p-4 text-[#fff6ea]/70">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-amber-500/50" />
                        {reserva.hora || "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[#fff6ea]/70">
                        <Users size={12} className="text-amber-500/50" />
                        {reserva.totalAsistentes || 0}
                        <span className="text-xs text-[#fff6ea]/40 ml-1">
                          ({reserva.adultos || 0}A + {reserva.ninos || 0}N
                          {reserva.mascotas ? ` + ${reserva.mascotas}M` : ""})
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#fff6ea]/40">
                      {formatTimestamp(reserva.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setSelectedReserva(reserva)}
                          className="p-2 rounded-lg text-[#fff6ea]/40 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>

                        {confirmDelete === reserva.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(reserva.id)}
                              disabled={isActionLoading(`eliminarReserva_${reserva.id}`)}
                              className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1 disabled:opacity-50"
                            >
                              {isActionLoading(`eliminarReserva_${reserva.id}`) && <Spinner size={11} className="text-red-400" />}
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 rounded text-xs text-[#fff6ea]/40 hover:text-[#fff6ea]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(reserva.id)}
                            className="p-2 rounded-lg text-[#fff6ea]/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReserva && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1412] rounded-xl border border-[#352821]/30 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-[#352821]/30 flex items-center justify-between">
              <h3 className="font-medium text-amber-400">
                Detalle de Reserva
              </h3>
              <button
                onClick={() => setSelectedReserva(null)}
                className="p-1 text-[#fff6ea]/40 hover:text-[#fff6ea]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <DetailSection
                title="Contacto"
                items={[
                  ["Nombre", selectedReserva.contacto?.nombre],
                  ["Email", selectedReserva.contacto?.email],
                  ["WhatsApp", selectedReserva.contacto?.whatsapp],
                  ["Observaciones", selectedReserva.contacto?.observaciones],
                ]}
              />

              <DetailSection
                title="Reserva"
                items={[
                  ["No. reserva", selectedReserva.reserva?.numeroReserva],
                  ["Región", selectedReserva.reserva?.region],
                  ["Mesa", selectedReserva.reserva?.mesa],
                  ["Fecha", selectedReserva.reserva?.fecha],
                  ["Hora", selectedReserva.reserva?.hora],
                  ["Servicio", selectedReserva.reserva?.servicio],
                  ["Estado", selectedReserva.reserva?.estado],
                ]}
              />

              <DetailSection
                title="Asistentes"
                items={[
                  ["Adultos", selectedReserva.asistentes?.adultos],
                  ["Niños", selectedReserva.asistentes?.ninos],
                  ["Mascotas", selectedReserva.asistentes?.mascotas],
                  ["Total", selectedReserva.asistentes?.total],
                ]}
              />

              <DetailSection
                title="Checkout"
                items={[
                  ["Subtotal", selectedReserva.checkout?.subtotal],
                  ["Impuestos", selectedReserva.checkout?.impuestos],
                  ["Total", selectedReserva.checkout?.total],
                  ["Moneda", selectedReserva.checkout?.currency],
                  ["Estado", selectedReserva.checkout?.estado],
                ]}
              />

              <DetailSection
                title="Transacción"
                items={[
                  ["ID", selectedReserva.transaccion?.id],
                  ["Referencia", selectedReserva.transaccion?.referencia],
                  ["Estado", selectedReserva.transaccion?.estado],
                  ["Pasarela", selectedReserva.transaccion?.pasarela],
                ]}
              />

              <DetailSection
                title="Productos"
                items={[
                  ["Total productos", selectedReserva.productos?.totalProductos],
                  ["Monto total", selectedReserva.productos?.montoTotal],
                ]}
              />

              <DetalleConsumoAsistentes
                asistentes={selectedReserva.asistentes?.detalle}
              />

              <DetailSection
                title="Metadata"
                items={[
                  ["Origen", selectedReserva.metadata?.origen],
                  ["Versión payload", selectedReserva.metadata?.versionPayload],
                  ["Creado Firestore", formatTimestamp(selectedReserva.createdAt)],
                  ["Actualizado Firestore", formatTimestamp(selectedReserva.updatedAt)],
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DetailSection = ({ title, items }) => {
  const visibleItems = items.filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#352821]/30 p-3">
      <h4 className="text-sm font-medium text-amber-400 mb-3">{title}</h4>
      <div className="space-y-2">
        {visibleItems.map(([label, value]) => (
          <div key={label} className="flex gap-3">
            <span className="text-xs text-[#fff6ea]/40 w-32 flex-shrink-0">{label}</span>
            <span className="text-sm text-[#fff6ea]/80 break-all">
              {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetalleConsumoAsistentes = ({ asistentes }) => {
  const asistentesNormalizados = Array.isArray(asistentes)
    ? asistentes.filter((item) => item && typeof item === "object")
    : [];

  if (asistentesNormalizados.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#352821]/30 p-3">
      <h4 className="text-sm font-medium text-amber-400 mb-3">
        Qué comerá cada persona
      </h4>

      <div className="space-y-3">
        {asistentesNormalizados.map((asistente, index) => {
          const nombreAsistente =
            asistente?.asistente || `Asistente ${index + 1}`;
          const platos = Array.isArray(asistente?.platos)
            ? asistente.platos
            : [];

          return (
            <div
              key={`${nombreAsistente}-${index}`}
              className="rounded-md bg-[#0f0b09]/50 border border-[#352821]/25 p-2.5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm text-[#fff6ea] font-medium">
                  {nombreAsistente}
                </p>
                <span className="text-xs text-[#fff6ea]/50">
                  {Number(asistente?.totalPlatos || 0)} plato(s)
                </span>
              </div>

              {platos.length > 0 ? (
                <ul className="space-y-1.5">
                  {platos.map((plato, platoIndex) => (
                    <li
                      key={`${nombreAsistente}-plato-${platoIndex}`}
                      className="text-xs text-[#fff6ea]/75 flex items-start justify-between gap-2"
                    >
                      <span className="min-w-0 break-words">
                        {plato?.nombre || "Plato sin nombre"}
                      </span>
                      <span className="shrink-0 text-[#fff6ea]/60">
                        x{Number(plato?.cantidad || 1)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#fff6ea]/45">Sin platos seleccionados</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
