# POLO Inmobiliario

Piloto frontend de una plataforma SaaS para administrar inmobiliarias de Mendoza. Centraliza propiedades, propietarios, inquilinos, contratos, pagos, gastos, mantenimiento, documentos y reportes en una experiencia navegable y comercialmente presentable.

## Ejecutar localmente

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Acceso demo

- Email: `admin@poloinmobiliario.com`
- Contraseña: `123456`

El acceso es simulado. También se acepta cualquier email válido y una contraseña de al menos seis caracteres.

## Validación

```bash
npm run build
npm run lint
npm test
```

Todos los datos son ficticios y las acciones persisten únicamente en `localStorage`. El proyecto no utiliza backend, base de datos, autenticación, carga real de archivos ni servicios pagos.

## Administración de inmuebles

- La mora por propiedad reúne alquileres y obligaciones vencidos registrados. Se calcula según el día actual de Argentina y se actualiza al registrar el pago.
- En **Gastos y obligaciones** se cargan servicios, tasas municipales, expensas y otros conceptos con período, responsable, vencimiento y estado de pago. Los gastos anteriores sin estado se conservan como pagados. Una expensa de referencia en la ficha no genera deuda por sí sola; debe cargarse la obligación del período.
- Las alertas dentro de la aplicación muestran alquileres en mora, obligaciones impagas y actualizaciones de contratos. No se envían correos ni mensajes automáticos.
- En **Actualizar alquiler** se integra el widget público de ARquiler que utiliza la [calculadora del Colegio de Corredores de Mendoza](https://www.ccpim.com.ar/interna/calculadora-alquileres/309). Se precargan importe, fecha base, índice y frecuencia del contrato; al consultar, ARquiler realiza el cálculo con sus datos. Se puede abrir dentro de la app o en otra pestaña. Los índices compatibles son ICL, IPC, Casa Propia, CAC, CER, IS, IPIM y UVA.
- El widget no expone una transferencia de resultados hacia la app. Para guardar un ajuste se ingresa el nuevo importe que muestra ARquiler para la fecha correspondiente; la app calcula el coeficiente y registra la fuente y el período. También siguen disponibles los coeficientes, índices inicial y final y porcentajes acumulados manuales. No se utiliza una API privada ni se presenta la integración como oficial del Colegio.
- ARquiler admite pesos enteros en su widget. Si el alquiler tiene centavos, la app informa el importe redondeado enviado a la consulta, conservando el valor original en el contrato. Las URL de consulta contienen únicamente importe, fecha, índice y frecuencia; no incluyen identificadores, direcciones ni datos de propietarios o inquilinos.
- Los ajustes se programan y se aplican desde la fecha acordada, dentro de la vigencia del contrato. Al aplicarlos se actualizan el contrato y el precio de la propiedad, se agenda la siguiente revisión y se conserva el historial. Los pagos anteriores mantienen su importe.
- Las propiedades admiten alquiler, administración o ambas operaciones, incluyendo inmuebles sin inquilino ni contrato. Los tipos incluyen viviendas, locales, galpones, predios, fincas e inmuebles industriales y agrícolas, con uso permitido, condiciones e infraestructura.
- **Ayuda y capacitación** ofrece una guía y permite registrar las personas designadas por inmobiliaria y marcar los módulos revisados. No crea cuentas ni envía invitaciones; las capacitaciones con personas deben realizarse por separado.

Las funciones nuevas conservan la persistencia local de la demo. Para uso compartido entre personas o inmobiliarias se necesita integrar un backend, permisos y almacenamiento reales.

Las reglas de fechas, mora, alertas y cálculo se verifican con `npm run test:administration`.

## Publicación

GitHub Pages se actualiza al subir cambios a `main`, mediante `.github/workflows/deploy-pages.yml` y `npm run build:pages`.

Vercel utiliza `vercel.json`, el framework Next.js y `npm run build:vercel`. La configuración de GitHub Pages y el prefijo `/INMOB` se aplican únicamente a su propio flujo; Vercel sirve la app desde la raíz del dominio.
