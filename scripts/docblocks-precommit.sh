#!/usr/bin/env bash
#
# Pre-push hook: invoke Cursor agent to add missing docblocks
# to files changed since the remote tracking branch.
#

set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"

PATTERNS=(
  "packages/core/src/blueprints/*.ts"
  "packages/core/src/features/**/make*.ts"
  "packages/core/src/components/*/types.ts"
)

remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
if [[ -z "$remote_branch" ]]; then
  base="HEAD~1"
else
  base="$remote_branch"
fi

matched_files=()

for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r file; do
    [[ -n "$file" ]] && matched_files+=("$file")
  done < <(git diff --name-only --diff-filter=ACM "$base"..HEAD -- "$pattern" 2>/dev/null)
done

if [[ ${#matched_files[@]} -eq 0 ]]; then
  exit 0
fi

file_list=$(printf '%s\n' "${matched_files[@]}")

echo "Checking docblocks in ${#matched_files[@]} file(s) before push..."

if ! command -v agent &>/dev/null; then
  echo "Cursor CLI (agent) not found — skipping docblock check."
  echo "Install with: curl https://cursor.com/install -fsSL | bash"
  exit 0
fi

prompt="Review the following files and add any missing TSDoc docblocks according to the project docblock conventions in .cursor/rules/docblocks.mdc.

Rules:
- In types.ts and blueprints: every interface property needs a docblock on the line before it. Empty interfaces that extend others need an interface-level docblock.
- In factories: every export function needs a docblock, and every const/function whose identifier appears in the return block needs one too.
- Format: single-line TSDoc comment, short description in 1-2 sentences, no @param or @returns tags.
- Only add missing docblocks. Do not modify existing ones unless the property was clearly renamed or changed in meaning.
- Do not change any code, only add or update docblock comments.

Files to review:
${file_list}"

if ! agent -p --force --trust "$prompt" >/dev/null 2>&1; then
  echo "Cursor agent exited with an error — continuing push anyway."
  exit 0
fi

if git diff --quiet -- "${matched_files[@]}"; then
  echo "No docblock changes needed."
  exit 0
fi

git add "${matched_files[@]}"
git commit -m "chore: add missing docblocks"

current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Docblocks added and committed. Pushing with --no-verify..."
git push --no-verify origin "$current_branch"
echo "Push successful (ignore the hook error below — it is expected)."
exit 1
