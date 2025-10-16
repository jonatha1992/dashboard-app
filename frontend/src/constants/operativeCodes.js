export const DEFAULT_OPERATIVE_CODE = '2011';

export const OPERATIVE_CODE_ENTRIES = [
  {
    code: '1',
    name: 'BARRIOS SEGUROS',
    description: 'Acciones policiales enmarcadas en el programa Barrios Seguros.'
  },
  {
    code: '2',
    name: 'ESTACIONES SEGURAS',
    description: 'Operativos vinculados al programa Estaciones Seguras: controles en estaciones, vagones y entorno ferroviario.'
  },
  {
    code: '3',
    name: 'TRIBUNA SEGURA',
    description: 'Operativos del programa Tribuna Segura: controles de personas, vehiculos y accesos en eventos deportivos.'
  },
  {
    code: '4',
    name: 'COSECHA SEGURA',
    description: 'Acciones del programa Cosecha Segura: controles de carga de granos y prevencion de robos vinculados.'
  },
  {
    code: '5',
    name: 'PLAN BANDERA',
    description: 'Acciones policiales enmarcadas en el Plan Bandera.'
  },
  {
    code: '6',
    name: 'PROTOCOLO ANTIPIQUETES',
    description: 'Servicios de orden publico y actuaciones en manifestaciones dentro del protocolo antipiquetes.'
  },
  {
    code: '7',
    name: 'PROTOCOLO ANTIBLOQUEO',
    description: 'Operativos destinados a desbloqueo o prevencion de bloqueos a empresas o actividades comerciales.'
  },
  {
    code: '8',
    name: 'CERROJO DETECCION',
    description: 'Controles de personas y vehiculos correspondientes al programa Cerrojo Deteccion.'
  },
  {
    code: '9',
    name: 'PLAN GUEMES',
    description: 'Acciones policiales enmarcadas en el Plan Guemes.'
  },
  {
    code: '10',
    name: 'SITEVIF',
    description: 'Procedimientos iniciados mediante la solucion de control de fronteras SITEVIF.'
  },
  {
    code: '11',
    name: 'TAI',
    description: 'Operativos derivados del comando Transporte Aereo Irregular (TAI).'
  },
  {
    code: '12',
    name: 'PLAN 9010',
    description: 'Acciones policiales dentro del Plan 9010.'
  },
  {
    code: '13',
    name: 'PLAN GUACURARY',
    description: 'Operativos vinculados al uso de la solucion de control de fronteras en Misiones, zona Bernardo de Irigoyen.'
  },
  {
    code: '6001',
    name: 'PFA - RUTAS SEGURAS',
    description: 'Operativos de control sobre rutas realizados por PFA.'
  },
  {
    code: '6002',
    name: 'PFA - SATURACION SINCRONIZADA A NIVEL NACIONAL',
    description: 'Operativo de saturacion sincronizada en todo el pais con foco en delitos vinculados a transporte.'
  },
  {
    code: '6003',
    name: 'PFA - PREVENCION FEDERAL',
    description: 'Procedimientos generales derivados de la propia tarea policial federal.'
  },
  {
    code: '6004',
    name: 'PFA - PLAN CERROJO 9010 CONO URBANO BONAERENSE',
    description: 'Acciones enmarcadas en el Plan Cerrojo 9010 en el Conurbano bonaerense realizadas por PFA.'
  },
  {
    code: '3001',
    name: 'GNA - PLAN CERROJO 9010 CONO URBANO BONAERENSE',
    description: 'Operativos de la Gendarmeria Nacional dentro del Plan Cerrojo 9010 Cono Urbano Bonaerense.'
  },
  {
    code: '2001',
    name: 'PLAN CERROJO 9010 CONO URBANO BONAERENSE',
    description: 'Acciones policiales generales dentro del Plan Cerrojo 9010 Conurbano bonaerense.'
  },
  {
    code: '2010',
    name: 'TESTIGOS PROTEGIDOS',
    description: 'Custodias de testigos protegidos; solo se informa provincia.'
  },
  {
    code: '2011',
    name: 'PROCEDIMIENTOS GENERALES',
    description: 'Procedimientos generales no encuadrados en programas especificos.'
  }
];

export const OPERATIVE_CODE_MAP = OPERATIVE_CODE_ENTRIES.reduce((acc, item) => {
  acc[item.code] = item;
  return acc;
}, {});
