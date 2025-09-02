import subprocess
from pathlib import Path

SRC_DIR = Path('data/informes_mensuales')
OUT_DIR = Path('data/cleaned_all_v2')
OUT_DIR.mkdir(parents=True, exist_ok=True)

files = list(SRC_DIR.glob('*.xlsx'))
if not files:
    print('No files in', SRC_DIR)
    raise SystemExit(0)

for f in files:
    out = OUT_DIR / f.name
    cmd = [
        'python', 'scripts/remove_blank_columns.py', '--apply', '--output-dir', str(OUT_DIR), str(f)
    ]
    print('Running:', ' '.join(cmd))
    subprocess.run(cmd, check=True)

print('Done. Cleaned files in', OUT_DIR)
print('Now run: python scripts/fix_headers_in_dir.py data/cleaned_all_v2')
