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
