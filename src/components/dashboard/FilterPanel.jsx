import UnifiedFilter from './UnifiedFilter';

export default function FilterPanel({ onFiltersChange }) {
    const handleFiltersChange = (filters) => {
        onFiltersChange(filters);
    };

    return (
        <UnifiedFilter onFiltersChange={handleFiltersChange} />
    );
}