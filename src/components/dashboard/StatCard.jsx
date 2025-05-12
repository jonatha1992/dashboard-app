// Componente para mostrar una estadística en una tarjeta
export default function StatCard({ title, value, icon, color = 'bg-blue-500' }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className={`${color} text-white p-3 rounded-full mr-4`}>
                {icon}
            </div>
            <div>
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <p className="text-2xl font-semibold">{value}</p>
            </div>
        </div>
    );
}
