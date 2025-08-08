import pandas as pd
import os

# --- Configuración ---
# Ruta del archivo de Excel de entrada
excel_file_path = 'data/bd.xlsx'
# Directorio donde se guardarán los archivos JSON de salida
output_folder_path = 'data/json'
# --- Fin de la Configuración ---

def convert_excel_to_json():
    """
    Lee cada hoja de un archivo Excel y la convierte en un archivo JSON separado.
    """
    try:
        # Cargar el archivo Excel
        xls = pd.ExcelFile(excel_file_path)
        
        # Obtener los nombres de todas las hojas en el archivo
        sheet_names = xls.sheet_names
        
        # Asegurarse de que el directorio de salida exista
        if not os.path.exists(output_folder_path):
            os.makedirs(output_folder_path)
            
        print(f"Se encontraron las siguientes hojas: {sheet_names}")
        
        # Iterar sobre cada hoja y convertirla a JSON
        for sheet_name in sheet_names:
            print(f"Procesando hoja: '{sheet_name}'...")
            df = pd.read_excel(xls, sheet_name=sheet_name)
            
            # Limpiar nombres de columnas (opcional, pero recomendado)
            # Elimina espacios en blanco al inicio/final y reemplaza espacios por guiones bajos
            df.columns = df.columns.str.strip().str.replace(' ', '_')
            
            # Convertir el DataFrame a formato JSON (orient='records' crea una lista de objetos)
            json_data = df.to_json(orient='records', indent=4, force_ascii=False)
            
            # Crear el nombre del archivo JSON de salida
            # Por ejemplo, la hoja "Mis Datos" se convertirá en "Mis_Datos.json"
            output_file_name = f"{sheet_name.replace(' ', '_')}.json"
            output_file_path = os.path.join(output_folder_path, output_file_name)
            
            # Guardar los datos JSON en el archivo
            with open(output_file_path, 'w', encoding='utf-8') as f:
                f.write(json_data)
                
            print(f"-> ¡Éxito! Hoja '{sheet_name}' guardada como '{output_file_path}'")
            
        print("\n¡Proceso completado! Todos los archivos JSON han sido generados.")
        
    except FileNotFoundError:
        print(f"Error: No se pudo encontrar el archivo Excel en la ruta: '{excel_file_path}'")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")

if __name__ == "__main__":
    convert_excel_to_json()
