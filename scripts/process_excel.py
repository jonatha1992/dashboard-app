import json
from pathlib import Path
import pandas as pd
from typing import Dict, List

# Rutas base
INFORMES_DIR = Path(r"c:\Users\DICA\Desktop\Repositorio\dashboard-app\data\informes_mensuales")
OUTPUT_DIR = Path(r"c:\Users\DICA\Desktop\Repositorio\dashboard-app\data\json")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def list_excels_and_sheets(folder: Path) -> Dict[str, List[str]]:
    files = sorted(folder.glob('*.xlsx'))
    result = {}
    for p in files:
        try:
            xls = pd.ExcelFile(p)
            result[p.name] = xls.sheet_names
        except Exception as e:
            result[p.name] = f'ERROR: {e}'
    return result

def merge_excels_by_sheet(folder: Path) -> Dict[str, pd.DataFrame]:
    files = sorted(folder.glob('*.xlsx'))
    sheet_names = set()
    excel_objs = {}
    for p in files:
        try:
            xls = pd.ExcelFile(p)
            excel_objs[p] = xls
            sheet_names.update(xls.sheet_names)
        except Exception as e:
            print(f'WARNING: no se pudo leer {p.name}: {e}')
    
    sheet_names = sorted(sheet_names)
    merged = {}
    for sheet in sheet_names:
        frames = []
        for p, xls in excel_objs.items():
            if sheet in xls.sheet_names:
                try:
                    df = pd.read_excel(xls, sheet_name=sheet)
                    df['source_file'] = p.name
                    frames.append(df)
                except Exception as e:
                    print(f'ERROR leyendo {p.name} -> sheet {sheet}: {e}')
        if frames:
            merged_df = pd.concat(frames, ignore_index=True, sort=False)
            merged[sheet] = merged_df
        else:
            merged[sheet] = pd.DataFrame()
    return merged

if __name__ == "__main__":
    # 1. Listar archivos y hojas
    print("=== PASO 1: Listando archivos y hojas ===")
    sheets = list_excels_and_sheets(INFORMES_DIR)
    from pprint import pprint
    pprint(sheets)

    # 2. Merge por hoja
    print("\n=== PASO 2: Haciendo merge por hoja ===")
    merged = merge_excels_by_sheet(INFORMES_DIR)
    for sheet, df in merged.items():
        print(f"Sheet: '{sheet}' -> rows: {len(df)} columns: {list(df.columns)[:10]}")
        if len(df) > 0:
            print("Primeras 2 filas:")
            print(df.head(2))
            print()

    # 3. Exportar a JSON (versión final con manejo especial de fechas y valores nulos)
    print("\n=== PASO 3: Exportando a JSON ===")
    summary = {}
    
    class CustomJSONEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, pd.Timestamp):
                return obj.strftime('%Y-%m-%d %H:%M:%S')
            if pd.isna(obj):
                return None
            try:
                return json.JSONEncoder.default(self, obj)
            except:
                return str(obj)
    
    for sheet, df in merged.items():
        safe_name = sheet.replace('/', '_').replace('\\', '_')
        out_file = OUTPUT_DIR / f'{safe_name}.json'
        
        # Convert DataFrame to records with custom handling
        records = df.where(pd.notna(df), None).to_dict(orient='records')
        
        # Write to file using custom encoder
        with out_file.open('w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2, cls=CustomJSONEncoder)
        summary[sheet] = {'rows': len(df), 'file': str(out_file)}

    # Combined version
    combined = {sheet: merged[sheet].where(pd.notna(merged[sheet]), None).to_dict(orient='records') 
               for sheet in merged}
    
    combined_file = OUTPUT_DIR / 'merged_all_sheets.json'
    with combined_file.open('w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2, cls=CustomJSONEncoder)

    print('\nArchivos JSON generados:')
    pprint(summary)
    print(f'\nArchivo combinado: {combined_file}')