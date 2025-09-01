const removeDiacritics = (str) => {
    try {
        return String(str).normalize('NFD').replace(/\p{M}/gu, '');
    } catch (e) {
        return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
};

const toDisplayName = (prov) => {
    if (!prov && prov !== 0) return '';
    const s = String(prov).trim().replace(/\s+/g, ' ');
    return s.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const toKey = (prov) => {
    if (!prov && prov !== 0) return '';
    let s = String(prov).trim().replace(/\s+/g, ' ');
    s = removeDiacritics(s).toLowerCase();
    if (s === 'caba' || s.includes('ciudad autonoma')) return 'ciudad autonoma de buenos aires';
    return s;
};

const variants = [
    'CIUDAD AUTONOMA DE BUENOS AIRES',
    'Ciudad Autónoma de Buenos Aires',
    'Ciudad Autonoma de Buenos Aires',
    'CABA',
    'Buenos Aires',
    'buenos aires'
];

console.log('Variant -> Display Name -> Key');
variants.forEach(v => {
    console.log(`${v} -> ${toDisplayName(v)} -> ${toKey(v)}`);
});

// Simulate filtering: expected 'ciudad autonoma de buenos aires' key for CABA variants
const filter = 'Ciudad Autónoma de Buenos Aires';
const filterKey = toKey(filter);
const sample = [
    { PROVINCIA: 'CIUDAD AUTONOMA DE BUENOS AIRES' },
    { PROVINCIA: 'CABA' },
    { PROVINCIA: 'Buenos Aires' },
];

const matched = sample.filter(item => toKey(item.PROVINCIA) === filterKey);
console.log(`\nFilter '${filter}' (key=${filterKey}) matched ${matched.length} items`);

process.exit(0);
