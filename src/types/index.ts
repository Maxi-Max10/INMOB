export type PropertyStatus = "Alquilada" | "Disponible" | "Mantenimiento" | "Archivada";
export type PaymentStatus = "Pagado" | "Pendiente" | "Vencido";
export type ContractStatus = "Vigente" | "Próximo a vencer" | "Finalizado";
export type TicketStatus = "Nuevo" | "En proceso" | "Esperando proveedor" | "Resuelto";
export type TicketPriority = "Baja" | "Media" | "Alta" | "Urgente";

export interface Property {
  id: string;
  address: string;
  locality: string;
  province: string;
  type: string;
  ownerId: string;
  tenantId?: string;
  contractId?: string;
  price: number;
  expenses: number;
  surface: number;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  status: PropertyStatus;
  description: string;
  visual: number;
  operation?: "Alquiler" | "Administración" | "Alquiler y administración";
  conditions?: string;
  permittedUse?: string;
  infrastructure?: string;
}

export interface Owner {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  cbu: string;
  propertyIds: string[];
  monthlyIncome: number;
  status: "Activo" | "Pendiente";
}

export interface Tenant {
  id: string;
  name: string;
  dni: string;
  propertyId: string;
  phone: string;
  email: string;
  start: string;
  end: string;
  status: "Al día" | "Pendiente" | "Vencido";
}

export interface Contract {
  id: string;
  code: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  start: string;
  end: string;
  value: number;
  deposit: number;
  frequency: string;
  adjustmentType: "IPC" | "ICL" | "Casa Propia" | "CER" | "UVA" | "CAC" | "IS" | "IPIM" | "Porcentaje fijo" | "Manual";
  nextAdjustment: string;
  notes: string;
  status: ContractStatus;
  plannedAdjustment?: RentAdjustment;
  adjustments?: RentAdjustment[];
}

export interface RentAdjustment {
  id: string;
  baseValue: number;
  coefficient: number;
  newValue: number;
  effectiveDate: string;
  nextDate: string;
  months: number;
  index: string;
  method: string;
  source: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  period: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  method?: "Transferencia" | "Efectivo" | "Mercado Pago" | "Otro";
  reference?: string;
  notes?: string;
  status: PaymentStatus;
}

export interface Expense {
  id: string;
  concept: string;
  propertyId: string;
  category: "Reparación" | "Expensas" | "Tasas municipales" | "Impuestos" | "Servicios" | "Mantenimiento" | "Honorarios" | "Otros";
  amount: number;
  date: string;
  responsible: string;
  dueDate?: string;
  paidDate?: string;
  status?: PaymentStatus;
  period?: string;
}

export interface MaintenanceTicket {
  id: string;
  code: string;
  title: string;
  propertyId: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  detail: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: "Contratos" | "DNI" | "Garantías" | "Escrituras" | "Inventarios" | "Comprobantes" | "Fotos" | "Otros";
  propertyId?: string;
  person: string;
  date: string;
  size: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  kind: "contract" | "payment" | "maintenance" | "update";
  read: boolean;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "payment" | "contract" | "maintenance" | "property";
}
