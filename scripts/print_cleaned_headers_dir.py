import sys
import pandas as pd
from pathlib import Path

if len(sys.argv) > 1:
    d = Path(sys.argv[1])
else:
    d = Path('data/cleaned_all_v2')

if not d.exists():
    print('Directory not found:', d)
    sys.exit(1)

files = list(d.glob('*.xlsx'))
if not files:
    print('No xlsx files in', d)
    sys.exit(0)

TARGET_SHEETS = ['ABATIDOS', 'FALLECIDOS']
for f in files:
    print('\nFile:', f)
    try:
        x = pd.read_excel(f, sheet_name=None, engine='openpyxl')
    except Exception as e:
        print(' Error reading', f, e)
        continue
    for sheet in TARGET_SHEETS:
        if sheet not in x:
            print(' Sheet missing:', sheet)
            continue
        df = x[sheet]
        print(' Sheet:', sheet)
        print('  Columns:', list(df.columns))
        if not df.empty:
            print('  First row sample:', df.head(1).to_dict(orient='records')[0])
