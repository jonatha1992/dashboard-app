import pandas as pd
from pathlib import Path

OUT_DIR = Path('data/cleaned_all')
FILES = [OUT_DIR / 'INFORME ENERO 2025.xlsx', OUT_DIR / 'INFORME FEBRERO 2025.xlsx']
TARGET_SHEETS = ['ABATIDOS', 'FALLECIDOS']

for f in FILES:
    if not f.exists():
        print('Missing cleaned file', f)
        continue
    print('\nCleaned File:', f)
    x = pd.read_excel(f, sheet_name=None, engine='openpyxl')
    for sheet in TARGET_SHEETS:
        if sheet not in x:
            print(' Sheet missing:', sheet)
            continue
        df = x[sheet]
        print(' Sheet:', sheet)
        print('  Columns:', list(df.columns))
        # print first row as header preview if exists
        if not df.empty:
            print('  First row sample:', df.head(1).to_dict(orient='records')[0])
