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
    
    /**
     * ANÁLISIS COMPARATIVO Y RANKING
     */
    
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
            trata: calculateTrend(data.filter(isTrata), period),
            operaciones: calculateTrend(data.filter(hasControlData), period)
        };
        
        return {
            trends,
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

export default analyticsService;