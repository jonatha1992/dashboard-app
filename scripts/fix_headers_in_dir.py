import sys
import pandas as pd
from pathlib import Path

TARGET_SHEETS = ['ABATIDOS', 'FALLECIDOS']

def norm_col(c):
    if c is None:
        return c
    s = str(c).strip()
    if not s:
        return s
    up = s.upper()
    if 'FUERZA' in up:
        return 'FUERZA_INTERVINIENTE'
    return s


def process_file(path: Path):
    x = pd.read_excel(path, sheet_name=None, engine='openpyxl', header=None)
    changed = False
    for sheet in TARGET_SHEETS:
        if sheet not in x:
            continue
        df = x[sheet]
        if df.shape[0] < 1:
            continue
        first_row = df.iloc[0].astype(str).str.strip().tolist()
        header_tokens = ['SERVICIO', 'FUERZA', 'ID_OPERATIVO', 'ID_PROCEDIMIENTO']
        matches = sum(1 for cell in first_row if any(tok in cell.upper() for tok in header_tokens))
        if matches >= 2:
            new_cols = [norm_col(c) if str(c).strip() != '' else '' for c in df.iloc[0].tolist()]
            df = df.copy()
            df.columns = new_cols
            df = df.drop(df.index[0]).reset_index(drop=True)
            final_cols = []
            for i, col in enumerate(df.columns.tolist()):
                if col is None or str(col).strip() == '':
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
            print(f' Promoted header for {path.name} -> {sheet}: {df.columns.tolist()}')
    if changed:
        # write back
        with pd.ExcelWriter(path, engine='openpyxl') as w:
            for sname, sdf in x.items():
                sdf.to_excel(w, sheet_name=sname, index=False)
        print(' Saved', path)
    return changed


if __name__ == '__main__':
    d = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('data/cleaned_all_v2')
    if not d.exists():
        print('Directory not found:', d)
        sys.exit(1)
    files = list(d.glob('*.xlsx'))
    if not files:
        print('No xlsx files in', d)
        sys.exit(0)
    for f in files:
        try:
            process_file(f)
        except Exception as e:
            print('Error processing', f, e)
