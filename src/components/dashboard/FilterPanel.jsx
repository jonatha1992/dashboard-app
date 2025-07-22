import DateFilter from './DateFilter';
import ProvinceFilter from './ProvinceFilter';

export default function FilterPanel({ onFiltersChange }) {
    const handleDateChange = (dateFilter) => {
        onFiltersChange({ type: 'date', filter: dateFilter });
    };

    const handleProvinceChange = (provinceFilter) => {
        onFiltersChange({ type: 'province', filter: provinceFilter });
    };

    return (
        <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DateFilter onDateChange={handleDateChange} />
                <ProvinceFilter onProvinceChange={handleProvinceChange} />
            </div>
        </div>
    );
}