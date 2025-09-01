// Quick normalization test replicating the normalization logic
const normalizeProvince = (prov) => {
    if (!prov && prov !== 0) return '';
    try {
        const s = String(prov).trim().replace(/\s+/g, ' ');
        return s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } catch (e) {
        return String(prov);
    }
};

const sample = [
    { FECHA: '01/01/2023', PROVINCIA: '  buenos aires ', DEPARTAMENTO_O_PARTIDO: 'X' },
    { FECHA: '02/01/2023', PROVINCIA: 'Buenos Aires', DEPARTAMENTO_O_PARTIDO: 'Y' },
    { FECHA: '03/01/2023', PROVINCIA: 'Córdoba', DEPARTAMENTO_O_PARTIDO: 'Z' },
];

const processed = sample.map(item => ({
    ...item,
    PROVINCIA: normalizeProvince(item.PROVINCIA || ''),
}));

console.log('Processed provinces:', processed.map(p => p.PROVINCIA));

const filter = 'Buenos Aires';
const normFilter = normalizeProvince(filter);
const filtered = processed.filter(item => normalizeProvince(item.PROVINCIA) === normFilter);
console.log(`Filter '${filter}' matched ${filtered.length} items`);

process.exit(0);
