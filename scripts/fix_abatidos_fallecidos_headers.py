import pandas as pd
from pathlib import Path

OUT_DIR = Path('data/cleaned_all')
FILES = [OUT_DIR / 'INFORME ENERO 2025.xlsx', OUT_DIR / 'INFORME FEBRERO 2025.xlsx']
TARGET_SHEETS = ['ABATIDOS', 'FALLECIDOS']

def norm_col(c):
    if c is None:
        return c
    s = str(c).strip()
    if not s:
        return s
    # normalize common variants
    up = s.upper()
    if 'FUERZA' in up:
        return 'FUERZA_INTERVINIENTE'
    # remove extra spaces and keep original case-ish
    return s

for f in FILES:
    if not f.exists():
        print('Missing', f)
        continue
    print('Processing', f)
    # read all sheets
    x = pd.read_excel(f, sheet_name=None, engine='openpyxl')
    changed = False
    for sheet in TARGET_SHEETS:
        if sheet not in x:
            print(' Sheet missing:', sheet)
            continue
        df = x[sheet]
        if df.shape[0] < 1:
            print('  Sheet empty:', sheet)
            continue
        # check if first row looks like header (contains 'SERVICIO' or 'FUERZA' or similar)
        first_row = df.iloc[0].astype(str).str.strip().tolist()
        # if many entries are non-empty and some match known header tokens, promote
        header_tokens = ['SERVICIO', 'FUERZA', 'ID_OPERATIVO', 'ID_PROCEDIMIENTO']
        matches = sum(1 for cell in first_row if any(tok in cell.upper() for tok in header_tokens))
        if matches >= 2:
            # promote
            new_cols = [norm_col(c) if str(c).strip() != '' else '' for c in df.iloc[0].tolist()]
            df = df.copy()
            df.columns = new_cols
            df = df.drop(df.index[0]).reset_index(drop=True)
            # if there are still empty column names, fill from existing names or generate
            final_cols = []
            for i, col in enumerate(df.columns.tolist()):
                if col is None or str(col).strip() == '':
                    # try look into next non-empty cell in column to guess name
                    guess = None
                    for v in df.iloc[:3, i].astype(str):
                        if v and v.upper() not in ['NAN', 'NONE', '']:
                            guess = v
                            break
                    final_cols.append(guess if guess is not None else f'COL_{i}')
                else:
                    final_cols.append(col)
            df.columns = final_cols
            x[sheet] = df
            changed = True
            print('  Promoted header for', sheet, '->', df.columns.tolist())
        else:
            print('  No promotion needed for', sheet)
    if changed:
        # write back preserving other sheets
        with pd.ExcelWriter(f, engine='openpyxl') as w:
            for sname, sdf in x.items():
                sdf.to_excel(w, sheet_name=sname, index=False)
        print(' Saved', f)
    else:
        print(' No changes for', f)
