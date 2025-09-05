import { useState, useRef } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

export default function ExcelUpload() {
    const { setData, setDataStats } = useDashboard();
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // Validar que sea un archivo Excel
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            setMessage('Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
            return;
        }

        // Verificar permisos de usuario
        if (!user || user.role !== 'admin') {
            setMessage('Solo los administradores pueden subir archivos');
            return;
        }

        setUploading(true);
        setMessage('Subiendo archivo al servidor...');

        try {
            const result = await apiService.uploadData(file);
            
            // Mostrar estadísticas del resultado
            const { stats, etl_result } = result;
            const etlStatus = etl_result ? 
                (etl_result.status === 'success' ? 
                    `🔄 ETL: ✅ Ejecutado automáticamente (${etl_result.facts_created} hechos creados)` : 
                    `🔄 ETL: ⚠️ ${etl_result.message}`
                ) : '🔄 ETL: No ejecutado';
            
            setMessage(`✅ Importación completada:
📊 ${stats.totalAdded} registros nuevos
⚠️ ${stats.duplicatesSkipped} duplicados omitidos
📁 Total de registros en sistema: ${stats.totalRecords}
📋 Hojas procesadas: ${stats.sheetsProcessed.length}
${etlStatus}`);

            // Recargar datos Y estadísticas actualizadas
            const [updatedData, updatedStats] = await Promise.all([
                apiService.getData(),
                apiService.getDataStats()
            ]);
            setData(updatedData);

            // Actualizar estadísticas en el contexto global si está disponible
            if (typeof setDataStats === 'function') {
                setDataStats(updatedStats);
            }

            // Limpiar el input file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Error al subir archivo:', error);
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Solo mostrar el botón para administradores
    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="relative group">
            <button
                onClick={handleButtonClick}
                disabled={uploading}
                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors min-w-fit whitespace-nowrap ${uploading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                title="Subir datos desde Excel (Solo Administradores)"
            >
                {uploading ? (
                    <>
                        <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Subiendo...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Importar Excel
                    </>
                )}
            </button>

            {/* Tooltip */}
            <div className="absolute z-20 w-64 px-3 py-2 mb-2 text-xs text-white transition-all duration-200 transform -translate-x-1/2 bg-gray-900 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 scale-90 group-hover:opacity-100 group-hover:scale-100">
                Seleccione un archivo Excel (.xlsx o .xls) con datos de operativos.
                <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-gray-900"></div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
            />

            {message && (
                <div className="absolute z-10 right-0 top-full mt-1 w-80">
                    <div className={`p-3 rounded-md text-sm shadow-lg transition-all ${
                        message.includes('✅') 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : message.includes('⚠️')
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        <pre className="whitespace-pre-wrap font-mono text-xs">{message}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}