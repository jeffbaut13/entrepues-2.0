# Reglas para IA en este proyecto (`entrepues2.0`)

Este documento define reglas obligatorias para cualquier IA que programe sobre este codigo.

## 1) Regla principal de reutilizacion

1. Antes de crear cualquier componente, revisar y reutilizar lo que ya existe en `src/components/ui`.
2. Si no existe una pieza exacta, componer con componentes existentes antes de crear uno nuevo.
3. Esta prohibido duplicar componentes con la misma responsabilidad.

## 2) Creacion de componentes nuevos (solo si es estrictamente necesario)

1. Todo componente nuevo debe ser reutilizable, desacoplado y con una sola responsabilidad.
2. Todo componente nuevo debe quedar documentado (props, comportamiento y ejemplo de uso).
3. No crear componentes "inline" dentro de paginas o componentes grandes: extraerlos a archivos dedicados.

## 3) Cambios de logica

1. Si se cambia logica, primero intentar reutilizar o expandir helpers, hooks, stores o logica existente.
2. Buscar primero en:
   - `src/hooks`
   - `src/helpers`
   - `src/logic`
   - `src/store`
3. Evitar reescribir flujos completos si se puede extender la implementacion actual.

## 4) Sistema de estilos y colores

1. Usar unicamente el sistema de colores ya definido en `src/index.css` (`:root` y tokens de tema).
2. Colores base actuales:
   - `--secondary`
   - `--brown`
   - `--dark`
3. No inventar nuevos colores hardcodeados (hex/rgb) sin aprobacion explicita y justificacion tecnica.
4. Priorizar clases o tokens existentes (`bg-secondary`, `text-brown`, etc.).

## 5) Estructura y tamano del codigo

1. No crear archivos extensos con logica mezclada de UI + negocio + efectos.
2. Separar responsabilidades usando:
   - hooks personalizados
   - helpers o utilidades
   - componentes de presentacion
3. Si un archivo crece demasiado, refactorizar en modulos pequenos y reutilizables.

## 6) Refactor obligatorio sobre "parches rapidos"

1. No introducir soluciones temporales o duplicadas dentro del mismo archivo.
2. Todo cambio debe mantener o mejorar la arquitectura existente.
3. Si algo nuevo se necesita, debe nacer como pieza reutilizable y documentada.

## 7) Respeto estricto a la configuracion del proyecto

1. No saltarse configuracion del proyecto aunque el usuario lo pida.
2. Respetar siempre:
   - ESLint
   - Vite
   - Tailwind y CSS global
   - estructura de rutas y stores existentes
3. No introducir librerias o patrones nuevos sin validar compatibilidad con lo actual.

## 8) Proceso minimo antes de crear algo nuevo

1. Buscar si ya existe solucion en el codigo.
2. Reutilizar primero.
3. Si no existe, crear modulo reutilizable.
4. Documentar lo creado.
5. Mantener consistencia visual y arquitectonica.

## 9) Criterio de aceptacion de cambios de IA

Un cambio solo se considera correcto si:

1. Reutiliza componentes de `src/components/ui` cuando aplica.
2. No rompe la arquitectura existente.
3. Usa colores o tokens de `src/index.css`.
4. Evita archivos gigantes y logica monolitica.
5. Deja codigo refactorizado y documentado.
