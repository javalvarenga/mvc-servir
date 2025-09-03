
-- (a) El porcentaje de ejecución de fondos para cada proyecto registrado.

SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.municipio,
    p.departamento,
    COALESCE(SUM(d.monto), 0) as total_donaciones,
    COALESCE(SUM(oc.monto), 0) as total_ejecutado,
    CASE 
        WHEN COALESCE(SUM(d.monto), 0) = 0 THEN 0
        ELSE ROUND((COALESCE(SUM(oc.monto), 0) * 100.0 / COALESCE(SUM(d.monto), 0)), 2)
    END as porcentaje_ejecucion
FROM proyectos p
LEFT JOIN donaciones d ON p.id = d.proyectoId
LEFT JOIN ordenes_compra oc ON p.id = oc.proyectoId
GROUP BY p.id, p.codigo, p.nombre, p.municipio, p.departamento
ORDER BY porcentaje_ejecucion DESC;

-- (b) La disponibilidad de fondos en cada rubro del proyecto "X", 

SELECT 
    r.id as renglon_id,
    r.nombre as rubro,
    p.codigo as proyecto_codigo,
    p.nombre as proyecto_nombre,
    COALESCE(SUM(d.monto), 0) as total_donado,
    COALESCE(SUM(oc.monto), 0) as total_gastado,
    (COALESCE(SUM(d.monto), 0) - COALESCE(SUM(oc.monto), 0)) as disponibilidad
FROM renglones r
INNER JOIN proyectos p ON r.proyectoId = p.id
LEFT JOIN donaciones d ON r.id = d.renglonId
LEFT JOIN ordenes_compra oc ON r.id = oc.renglonId
GROUP BY r.id, r.nombre, p.codigo, p.nombre
ORDER BY r.nombre;

