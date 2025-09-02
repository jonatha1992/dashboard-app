import pandas as pd
from pathlib import Path

FILES = [Path('data/informes_mensuales/INFORME ENERO 2025.xlsx'), Path('data/informes_mensuales/INFORME FEBRERO 2025.xlsx')]
for f in FILES:
    if not f.exists():
        print('Missing', f)
        continue
    print('\nFile:', f)
    x = pd.read_excel(f, sheet_name=None, engine='openpyxl', header=None)
    for sheet, df in x.items():
        print(' Sheet:', sheet)
        # print first 3 rows
        print(df.head(3))
