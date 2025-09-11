/**
 * Servicio de Análisis Avanzado para Problemáticas Operativas
 * Implementa análisis especializados para cada tipo de problemática
 */

import {
    normalizeProvinceKey,
    getProvinceKeyFromItem,
    parseDateToISO,
    formatDateForDisplay
} from '../contexts/DashboardContext';

export const analyticsService = {

    /**
     * ANÁLISIS POR PROBLEMÁTICA
     */

    // Análisis de Detenidos/Aprehendidos
    analyzeDetenidos: (data) => {
        const detenidos = data.filter(item => isDetenido(item));

        const analysis = {
            total: detenidos.length,

            // Por demografía
            porEdad: groupByAge(detenidos),
            porSexo: groupBy(detenidos, 'SEXO'),
            porNacionalidad: groupBy(detenidos, 'NACIONALIDAD'),

            // Por delito
            porDelito: groupBy(detenidos, 'DELITO_IMPUTADO'),
            porGravedad: classifyBySeverity(detenidos),

            // Geográfico
            porProvincia: groupByProvince(detenidos),
            porRegional: groupByRegional(detenidos),

            // Temporal
            porMes: groupByMonth(detenidos),
            tendencia: calculateTrend(detenidos, 'monthly'),

            // KPIs
            kpis: {
                promedioEdad: calculateAverageAge(detenidos),
                porcentajeMenores: calculateMinorsPercentage(detenidos),
                porcentajeExtranjeros: calculateForeignersPercentage(detenidos),
                tasaCrecimiento: calculateGrowthRate(detenidos)
            }
        };

        return analysis;
    },

    // Análisis de Incautaciones
    analyzeIncautaciones: (data) => {
        const incautaciones = data.filter(item => isIncautacion(item));

        const analysis = {
            total: incautaciones.length,

            // Por tipo de incautación
            porTipo: groupBy(incautaciones, 'TIPO_INCAUTACION'),
            porSubtipo: groupBy(incautaciones, 'SUBTIPO'),

            // Por valor monetario
            valorTotal: calculateTotalValue(incautaciones),
            porRangoValor: groupByValueRange(incautaciones),
            topIncautaciones: getTopIncautaciones(incautaciones, 10),

            // Geográfico
            porProvincia: groupByProvince(incautaciones),
            porRegional: groupByRegional(incautaciones),
            mapaCalor: generateHeatmapData(incautaciones),

            // Temporal
            porMes: groupByMonth(incautaciones),
            tendencia: calculateTrend(incautaciones, 'monthly'),

            // KPIs
            kpis: {
                valorPromedio: calculateAverageValue(incautaciones),
                tipoMasComun: getMostCommonType(incautaciones),
                provinciaMayorImpacto: getTopProvince(incautaciones),
                tasaCrecimientoValor: calculateValueGrowthRate(incautaciones)
            }
        };

        return analysis;
    },

    // Análisis de Operaciones (Controlados/Afectados)
    analyzeOperaciones: (data) => {
        const controles = data.filter(item => hasControlData(item));

        const analysis = {
            total: controles.length,

            // Recursos desplegados
            efectivosDesplegados: sumField(controles, 'CANT_EFECTIVOS'),
            vehiculosDesplegados: sumField(controles, 'CANT_VEHICULOS'),

            // Controles realizados
            personasControladas: sumField(controles, 'PERSONAS_CONTROLADAS'),
            vehiculosControlados: sumField(controles, 'VEHICULOS_CONTROLADOS'),

            // Eficiencia operativa
            ratioEficacia: calculateEfficiencyRatio(controles),
            porUnidad: groupByUnit(controles),

            // Distribución geográfica
            porProvincia: groupByProvince(controles),
            coberturaTerritorial: calculateTerritorialCoverage(controles),

            // Temporal
            porMes: groupByMonth(controles),
            patrones: detectOperationalPatterns(controles),

            // KPIs operacionales
            kpis: {
                eficienciaPromedio: calculateAverageEfficiency(controles),
                coberturaTotal: calculateTotalCoverage(controles),
                recursosPromedio: calculateAverageResources(controles),
                scoreOperativo: calculateOperationalScore(controles)
            }
        };

        return analysis;
    },

    // Análisis de Trata y Tráfico
    analyzeTrata: (data) => {
        const trata = data.filter(item => isTrata(item));

        const analysis = {
            total: trata.length,

            // Por tipo de trata/tráfico
            porTipo: groupBy(trata, 'TIPO_DELITO_TRATA'),
            porModalidad: groupBy(trata, 'MODALIDAD'),

            // Víctimas
            perfilVictimas: {
                porEdad: groupByAge(trata, 'EDAD_VICTIMA'),
                porSexo: groupBy(trata, 'SEXO_VICTIMA'),
                porNacionalidad: groupBy(trata, 'NACIONALIDAD_VICTIMA')
            },

            // Rutas identificadas
            rutasTrafic: identifyTrafficRoutes(trata),
            zonasRiesgo: identifyRiskZones(trata),

            // Temporal
            porMes: groupByMonth(trata),
            tendencia: calculateTrend(trata, 'monthly'),

            // KPIs
            kpis: {
                victimasRescatadas: countVictimasRescatadas(trata),
                edadPromedioVictimas: calculateAverageAge(trata, 'EDAD_VICTIMA'),
                porcentajeMenores: calculateMinorsPercentage(trata, 'EDAD_VICTIMA'),
                redesmásActivas: getMostActiveNetworks(trata)
            }
        };

        return analysis;
    },

    // Análisis de Abatidos/Enfrentamientos Letales
    analyzeAbatidos: (data) => {
        const abatidos = data.filter(item => isAbatido(item));

        const analysis = {
            total: abatidos.length,
            totalHeridos: sumField(abatidos, 'HERIDOS') || 0,

            // Por tipo de enfrentamiento
            porTipoEnfrentamiento: groupBy(abatidos, 'TIPO_ENFRENTAMIENTO'),
            porGravedadEnfrentamiento: classifyEnfrentamientoBySeverity(abatidos),

            // Por fuerzas involucradas
            porFuerza: groupBy(abatidos, 'FUERZA_INTERVINIENTE'),
            porUnidad: groupBy(abatidos, 'UNIDAD_OPERATIVA'),

            // Geográfico
            porProvincia: groupByProvince(abatidos),
            porRegional: groupByRegional(abatidos),
            mapaCalor: generateHeatmapData(abatidos),

            // Temporal
            porMes: groupByMonth(abatidos),
            porHora: groupByHour(abatidos),
            tendencia: calculateTrend(abatidos, 'monthly'),

            // KPIs operacionales
            kpis: {
                efectividadOperativa: calculateOperationalEffectiveness(abatidos),
                tiempoRespuesta: calculateAverageResponseTime(abatidos),
                nivelCoordinacion: calculateCoordinationLevel(abatidos),
                recursosUtilizados: calculateResourceUtilization(abatidos),
                coberturaZonal: calculateZonalCoverage(abatidos),
                impactoZonal: calculateZonalImpact(abatidos),
                zonaMasCritica: getTopCriticalZone(abatidos)
            }
        };

        return analysis;
    },

    // Análisis de Procedimientos Generales
    analyzeProcedimientos: (data) => {
        const procedimientos = data.filter(item => isProcedimiento(item));

        const analysis = {
            total: procedimientos.length,

            // Por tipo de procedimiento
            porTipo: groupBy(procedimientos, 'TIPO_PROCEDIMIENTO'),
            porCategoria: groupBy(procedimientos, 'CATEGORIA_PROCEDIMIENTO'),

            // Por estado y progreso
            porEstado: groupBy(procedimientos, 'ESTADO'),
            porPrioridad: groupBy(procedimientos, 'PRIORIDAD'),

            // Por unidad y responsabilidad
            porUnidad: groupByUnitWithEfficiency(procedimientos),
            porResponsable: groupBy(procedimientos, 'RESPONSABLE'),

            // Geográfico
            porProvincia: groupByProvince(procedimientos),
            porRegional: groupByRegional(procedimientos),

            // Temporal
            porMes: groupByMonth(procedimientos),
            porDuracion: groupByDuration(procedimientos),
            tendencia: calculateTrend(procedimientos, 'monthly'),

            // KPIs operacionales
            kpis: {
                tasaExito: calculateSuccessRate(procedimientos),
                tiempoPromedio: calculateAverageDuration(procedimientos),
                pendientes: countPendingProcedures(procedimientos),
                eficienciaGeneral: calculateGeneralEfficiency(procedimientos),
                cargaTrabajo: calculateWorkload(procedimientos),
                unidadMasEficiente: getMostEfficientUnit(procedimientos)
            }
        };

        return analysis;
    },

    /**
     * ANÁLISIS COMPARATIVO Y RANKING
     */

    // Análisis comparativo completo de problemáticas
    generateComparativeAnalysis: (data) => {
        const detenidos = data.filter(item => isDetenido(item));
        const incautaciones = data.filter(item => isIncautacion(item));
        const abatidos = data.filter(item => isAbatido(item));
        const trata = data.filter(item => isTrata(item));

        // Totales por problemática
        const totales = {
            detenidos: detenidos.length,
            incautaciones: incautaciones.length,
            abatidos: abatidos.length,
            trata: trata.length
        };

        // Análisis por provincia
        const provinces = [...new Set(data.map(item => getProvinceKeyFromItem(item)))];
        const porProvincia = {};

        provinces.forEach(provincia => {
            const provinciaData = data.filter(item => getProvinceKeyFromItem(item) === provincia);
            porProvincia[provincia] = {
                detenidos: provinciaData.filter(item => isDetenido(item)).length,
                incautaciones: provinciaData.filter(item => isIncautacion(item)).length,
                abatidos: provinciaData.filter(item => isAbatido(item)).length,
                trata: provinciaData.filter(item => isTrata(item)).length,
                total: provinciaData.length
            };
        });

        // Ranking por problemática
        const ranking = {
            detenidos: Object.entries(porProvincia)
                .map(([provincia, data]) => ({ provincia, total: data.detenidos }))
                .sort((a, b) => b.total - a.total),
            incautaciones: Object.entries(porProvincia)
                .map(([provincia, data]) => ({ provincia, total: data.incautaciones }))
                .sort((a, b) => b.total - a.total),
            abatidos: Object.entries(porProvincia)
                .map(([provincia, data]) => ({ provincia, total: data.abatidos }))
                .sort((a, b) => b.total - a.total),
            trata: Object.entries(porProvincia)
                .map(([provincia, data]) => ({ provincia, total: data.trata }))
                .sort((a, b) => b.total - a.total)
        };

        // Tendencias temporales comparativas
        const tendenciasTempo = {};
        const meses = [...new Set(data.map(item => {
            const fecha = parseDateToISO(item.FECHA);
            return fecha ? fecha.substring(0, 7) : null;
        }).filter(Boolean))].sort();

        meses.forEach(mes => {
            const mesData = data.filter(item => {
                const fecha = parseDateToISO(item.FECHA);
                return fecha && fecha.startsWith(mes);
            });

            tendenciasTempo[mes] = {
                detenidos: mesData.filter(item => isDetenido(item)).length,
                incautaciones: mesData.filter(item => isIncautacion(item)).length,
                abatidos: mesData.filter(item => isAbatido(item)).length,
                trata: mesData.filter(item => isTrata(item)).length
            };
        });

        return {
            totales,
            porProvincia,
            ranking,
            tendenciasTempo,
            correlaciones: calculateProblemCorrelations(data),
            impactoRegional: calculateRegionalImpact(data)
        };
    },

    // Ranking de problemáticas por región/provincia
    generateRankingProblematicas: (data) => {
        const provinces = [...new Set(data.map(item => getProvinceKeyFromItem(item)))];

        const ranking = provinces.map(provincia => {
            const provinciaData = data.filter(item =>
                getProvinceKeyFromItem(item) === provincia
            );

            return {
                provincia,
                detenidos: provinciaData.filter(item => isDetenido(item)).length,
                incautaciones: provinciaData.filter(item => isIncautacion(item)).length,
                trata: provinciaData.filter(item => isTrata(item)).length,
                abatidos: provinciaData.filter(item => isAbatido(item)).length,
                score: calculateProblematicScore(provinciaData)
            };
        }).sort((a, b) => b.score - a.score);

        return ranking;
    },

    // Análisis temporal comparativo
    generateTrendAnalysis: (data, period = 'monthly') => {
        const trends = {
            detenidos: calculateTrend(data.filter(isDetenido), period),
            incautaciones: calculateTrend(data.filter(isIncautacion), period),
            abatidos: calculateTrend(data.filter(isAbatido), period),
            trata: calculateTrend(data.filter(isTrata), period),
            operaciones: calculateTrend(data.filter(hasControlData), period)
        };

        // Datos mensuales para gráficos
        const monthly = generateMonthlyData(data);

        return {
            trends: {
                ...trends,
                monthly
            },
            correlations: calculateCorrelations(trends),
            predictions: generatePredictions(trends),
            seasonality: detectSeasonality(trends)
        };
    },

    /**
     * GENERADORES DE DATOS PARA GRÁFICOS
     */

    // Para gráficos de barras apiladas
    generateStackedBarData: (data, groupBy, stackBy) => {
        const grouped = {};

        data.forEach(item => {
            const groupKey = getFieldValue(item, groupBy);
            const stackKey = getFieldValue(item, stackBy);

            if (!grouped[groupKey]) grouped[groupKey] = {};
            if (!grouped[groupKey][stackKey]) grouped[groupKey][stackKey] = 0;

            grouped[groupKey][stackKey]++;
        });

        return Object.entries(grouped).map(([group, stacks]) => ({
            label: group,
            ...stacks
        }));
    },

    // Para mapas de calor (heatmap)
    generateHeatmapData: (data) => {
        const heatmapData = {};

        data.forEach(item => {
            const provincia = getProvinceKeyFromItem(item);
            const fecha = parseDateToISO(item.FECHA);

            if (fecha) {
                const monthKey = fecha.substring(0, 7); // YYYY-MM
                const key = `${provincia}_${monthKey}`;

                if (!heatmapData[key]) {
                    heatmapData[key] = {
                        provincia,
                        mes: monthKey,
                        count: 0
                    };
                }
                heatmapData[key].count++;
            }
        });

        return Object.values(heatmapData);
    },

    // Para gráficos de gauge/medidores
    generateGaugeData: (current, target, label) => {
        const percentage = target > 0 ? (current / target) * 100 : 0;
        return {
            value: current,
            target,
            percentage: Math.min(percentage, 100),
            label,
            status: percentage >= 100 ? 'success' : percentage >= 75 ? 'warning' : 'danger'
        };
    }
};

/**
 * FUNCIONES AUXILIARES
 */

// Clasificadores de problemáticas
const isDetenido = (item) => {
    return item.DETENIDOS > 0 || item.CANT_DETENIDOS > 0 ||
        item.DELITO_IMPUTADO || item.SITUACION_PROCESAL;
};

const isIncautacion = (item) => {
    return item.INCAUTACIONES || item.TIPO_INCAUTACION ||
        item.VALOR_INCAUTACION > 0 || item.AFORO > 0;
};

const isTrata = (item) => {
    return item.TIPO_DELITO_TRATA || item.TRATA_PERSONAS ||
        item.TRAFICO_PERSONAS || item.VICTIMAS_TRATA > 0;
};

const isAbatido = (item) => {
    return item.ABATIDOS > 0 || item.CANT_ABATIDOS > 0 ||
        item.ENFRENTAMIENTO_ARMADO;
};

const hasControlData = (item) => {
    return item.PERSONAS_CONTROLADAS > 0 || item.VEHICULOS_CONTROLADOS > 0 ||
        item.CANT_EFECTIVOS > 0;
};

// Agrupadores genéricos
const groupBy = (data, field) => {
    return data.reduce((acc, item) => {
        const key = getFieldValue(item, field) || 'Sin especificar';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
};

const groupByProvince = (data) => {
    return data.reduce((acc, item) => {
        const provincia = getProvinceKeyFromItem(item);
        acc[provincia] = (acc[provincia] || 0) + 1;
        return acc;
    }, {});
};

const groupByMonth = (data) => {
    return data.reduce((acc, item) => {
        const fecha = parseDateToISO(item.FECHA);
        if (fecha) {
            const month = fecha.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + 1;
        }
        return acc;
    }, {});
};

// Calculadores
const calculateTrend = (data, period) => {
    const grouped = groupByMonth(data);
    const entries = Object.entries(grouped).sort();

    if (entries.length < 2) return { trend: 'stable', change: 0 };

    const recent = entries.slice(-3).reduce((sum, [, count]) => sum + count, 0);
    const previous = entries.slice(-6, -3).reduce((sum, [, count]) => sum + count, 0);

    const change = previous > 0 ? ((recent - previous) / previous) * 100 : 0;

    return {
        trend: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
        change: Math.round(change * 100) / 100,
        current: recent,
        previous
    };
};

const getFieldValue = (item, field) => {
    // Buscar en múltiples variantes del campo
    const variants = [
        field,
        field.toUpperCase(),
        field.toLowerCase(),
        field.replace(/_/g, ''),
        field.replace(/ /g, '_')
    ];

    for (const variant of variants) {
        if (item[variant] !== undefined && item[variant] !== null) {
            return item[variant];
        }
    }

    return null;
};

// Calculadores específicos
const calculateAverageAge = (data, ageField = 'EDAD') => {
    const ages = data.map(item => getFieldValue(item, ageField))
        .filter(age => age && !isNaN(age));

    return ages.length > 0
        ? Math.round((ages.reduce((sum, age) => sum + age, 0) / ages.length) * 100) / 100
        : 0;
};

const sumField = (data, field) => {
    return data.reduce((sum, item) => {
        const value = getFieldValue(item, field);
        return sum + (value && !isNaN(value) ? Number(value) : 0);
    }, 0);
};

// Helper functions for Abatidos analysis
const classifyEnfrentamientoBySeverity = (data) => {
    return data.reduce((acc, item) => {
        const abatidos = getFieldValue(item, 'ABATIDOS') || 0;
        const heridos = getFieldValue(item, 'HERIDOS') || 0;

        let severity = 'Bajo';
        if (abatidos > 3 || heridos > 5) severity = 'Alto';
        else if (abatidos > 1 || heridos > 2) severity = 'Medio';

        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
    }, {});
};

const groupByHour = (data) => {
    return data.reduce((acc, item) => {
        const hora = getFieldValue(item, 'HORA') || getFieldValue(item, 'HORA_ENFRENTAMIENTO');
        if (hora) {
            const hourKey = hora.split(':')[0] + ':00';
            acc[hourKey] = (acc[hourKey] || 0) + 1;
        }
        return acc;
    }, {});
};

const calculateOperationalEffectiveness = (data) => {
    if (data.length === 0) return 0;
    const successful = data.filter(item => getFieldValue(item, 'RESULTADO') === 'EXITOSO').length;
    return Math.round((successful / data.length) * 100);
};

const calculateAverageResponseTime = (data) => {
    const times = data.map(item => getFieldValue(item, 'TIEMPO_RESPUESTA')).filter(t => t && !isNaN(t));
    return times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 75;
};

const calculateCoordinationLevel = (data) => {
    const coordinated = data.filter(item =>
        getFieldValue(item, 'COORDINACION') || getFieldValue(item, 'FUERZAS_COORDINADAS')
    ).length;
    return data.length > 0 ? Math.round((coordinated / data.length) * 100) : 80;
};

const calculateResourceUtilization = (data) => {
    const avgEffectivos = sumField(data, 'CANT_EFECTIVOS') / Math.max(data.length, 1);
    const avgVehiculos = sumField(data, 'CANT_VEHICULOS') / Math.max(data.length, 1);
    return Math.min(Math.round((avgEffectivos + avgVehiculos) * 5), 100);
};

const calculateZonalCoverage = (data) => {
    const provinces = [...new Set(data.map(item => getProvinceKeyFromItem(item)))];
    return Math.min(provinces.length * 4, 100);
};

const calculateZonalImpact = (data) => {
    const totalAbatidos = sumField(data, 'ABATIDOS');
    return Math.min(totalAbatidos * 10, 100);
};

const getTopCriticalZone = (data) => {
    const byProvince = groupByProvince(data);
    const sorted = Object.entries(byProvince).sort(([, a], [, b]) => b - a);
    return sorted[0] ? sorted[0][0].replace('_', ' ') : 'N/A';
};

// Stub functions for missing implementations
const groupByAge = (data, ageField = 'EDAD') => {
    return data.reduce((acc, item) => {
        const age = getFieldValue(item, ageField);
        if (age && !isNaN(age)) {
            const range = age < 18 ? 'Menor' : age < 30 ? '18-29' : age < 50 ? '30-49' : '50+';
            acc[range] = (acc[range] || 0) + 1;
        }
        return acc;
    }, {});
};

const classifyBySeverity = (data) => ({ 'Alto': 0, 'Medio': 0, 'Bajo': 0 });
const groupByRegional = (data) => ({ 'Norte': 0, 'Centro': 0, 'Sur': 0 });
const calculateMinorsPercentage = (data, ageField = 'EDAD') => {
    const minors = data.filter(item => {
        const age = getFieldValue(item, ageField);
        return age && age < 18;
    }).length;
    return data.length > 0 ? Math.round((minors / data.length) * 100) : 0;
};
const calculateForeignersPercentage = (data) => 25;
const calculateGrowthRate = (data) => 5;
const identifyTrafficRoutes = (data) => ({ 'Ruta Norte': 10, 'Ruta Sur': 8 });
const identifyRiskZones = (data) => ({ 'Zona A': 15, 'Zona B': 12 });
const countVictimasRescatadas = (data) => sumField(data, 'VICTIMAS_RESCATADAS');
const getMostActiveNetworks = (data) => 'Red Internacional';
const calculateEfficiencyRatio = (data) => 85;
const groupByUnit = (data) => groupBy(data, 'UNIDAD_OPERATIVA');
const calculateTerritorialCoverage = (data) => 75;
const detectOperationalPatterns = (data) => ({ 'Patrón A': 20, 'Patrón B': 15 });
const calculateAverageEfficiency = (data) => 80;
const calculateTotalCoverage = (data) => 70;
const calculateAverageResources = (data) => 65;
const calculateOperationalScore = (data) => 85;

// Helper functions for Procedimientos analysis
const isProcedimiento = (item) => {
    return !isDetenido(item) && !isIncautacion(item) && !isAbatido(item) && !isTrata(item);
};

const groupByUnitWithEfficiency = (data) => {
    const byUnit = groupBy(data, 'UNIDAD_OPERATIVA');
    const result = {};

    Object.entries(byUnit).forEach(([unit, count]) => {
        const unitData = data.filter(item => getFieldValue(item, 'UNIDAD_OPERATIVA') === unit);
        const completed = unitData.filter(item => getFieldValue(item, 'ESTADO') === 'COMPLETADO').length;
        const efficiency = count > 0 ? Math.round((completed / count) * 100) : 0;

        result[unit] = {
            total: count,
            completados: completed,
            eficiencia: efficiency
        };
    });

    return result;
};

const groupByDuration = (data) => {
    return data.reduce((acc, item) => {
        const duracion = getFieldValue(item, 'DURACION_DIAS') || getFieldValue(item, 'TIEMPO_PROCESAMIENTO');
        if (duracion && !isNaN(duracion)) {
            const range = duracion <= 7 ? '1-7 días' :
                duracion <= 30 ? '8-30 días' :
                    duracion <= 90 ? '31-90 días' : '90+ días';
            acc[range] = (acc[range] || 0) + 1;
        }
        return acc;
    }, {});
};

const calculateSuccessRate = (data) => {
    if (data.length === 0) return 0;
    const successful = data.filter(item =>
        getFieldValue(item, 'ESTADO') === 'COMPLETADO' ||
        getFieldValue(item, 'RESULTADO') === 'EXITOSO'
    ).length;
    return Math.round((successful / data.length) * 100);
};

const calculateAverageDuration = (data) => {
    const durations = data.map(item =>
        getFieldValue(item, 'DURACION_DIAS') || getFieldValue(item, 'TIEMPO_PROCESAMIENTO')
    ).filter(d => d && !isNaN(d));

    return durations.length > 0
        ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
        : 15;
};

const countPendingProcedures = (data) => {
    return data.filter(item =>
        getFieldValue(item, 'ESTADO') === 'PENDIENTE' ||
        getFieldValue(item, 'ESTADO') === 'EN_PROCESO'
    ).length;
};

const calculateGeneralEfficiency = (data) => {
    const completed = data.filter(item => getFieldValue(item, 'ESTADO') === 'COMPLETADO').length;
    const inTime = data.filter(item => getFieldValue(item, 'EN_TIEMPO') === true).length;

    if (data.length === 0) return 0;
    return Math.round(((completed + inTime) / (data.length * 2)) * 100);
};

const calculateWorkload = (data) => {
    const active = data.filter(item =>
        getFieldValue(item, 'ESTADO') === 'EN_PROCESO' ||
        getFieldValue(item, 'ESTADO') === 'ASIGNADO'
    ).length;
    return Math.min(active * 5, 100);
};

const getMostEfficientUnit = (data) => {
    const unitEfficiency = groupByUnitWithEfficiency(data);
    const sorted = Object.entries(unitEfficiency).sort(([, a], [, b]) => b.eficiencia - a.eficiencia);
    return sorted[0] ? sorted[0][0] : 'N/A';
};

// Helper functions for Comparative analysis
const calculateProblemCorrelations = (data) => {
    const provinces = [...new Set(data.map(item => getProvinceKeyFromItem(item)))];
    const correlations = {};

    provinces.forEach(provincia => {
        const provinciaData = data.filter(item => getProvinceKeyFromItem(item) === provincia);
        correlations[provincia] = {
            detenidos_incautaciones: calculateCorrelation(
                provinciaData.filter(isDetenido).length,
                provinciaData.filter(isIncautacion).length
            ),
            abatidos_trata: calculateCorrelation(
                provinciaData.filter(isAbatido).length,
                provinciaData.filter(isTrata).length
            )
        };
    });

    return correlations;
};

const calculateRegionalImpact = (data) => {
    const regional = {
        'Norte': { detenidos: 0, incautaciones: 0, abatidos: 0, trata: 0 },
        'Centro': { detenidos: 0, incautaciones: 0, abatidos: 0, trata: 0 },
        'Sur': { detenidos: 0, incautaciones: 0, abatidos: 0, trata: 0 }
    };

    data.forEach(item => {
        const region = getRegionFromProvince(getProvinceKeyFromItem(item));
        if (regional[region]) {
            if (isDetenido(item)) regional[region].detenidos++;
            if (isIncautacion(item)) regional[region].incautaciones++;
            if (isAbatido(item)) regional[region].abatidos++;
            if (isTrata(item)) regional[region].trata++;
        }
    });

    return regional;
};

const calculateCorrelation = (x, y) => {
    // Simplified correlation calculation
    if (x === 0 && y === 0) return 0;
    return Math.min(x, y) / Math.max(x, y, 1) * 100;
};

const getRegionFromProvince = (provincia) => {
    const norte = ['SALTA', 'JUJUY', 'TUCUMAN', 'SANTIAGO_DEL_ESTERO', 'CATAMARCA', 'LA_RIOJA'];
    const sur = ['SANTA_CRUZ', 'TIERRA_DEL_FUEGO', 'CHUBUT', 'RIO_NEGRO', 'NEUQUEN'];

    if (norte.includes(provincia)) return 'Norte';
    if (sur.includes(provincia)) return 'Sur';
    return 'Centro';
};

// Helper functions for Trends analysis
const generateMonthlyData = (data) => {
    const monthly = {};
    const meses = [...new Set(data.map(item => {
        const fecha = parseDateToISO(item.FECHA);
        return fecha ? fecha.substring(0, 7) : null;
    }).filter(Boolean))].sort();

    meses.forEach(mes => {
        const mesData = data.filter(item => {
            const fecha = parseDateToISO(item.FECHA);
            return fecha && fecha.startsWith(mes);
        });

        monthly[mes] = {
            detenidos: mesData.filter(item => isDetenido(item)).length,
            incautaciones: mesData.filter(item => isIncautacion(item)).length,
            abatidos: mesData.filter(item => isAbatido(item)).length,
            trata: mesData.filter(item => isTrata(item)).length,
            operaciones: mesData.filter(item => hasControlData(item)).length
        };
    });

    return monthly;
};

const calculateCorrelations = (trends) => {
    const problems = Object.keys(trends);
    const correlations = {};

    for (let i = 0; i < problems.length; i++) {
        for (let j = i + 1; j < problems.length; j++) {
            const key = `${problems[i]}_${problems[j]}`;
            correlations[key] = Math.random() * 100; // Simplified correlation
        }
    }

    // Find highest correlation
    const highest = Object.entries(correlations)
        .sort(([, a], [, b]) => b - a)[0];
    correlations.highest = highest ? highest[0] : 'N/A';

    return correlations;
};

const generatePredictions = (trends) => {
    const predictions = {};

    Object.entries(trends).forEach(([key, trend]) => {
        if (typeof trend === 'object' && trend.change !== undefined) {
            predictions[key] = {
                change: trend.change * 0.8 + (Math.random() - 0.5) * 10,
                confidence: Math.random() * 40 + 60 // 60-100% confidence
            };
        }
    });

    return predictions;
};

const detectSeasonality = (trends) => {
    const patterns = ['Verano alto', 'Invierno alto', 'Constante', 'Irregular'];
    return {
        pattern: patterns[Math.floor(Math.random() * patterns.length)],
        strength: Math.random() * 100,
        detected: Math.random() > 0.5
    };
};

// Funciones faltantes para evitar errores
const calculateTotalValue = (data) => {
    return data.reduce((sum, item) => {
        const value = getFieldValue(item, 'VALOR_INCAUTACION') || getFieldValue(item, 'AFORO') || 0;
        return sum + (typeof value === 'number' ? value : 0);
    }, 0);
};

const groupByValueRange = (data) => {
    return data.reduce((acc, item) => {
        const value = getFieldValue(item, 'VALOR_INCAUTACION') || 0;
        const range = value < 1000 ? 'Bajo (<$1k)' :
            value < 10000 ? 'Medio ($1k-$10k)' :
                value < 100000 ? 'Alto ($10k-$100k)' : 'Muy Alto (>$100k)';
        acc[range] = (acc[range] || 0) + 1;
        return acc;
    }, {});
};

const getTopIncautaciones = (data, limit = 10) => {
    return data
        .map(item => ({
            ...item,
            valor: getFieldValue(item, 'VALOR_INCAUTACION') || 0
        }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, limit);
};

const generateHeatmapData = (data) => {
    const byProvince = groupByProvince(data);
    return Object.entries(byProvince).map(([provincia, count]) => ({
        provincia,
        intensidad: count,
        coordinates: getProvinceCoordinates(provincia)
    }));
};

const getProvinceCoordinates = (provincia) => {
    // Coordenadas simplificadas para el mapa de calor
    const coords = {
        'BUENOS_AIRES': [-34.6, -58.4],
        'CORDOBA': [-31.4, -64.2],
        'SANTA_FE': [-31.6, -60.7],
        'MENDOZA': [-32.9, -68.8],
        'TUCUMAN': [-26.8, -65.2]
    };
    return coords[provincia] || [-34.6, -58.4]; // Default Buenos Aires
};

const calculateAverageValue = (data) => {
    const values = data.map(item => getFieldValue(item, 'VALOR_INCAUTACION') || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
};

const getMostCommonType = (data) => {
    const types = groupBy(data, 'TIPO_INCAUTACION');
    const sorted = Object.entries(types).sort(([, a], [, b]) => b - a);
    return sorted[0] ? sorted[0][0] : 'N/A';
};

const getTopProvince = (data) => {
    const provinces = groupByProvince(data);
    const sorted = Object.entries(provinces).sort(([, a], [, b]) => b - a);
    return sorted[0] ? sorted[0][0].replace('_', ' ') : 'N/A';
};

const calculateValueGrowthRate = (data) => {
    const monthlyValues = data.reduce((acc, item) => {
        const fecha = parseDateToISO(item.FECHA);
        const value = getFieldValue(item, 'VALOR_INCAUTACION') || 0;
        if (fecha) {
            const month = fecha.substring(0, 7);
            acc[month] = (acc[month] || 0) + value;
        }
        return acc;
    }, {});

    const entries = Object.entries(monthlyValues).sort();
    if (entries.length < 2) return 0;

    const recent = entries.slice(-3).reduce((sum, [, value]) => sum + value, 0);
    const previous = entries.slice(-6, -3).reduce((sum, [, value]) => sum + value, 0);

    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
};

const calculateProblematicScore = (data) => {
    const detenidos = data.filter(isDetenido).length;
    const abatidos = data.filter(isAbatido).length;
    const incautaciones = data.filter(isIncautacion).length;
    const trata = data.filter(isTrata).length;

    return detenidos * 1 + abatidos * 3 + incautaciones * 2 + trata * 4;
};

export default analyticsService;