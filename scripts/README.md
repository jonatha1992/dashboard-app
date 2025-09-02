Scripts for cleaning Excel informes

1) `scripts/remove_blank_columns.py` - main cleaner. Supports dry-run and --apply. Usage examples:
   - Dry run: python scripts/remove_blank_columns.py "data/informes_mensuales/INFORME ENERO 2025.xlsx"
   - Apply: python scripts/remove_blank_columns.py --apply --output-dir data/cleaned_all "data/informes_mensuales/INFORME ENERO 2025.xlsx"

2) `scripts/fix_abatidos_fallecidos_headers.py` - targeted fixer for ABATIDOS and FALLECIDOS. Promotes first row to header and normalizes FUERZA column. Run after cleaning:
   python scripts/fix_abatidos_fallecidos_headers.py

3) `scripts/fix_headers_in_dir.py` - apply header-fix to all .xlsx files in a directory. Usage:
   python scripts/fix_headers_in_dir.py data/cleaned_all_v2

4) `scripts/make_cleaned_all_v2.py` - convenience script to run `remove_blank_columns.py --apply` on all files in `data/informes_mensuales` and write outputs to `data/cleaned_all_v2`.
   python scripts/make_cleaned_all_v2.py

5) `scripts/print_cleaned_headers.py` - helper to print columns for ABATIDOS and FALLECIDOS in cleaned files.

Notes:
- These scripts use pandas/openpyxl. Ensure they are installed in your python environment: `pip install pandas openpyxl`.
- `make_cleaned_all_v2.py` will call the existing cleaning script for every .xlsx in `data/informes_mensuales` and place cleaned copies into `data/cleaned_all_v2` (does not overwrite originals).
