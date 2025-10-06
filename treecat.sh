#!/bin/bash
# usage: ./cat_recursive.sh /path/to/dir [exclude1 exclude2 ...]

TARGET_DIR="$1"
shift
EXCLUDES=("$@")

if [ -z "$TARGET_DIR" ]; then
  echo "Usage: $0 <directory> [exclude1 exclude2 ...]"
  exit 1
fi

# 除外条件をfind用に組み立てる
EXCLUDE_EXPR=""
for ex in "${EXCLUDES[@]}"; do
  EXCLUDE_EXPR="$EXCLUDE_EXPR -path \"$TARGET_DIR/$ex\" -prune -o"
done

# findにevalで渡す
eval find "\"$TARGET_DIR\"" $EXCLUDE_EXPR -type f -print | while read -r file; do
  echo "===== $file ====="
  cat "$file"
  echo -e "\n"
done