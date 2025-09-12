import React, { useState, useEffect, useRef } from 'react';
import { formatDateToDDMMYYYY, formatDateToISO, isValidDDMMYYYYDate } from '../../utils/dateUtils';

const DateInput = ({ 
    id, 
    value, 
    onChange, 
    min, 
    max, 
    className = '', 
    placeholder = 'dd/mm/aaaa',
    ...props 
}) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const datePickerRef = useRef(null);
    const inputRef = useRef(null);

    // Convertir valor ISO a formato dd/MM/yyyy para mostrar
    useEffect(() => {
        if (value) {
            const formatted = formatDateToDDMMYYYY(value);
            setDisplayValue(formatted);
        } else {
            setDisplayValue('');
        }
    }, [value]);

    // Cerrar datepicker al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target) && 
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        let inputValue = e.target.value;
        
        // Remover caracteres no numéricos excepto /
        inputValue = inputValue.replace(/[^\d/]/g, '');
        
        // Auto-formatear mientras se escribe
        if (inputValue.length <= 10) {
            // Agregar barras automáticamente
            if (inputValue.length === 2 && !inputValue.includes('/')) {
                inputValue += '/';
            } else if (inputValue.length === 5 && inputValue.split('/').length === 2) {
                inputValue += '/';
            }
            
            setDisplayValue(inputValue);
            
            // Validar y convertir a ISO si está completo
            if (inputValue.length === 10) {
                const valid = isValidDDMMYYYYDate(inputValue);
                setIsValid(valid);
                
                if (valid) {
                    const isoDate = formatDateToISO(inputValue);
                    onChange({ target: { value: isoDate } });
                } else {
                    onChange({ target: { value: '' } });
                }
            } else {
                setIsValid(true);
                onChange({ target: { value: '' } });
            }
        }
    };

    const handleBlur = () => {
        // Validar al perder el foco
        if (displayValue && displayValue.length > 0) {
            const valid = isValidDDMMYYYYDate(displayValue);
            setIsValid(valid);
            
            if (!valid) {
                setDisplayValue('');
                onChange({ target: { value: '' } });
            }
        }
    };

    const handleDateSelect = (date) => {
        const isoDate = date.toISOString().split('T')[0];
        const formatted = formatDateToDDMMYYYY(isoDate);
        setDisplayValue(formatted);
        setIsValid(true);
        onChange({ target: { value: isoDate } });
        setShowDatePicker(false);
    };

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Días del mes anterior para completar la primera semana
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        
        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            days.push({ date: currentDate, isCurrentMonth: true });
        }
        
        // Días del mes siguiente para completar la última semana
        const remainingDays = 42 - days.length; // 6 semanas × 7 días
        for (let day = 1; day <= remainingDays; day++) {
            const nextDate = new Date(year, month + 1, day);
            days.push({ date: nextDate, isCurrentMonth: false });
        }
        
        return days;
    };

    const isDateSelected = (date) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return date.toDateString() === selectedDate.toDateString();
    };

    const isDateInRange = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (min && dateStr < min) return false;
        if (max && dateStr > max) return false;
        return true;
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const baseClassName = `px-2 py-1 text-xs border rounded-md focus:ring-primary-400 focus:border-primary-400 ${className}`;
    const validationClassName = !isValid ? 'border-red-500 bg-red-50' : '';

    return (
        <div className="relative">
            <div className="flex">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    maxLength={10}
                    className={`${baseClassName} ${validationClassName} pr-8`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={toggleDatePicker}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {showDatePicker && (
                <div
                    ref={datePickerRef}
                    className="absolute top-full left-0 mt-1 bg-white border-2 border-gray-400 rounded-lg shadow-xl z-50 p-4"
                    style={{ minWidth: '300px' }}
                >
                    {/* Header del calendario */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-gray-200 rounded-md text-gray-700 hover:text-gray-900"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-base font-bold text-gray-800">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-gray-200 rounded-md text-gray-700 hover:text-gray-900"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Días de la semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className="text-xs text-gray-700 text-center p-1 font-semibold">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((dayObj, index) => {
                            const { date, isCurrentMonth } = dayObj;
                            const isSelected = isDateSelected(date);
                            const isInRange = isDateInRange(date);
                            const isToday = date.toDateString() === new Date().toDateString();

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => isInRange && handleDateSelect(date)}
                                    disabled={!isInRange}
                                    className={`
                                        text-xs p-2 rounded transition-colors font-medium
                                        ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}
                                        ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
                                        ${isToday && !isSelected ? 'bg-primary-100 text-primary-700 font-bold' : ''}
                                        ${isInRange && !isSelected && isCurrentMonth ? 'hover:bg-gray-200 hover:text-gray-900' : ''}
                                        ${!isInRange ? 'cursor-not-allowed opacity-40 text-gray-300' : 'cursor-pointer'}
                                    `}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!isValid && (
                <div className="absolute text-xs text-red-500 mt-1">
                    Formato inválido (dd/mm/aaaa)
                </div>
            )}
        </div>
    );
};

export default DateInput;
