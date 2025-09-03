# MVC Servir - Sistema de Gestión de Fondos para ONG

Sistema completo de gestión de fondos, presupuesto y ejecución para organizaciones no gubernamentales, desarrollado con Next.js, TypeScript,MySQL y TailwindCSS, siguiendo la arquitectura MVC (Model-View-Controller).

## Características

**Arquitectura MVC**: Separación clara de responsabilidades
**Next.js 14**: Framework React con App Router
**TypeScript**: Tipado estático para mayor robustez
**Prisma**: ORM moderno para base de datos
**TailwindCSS**: Framework CSS utilitario
**MySQL**: Base de datos robusta para producción
**API RESTful**: Endpoints para CRUD completo
**Gestión de Proyectos**: Con códigos autogenerados (P-0001, P-0002, etc.)
**Gestión de Renglones**: Rubros de presupuesto por proyecto
**Gestión de Donaciones**: Registro de fondos recibidos
**Gestión de Órdenes de Compra**: Control de gastos por rubro
**Consultas SQL**: Análisis de ejecución y disponibilidad de fondos
**Validaciones de Negocio**: Restricciones y reglas implementadas

## Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Instalar MySQL y configurar la base de datos:**
      
   ```
   COnfiguracion de MYSQL local utilizando variables de entorno.
   database name:mvc_servir
   ```

3. **Ejecutar el proyecto:**
   ```bash
   npm run build
   npm run dev (desarrollo)
   npm run start (produccion)
   ```

4. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
