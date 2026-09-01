import type {
  Activity,
  AppNotification,
  Contract,
  DocumentRecord,
  Expense,
  MaintenanceTicket,
  Owner,
  Payment,
  Property,
  Tenant,
} from "@/src/types";

export const owners: Owner[] = [
  { id: "o1", name: "Carlos Rodríguez", dni: "25.487.210", phone: "+54 261 555-0101", email: "carlos.rodriguez@email.com", cbu: "0720000788000034123456", propertyIds: ["p3", "p14", "p18"], monthlyIncome: 2130000, status: "Activo" },
  { id: "o2", name: "Mariana López", dni: "28.614.892", phone: "+54 261 555-0102", email: "mariana.lopez@email.com", cbu: "0720000788000042871954", propertyIds: ["p1", "p7", "p16"], monthlyIncome: 2260000, status: "Activo" },
  { id: "o3", name: "Ricardo Fernández", dni: "22.936.421", phone: "+54 261 555-0103", email: "ricardo.fernandez@email.com", cbu: "0720000788000054127863", propertyIds: ["p2", "p9"], monthlyIncome: 1610000, status: "Activo" },
  { id: "o4", name: "Patricia Gómez", dni: "27.365.118", phone: "+54 261 555-0104", email: "patricia.gomez@email.com", cbu: "0720000788000061254789", propertyIds: ["p4", "p12", "p20"], monthlyIncome: 3530000, status: "Activo" },
  { id: "o5", name: "Santiago Morales", dni: "31.774.506", phone: "+54 261 555-0105", email: "santiago.morales@email.com", cbu: "0720000788000074198632", propertyIds: ["p5", "p11"], monthlyIncome: 2700000, status: "Activo" },
  { id: "o6", name: "Laura Martínez", dni: "29.108.774", phone: "+54 261 555-0106", email: "laura.martinez@email.com", cbu: "0720000788000087365214", propertyIds: ["p6", "p13", "p19"], monthlyIncome: 2170000, status: "Activo" },
  { id: "o7", name: "Alejandro Sánchez", dni: "26.840.192", phone: "+54 261 555-0107", email: "alejandro.sanchez@email.com", cbu: "0720000788000092145786", propertyIds: ["p8", "p17"], monthlyIncome: 1490000, status: "Activo" },
  { id: "o8", name: "Gabriela Torres", dni: "33.452.981", phone: "+54 261 555-0108", email: "gabriela.torres@email.com", cbu: "0720000788000017894521", propertyIds: ["p10", "p15"], monthlyIncome: 1670000, status: "Pendiente" },
];

export const properties: Property[] = [
  { id: "p1", address: "Av. Emilio Civit 850", locality: "Ciudad de Mendoza", province: "Mendoza", type: "Departamento", ownerId: "o2", tenantId: "t1", contractId: "c1", price: 850000, expenses: 95000, surface: 120, bedrooms: 3, bathrooms: 2, garages: 1, status: "Alquilada", description: "Departamento luminoso con balcón corrido, cochera cubierta y vistas arboladas sobre Emilio Civit.", visual: 1 },
  { id: "p2", address: "Av. Arístides Villanueva 432", locality: "Quinta Sección", province: "Mendoza", type: "Departamento", ownerId: "o3", tenantId: "t2", contractId: "c2", price: 720000, expenses: 78000, surface: 82, bedrooms: 2, bathrooms: 1, garages: 1, status: "Alquilada", description: "Unidad moderna en el corazón de la Quinta Sección.", visual: 2 },
  { id: "p3", address: "Sarmiento 1250", locality: "Godoy Cruz", province: "Mendoza", type: "Casa", ownerId: "o1", tenantId: "t3", contractId: "c3", price: 680000, expenses: 0, surface: 148, bedrooms: 3, bathrooms: 2, garages: 1, status: "Alquilada", description: "Casa familiar con patio y excelente conectividad.", visual: 3 },
  { id: "p4", address: "Palmares Valley M18", locality: "Godoy Cruz", province: "Mendoza", type: "Casa", ownerId: "o4", tenantId: "t4", contractId: "c4", price: 1650000, expenses: 180000, surface: 230, bedrooms: 4, bathrooms: 3, garages: 2, status: "Alquilada", description: "Casa contemporánea en barrio privado, con galería y jardín.", visual: 4 },
  { id: "p5", address: "Viamonte 3180", locality: "Chacras de Coria", province: "Mendoza", type: "Casa", ownerId: "o5", tenantId: "t5", contractId: "c5", price: 1250000, expenses: 45000, surface: 210, bedrooms: 3, bathrooms: 3, garages: 2, status: "Alquilada", description: "Casa con parque y galería, a pocas cuadras de la plaza.", visual: 5 },
  { id: "p6", address: "Barrio Dalvian M7 C12", locality: "Dalvian", province: "Mendoza", type: "Casa", ownerId: "o6", tenantId: "t6", contractId: "c6", price: 1450000, expenses: 210000, surface: 260, bedrooms: 4, bathrooms: 3, garages: 2, status: "Alquilada", description: "Propiedad amplia con jardín consolidado y seguridad 24 h.", visual: 6 },
  { id: "p7", address: "San Martín 850", locality: "Maipú", province: "Mendoza", type: "Local comercial", ownerId: "o2", tenantId: "t7", contractId: "c7", price: 890000, expenses: 35000, surface: 105, bedrooms: 0, bathrooms: 1, garages: 0, status: "Alquilada", description: "Local comercial sobre corredor de alto tránsito.", visual: 7 },
  { id: "p8", address: "Bombal Sur 142", locality: "Godoy Cruz", province: "Mendoza", type: "Departamento", ownerId: "o7", tenantId: "t8", contractId: "c8", price: 640000, expenses: 72000, surface: 74, bedrooms: 2, bathrooms: 1, garages: 1, status: "Mantenimiento", description: "Departamento interno silencioso con patio propio.", visual: 8 },
  { id: "p9", address: "Mathus Hoyos 2140", locality: "Villa Nueva", province: "Mendoza", type: "Casa", ownerId: "o3", tenantId: "t9", contractId: "c9", price: 890000, expenses: 0, surface: 175, bedrooms: 3, bathrooms: 2, garages: 2, status: "Alquilada", description: "Casa renovada con amplios ambientes y cochera doble.", visual: 9 },
  { id: "p10", address: "La Barraca 980", locality: "Guaymallén", province: "Mendoza", type: "Departamento", ownerId: "o8", tenantId: "t10", contractId: "c10", price: 610000, expenses: 65000, surface: 68, bedrooms: 2, bathrooms: 1, garages: 1, status: "Alquilada", description: "Unidad funcional cercana al paseo comercial.", visual: 10 },
  { id: "p11", address: "Olascoaga 740", locality: "Quinta Sección", province: "Mendoza", type: "Departamento", ownerId: "o5", tenantId: "t11", price: 590000, expenses: 69000, surface: 60, bedrooms: 1, bathrooms: 1, garages: 0, status: "Alquilada", description: "Departamento de un dormitorio con excelente luz natural.", visual: 11 },
  { id: "p12", address: "San Martín Sur 1680", locality: "Godoy Cruz", province: "Mendoza", type: "Oficina", ownerId: "o4", tenantId: "t12", price: 930000, expenses: 115000, surface: 110, bedrooms: 3, bathrooms: 2, garages: 2, status: "Alquilada", description: "Oficina corporativa con salas independientes y cochera.", visual: 12 },
  { id: "p13", address: "Cervantes 540", locality: "Godoy Cruz", province: "Mendoza", type: "Departamento", ownerId: "o6", tenantId: "t13", price: 520000, expenses: 58000, surface: 56, bedrooms: 1, bathrooms: 1, garages: 1, status: "Alquilada", description: "Unidad compacta ideal para uso profesional o residencial.", visual: 13 },
  { id: "p14", address: "Ozamis 1280", locality: "Maipú", province: "Mendoza", type: "Casa", ownerId: "o1", tenantId: "t14", price: 760000, expenses: 0, surface: 160, bedrooms: 3, bathrooms: 2, garages: 1, status: "Alquilada", description: "Casa familiar con quincho y patio.", visual: 14 },
  { id: "p15", address: "Terrada 6400", locality: "Carrodilla", province: "Mendoza", type: "Dúplex", ownerId: "o8", tenantId: "t15", price: 1060000, expenses: 120000, surface: 142, bedrooms: 3, bathrooms: 2, garages: 2, status: "Alquilada", description: "Dúplex a estrenar dentro de complejo cerrado.", visual: 15 },
  { id: "p16", address: "Juan B. Justo 315", locality: "Ciudad de Mendoza", province: "Mendoza", type: "Departamento", ownerId: "o2", price: 520000, expenses: 55000, surface: 48, bedrooms: 1, bathrooms: 1, garages: 0, status: "Disponible", description: "Departamento reciclado, listo para ingresar.", visual: 16 },
  { id: "p17", address: "Acceso Este 1750", locality: "Guaymallén", province: "Mendoza", type: "Local comercial", ownerId: "o7", price: 850000, expenses: 48000, surface: 92, bedrooms: 0, bathrooms: 1, garages: 2, status: "Disponible", description: "Local con frente vidriado y estacionamiento.", visual: 17 },
  { id: "p18", address: "Perú 1284", locality: "Ciudad de Mendoza", province: "Mendoza", type: "Oficina", ownerId: "o1", price: 690000, expenses: 84000, surface: 76, bedrooms: 3, bathrooms: 1, garages: 1, status: "Disponible", description: "Oficina céntrica con recepción y tres privados.", visual: 18 },
  { id: "p19", address: "San Rafael 660", locality: "Las Heras", province: "Mendoza", type: "Casa", ownerId: "o6", price: 420000, expenses: 0, surface: 112, bedrooms: 2, bathrooms: 1, garages: 1, status: "Disponible", description: "Casa práctica con patio y acceso independiente.", visual: 19 },
  { id: "p20", address: "Guardia Vieja 2790", locality: "Luján de Cuyo", province: "Mendoza", type: "Casa", ownerId: "o4", price: 950000, expenses: 0, surface: 185, bedrooms: 3, bathrooms: 2, garages: 2, status: "Mantenimiento", description: "Casa de estilo mendocino con jardín y galería.", visual: 20 },
];

export const tenants: Tenant[] = [
  { id: "t1", name: "Martín González", dni: "32.456.789", propertyId: "p1", phone: "+54 261 555-0201", email: "martin.gonzalez@email.com", start: "01/02/2026", end: "31/01/2028", status: "Al día" },
  { id: "t2", name: "Luciana Pérez", dni: "35.174.620", propertyId: "p2", phone: "+54 261 555-0202", email: "luciana.perez@email.com", start: "01/03/2025", end: "28/02/2027", status: "Al día" },
  { id: "t3", name: "Nicolás Herrera", dni: "31.862.497", propertyId: "p3", phone: "+54 261 555-0203", email: "nicolas.herrera@email.com", start: "01/07/2025", end: "30/06/2027", status: "Pendiente" },
  { id: "t4", name: "Sofía Ramírez", dni: "34.229.175", propertyId: "p4", phone: "+54 261 555-0204", email: "sofia.ramirez@email.com", start: "15/10/2025", end: "14/10/2027", status: "Al día" },
  { id: "t5", name: "Federico Gómez", dni: "30.517.844", propertyId: "p5", phone: "+54 261 555-0205", email: "federico.gomez@email.com", start: "01/10/2024", end: "30/09/2026", status: "Pendiente" },
  { id: "t6", name: "Valentina Suárez", dni: "36.710.528", propertyId: "p6", phone: "+54 261 555-0206", email: "valentina.suarez@email.com", start: "01/01/2026", end: "31/12/2027", status: "Al día" },
  { id: "t7", name: "Andrés Molina", dni: "29.443.806", propertyId: "p7", phone: "+54 261 555-0207", email: "andres.molina@email.com", start: "01/05/2026", end: "30/04/2028", status: "Al día" },
  { id: "t8", name: "Camila Ortega", dni: "33.901.462", propertyId: "p8", phone: "+54 261 555-0208", email: "camila.ortega@email.com", start: "01/04/2025", end: "31/03/2027", status: "Vencido" },
  { id: "t9", name: "Joaquín Castro", dni: "30.762.119", propertyId: "p9", phone: "+54 261 555-0209", email: "joaquin.castro@email.com", start: "01/08/2025", end: "31/07/2027", status: "Al día" },
  { id: "t10", name: "Agustina Navarro", dni: "37.245.630", propertyId: "p10", phone: "+54 261 555-0210", email: "agustina.navarro@email.com", start: "01/02/2025", end: "31/01/2027", status: "Al día" },
  { id: "t11", name: "Tomás Vega", dni: "33.004.271", propertyId: "p11", phone: "+54 261 555-0211", email: "tomas.vega@email.com", start: "01/06/2025", end: "31/05/2027", status: "Pendiente" },
  { id: "t12", name: "Estudio Cuyo SAS", dni: "30-71829465-2", propertyId: "p12", phone: "+54 261 555-0212", email: "administracion@estudiocuyo.com", start: "01/01/2026", end: "31/12/2028", status: "Al día" },
  { id: "t13", name: "Milagros Acosta", dni: "38.120.647", propertyId: "p13", phone: "+54 261 555-0213", email: "milagros.acosta@email.com", start: "01/09/2025", end: "31/08/2027", status: "Al día" },
  { id: "t14", name: "Franco Ríos", dni: "32.991.405", propertyId: "p14", phone: "+54 261 555-0214", email: "franco.rios@email.com", start: "01/11/2025", end: "31/10/2027", status: "Pendiente" },
  { id: "t15", name: "Julieta Méndez", dni: "35.661.280", propertyId: "p15", phone: "+54 261 555-0215", email: "julieta.mendez@email.com", start: "01/12/2025", end: "30/11/2027", status: "Al día" },
];

export const contracts: Contract[] = [
  { id: "c1", code: "CTR-2026-0042", propertyId: "p1", ownerId: "o2", tenantId: "t1", start: "01/02/2026", end: "31/01/2028", value: 850000, deposit: 850000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "01/10/2026", notes: "Garantía propietaria validada. Inventario firmado.", status: "Vigente" },
  { id: "c2", code: "CTR-2025-0034", propertyId: "p2", ownerId: "o3", tenantId: "t2", start: "01/03/2025", end: "28/02/2027", value: 720000, deposit: 620000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "01/11/2026", notes: "", status: "Vigente" },
  { id: "c3", code: "CTR-2025-0038", propertyId: "p3", ownerId: "o1", tenantId: "t3", start: "01/07/2025", end: "30/06/2027", value: 680000, deposit: 530000, frequency: "Cada 6 meses", adjustmentType: "ICL", nextAdjustment: "01/01/2027", notes: "", status: "Vigente" },
  { id: "c4", code: "CTR-2025-0047", propertyId: "p4", ownerId: "o4", tenantId: "t4", start: "15/10/2025", end: "14/10/2027", value: 1650000, deposit: 1400000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "15/10/2026", notes: "", status: "Vigente" },
  { id: "c5", code: "CTR-2024-0021", propertyId: "p5", ownerId: "o5", tenantId: "t5", start: "01/10/2024", end: "30/09/2026", value: 1250000, deposit: 780000, frequency: "Cada 6 meses", adjustmentType: "ICL", nextAdjustment: "30/09/2026", notes: "Coordinar renovación.", status: "Próximo a vencer" },
  { id: "c6", code: "CTR-2026-0003", propertyId: "p6", ownerId: "o6", tenantId: "t6", start: "01/01/2026", end: "31/12/2027", value: 1450000, deposit: 1200000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "01/09/2026", notes: "", status: "Vigente" },
  { id: "c7", code: "CTR-2026-0018", propertyId: "p7", ownerId: "o2", tenantId: "t7", start: "01/05/2026", end: "30/04/2028", value: 890000, deposit: 890000, frequency: "Cada 6 meses", adjustmentType: "Porcentaje fijo", nextAdjustment: "01/11/2026", notes: "", status: "Vigente" },
  { id: "c8", code: "CTR-2025-0036", propertyId: "p8", ownerId: "o7", tenantId: "t8", start: "01/04/2025", end: "31/03/2027", value: 640000, deposit: 540000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "01/12/2026", notes: "Revisar deuda pendiente.", status: "Vigente" },
  { id: "c9", code: "CTR-2025-0040", propertyId: "p9", ownerId: "o3", tenantId: "t9", start: "01/08/2025", end: "31/07/2027", value: 890000, deposit: 700000, frequency: "Cada 6 meses", adjustmentType: "ICL", nextAdjustment: "01/02/2027", notes: "", status: "Vigente" },
  { id: "c10", code: "CTR-2025-0028", propertyId: "p10", ownerId: "o8", tenantId: "t10", start: "01/02/2025", end: "31/01/2027", value: 610000, deposit: 480000, frequency: "Cada 4 meses", adjustmentType: "IPC", nextAdjustment: "01/10/2026", notes: "", status: "Próximo a vencer" },
];

export const payments: Payment[] = [
  { id: "pay1", tenantId: "t1", propertyId: "p1", period: "Septiembre 2026", amount: 850000, dueDate: "10/09/2026", paidDate: "05/09/2026", method: "Transferencia", reference: "TRX-948521", status: "Pagado" },
  { id: "pay2", tenantId: "t2", propertyId: "p2", period: "Septiembre 2026", amount: 720000, dueDate: "15/09/2026", paidDate: "01/09/2026", method: "Transferencia", reference: "TRX-947103", status: "Pagado" },
  { id: "pay3", tenantId: "t3", propertyId: "p3", period: "Septiembre 2026", amount: 680000, dueDate: "10/09/2026", status: "Pendiente" },
  { id: "pay4", tenantId: "t4", propertyId: "p4", period: "Septiembre 2026", amount: 1650000, dueDate: "10/09/2026", paidDate: "03/09/2026", method: "Transferencia", status: "Pagado" },
  { id: "pay5", tenantId: "t5", propertyId: "p5", period: "Septiembre 2026", amount: 1250000, dueDate: "30/09/2026", status: "Pendiente" },
  { id: "pay6", tenantId: "t6", propertyId: "p6", period: "Septiembre 2026", amount: 1450000, dueDate: "10/09/2026", paidDate: "04/09/2026", method: "Mercado Pago", status: "Pagado" },
  { id: "pay7", tenantId: "t7", propertyId: "p7", period: "Septiembre 2026", amount: 890000, dueDate: "10/09/2026", paidDate: "06/09/2026", method: "Efectivo", status: "Pagado" },
  { id: "pay8", tenantId: "t8", propertyId: "p8", period: "Agosto 2026", amount: 640000, dueDate: "10/08/2026", status: "Vencido" },
  { id: "pay9", tenantId: "t9", propertyId: "p9", period: "Septiembre 2026", amount: 890000, dueDate: "10/09/2026", paidDate: "02/09/2026", method: "Transferencia", status: "Pagado" },
  { id: "pay10", tenantId: "t10", propertyId: "p10", period: "Septiembre 2026", amount: 610000, dueDate: "10/09/2026", status: "Pendiente" },
  { id: "pay11", tenantId: "t11", propertyId: "p11", period: "Septiembre 2026", amount: 590000, dueDate: "10/09/2026", status: "Pendiente" },
  { id: "pay12", tenantId: "t12", propertyId: "p12", period: "Septiembre 2026", amount: 930000, dueDate: "10/09/2026", paidDate: "01/09/2026", method: "Transferencia", status: "Pagado" },
];

export const expenses: Expense[] = [
  { id: "e1", concept: "Reparación de cañería en cocina", propertyId: "p8", category: "Reparación", amount: 185000, date: "29/08/2026", responsible: "Propietario" },
  { id: "e2", concept: "Expensas septiembre", propertyId: "p1", category: "Expensas", amount: 95000, date: "01/09/2026", responsible: "Inquilino" },
  { id: "e3", concept: "Servicio de caldera", propertyId: "p5", category: "Mantenimiento", amount: 76000, date: "27/08/2026", responsible: "Propietario" },
  { id: "e4", concept: "Impuesto inmobiliario", propertyId: "p4", category: "Impuestos", amount: 142000, date: "20/08/2026", responsible: "Propietario" },
  { id: "e5", concept: "Cambio de térmica y disyuntor", propertyId: "p20", category: "Reparación", amount: 128000, date: "30/08/2026", responsible: "Propietario" },
  { id: "e6", concept: "Honorarios de inspección", propertyId: "p16", category: "Honorarios", amount: 48000, date: "18/08/2026", responsible: "Inmobiliaria" },
];

export const maintenance: MaintenanceTicket[] = [
  { id: "m1", code: "MAN-1024", title: "Pérdida de agua en cocina", propertyId: "p8", priority: "Alta", status: "Nuevo", createdAt: "01/09/2026", detail: "La pérdida se encuentra bajo la bacha y requiere revisión de flexibles." },
  { id: "m2", code: "MAN-1025", title: "Aire acondicionado no funciona", propertyId: "p2", priority: "Media", status: "En proceso", createdAt: "31/08/2026", detail: "Equipo del dormitorio principal sin respuesta." },
  { id: "m3", code: "MAN-1026", title: "Revisión de calefón", propertyId: "p14", priority: "Alta", status: "Nuevo", createdAt: "30/08/2026", detail: "La llama piloto se apaga luego de algunos minutos." },
  { id: "m4", code: "MAN-1027", title: "Problema eléctrico", propertyId: "p5", priority: "Urgente", status: "En proceso", createdAt: "01/09/2026", detail: "Corte intermitente en el sector de cocina." },
  { id: "m5", code: "MAN-1021", title: "Persiana del dormitorio trabada", propertyId: "p1", priority: "Baja", status: "Esperando proveedor", createdAt: "26/08/2026", detail: "Se solicitó presupuesto para cambio de cinta y enrollador." },
  { id: "m6", code: "MAN-1018", title: "Humedad en medianera", propertyId: "p20", priority: "Media", status: "Resuelto", createdAt: "20/08/2026", detail: "Trabajo finalizado y verificado con el propietario." },
];

export const documents: DocumentRecord[] = [
  { id: "d1", name: "contrato_emilio_civit.pdf", type: "Contratos", propertyId: "p1", person: "Martín González", date: "01/02/2026", size: "1,8 MB" },
  { id: "d2", name: "DNI_martin_gonzalez.pdf", type: "DNI", propertyId: "p1", person: "Martín González", date: "28/01/2026", size: "420 KB" },
  { id: "d3", name: "inventario_aristides.pdf", type: "Inventarios", propertyId: "p2", person: "Luciana Pérez", date: "01/03/2025", size: "2,4 MB" },
  { id: "d4", name: "escritura_chacras.pdf", type: "Escrituras", propertyId: "p5", person: "Santiago Morales", date: "10/06/2024", size: "3,1 MB" },
  { id: "d5", name: "garantia_palmares.pdf", type: "Garantías", propertyId: "p4", person: "Sofía Ramírez", date: "11/10/2025", size: "980 KB" },
  { id: "d6", name: "comprobante_pago_septiembre.pdf", type: "Comprobantes", propertyId: "p1", person: "Martín González", date: "05/09/2026", size: "164 KB" },
];

export const notifications: AppNotification[] = [
  { id: "n1", title: "Contrato próximo a vencer", description: "El contrato de Viamonte 3180 vence en 30 días.", time: "Hace 12 min", kind: "contract", read: false },
  { id: "n2", title: "Pago vencido", description: "Camila Ortega tiene un pago pendiente.", time: "Hace 45 min", kind: "payment", read: false },
  { id: "n3", title: "Mantenimiento urgente", description: "Se registró un problema eléctrico en Chacras de Coria.", time: "Hace 2 h", kind: "maintenance", read: false },
  { id: "n4", title: "Actualización de alquiler", description: "3 contratos deben actualizar su valor este mes.", time: "Ayer", kind: "update", read: true },
];

export const activities: Activity[] = [
  { id: "a1", title: "Pago recibido de Luciana Pérez", detail: "$ 720.000", time: "Hace 25 min", kind: "payment" },
  { id: "a2", title: "Nuevo contrato creado", detail: "Av. Arístides Villanueva 432", time: "Hace 2 h", kind: "contract" },
  { id: "a3", title: "Mantenimiento actualizado", detail: "Pérdida de agua — Bombal", time: "Hace 4 h", kind: "maintenance" },
  { id: "a4", title: "Nueva propiedad agregada", detail: "Godoy Cruz", time: "Ayer", kind: "property" },
];

export const incomeSeries = [
  { month: "Abr", income: 15200000, expense: 2650000 },
  { month: "May", income: 15800000, expense: 2820000 },
  { month: "Jun", income: 16450000, expense: 2480000 },
  { month: "Jul", income: 17100000, expense: 3100000 },
  { month: "Ago", income: 17600000, expense: 2980000 },
  { month: "Sep", income: 18450000, expense: 2760000 },
];

export const localityIncome = [
  { name: "Ciudad", value: 6950000 },
  { name: "Godoy Cruz", value: 5230000 },
  { name: "Luján de Cuyo", value: 3310000 },
  { name: "Guaymallén", value: 1910000 },
  { name: "Maipú", value: 1050000 },
];
