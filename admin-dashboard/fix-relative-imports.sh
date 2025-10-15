#!/bin/bash

# Script to fix relative imports to use aliases
echo "🔧 Fixing relative imports to use @/ aliases..."

# Function to fix imports in a file
fix_imports() {
    local file=$1
    
    # Fix imports in src/app/ files
    # ../../components/ -> @/components/
    sed -i '' "s|from '../../components/|from '@/components/|g" "$file"
    sed -i '' "s|from \"../../components/|from \"@/components/|g" "$file"
    
    # Fix imports in components/ files
    # ../types/ -> @/types/
    sed -i '' "s|from '../types/|from '@/types/|g" "$file"
    sed -i '' "s|from \"../types/|from \"@/types/|g" "$file"
    
    # ../services/ -> @/services/
    sed -i '' "s|from '../services/|from '@/services/|g" "$file"
    sed -i '' "s|from \"../services/|from \"@/services/|g" "$file"
    
    # ./MatchSearchSelector -> @/components/match/MatchSearchSelector
    # (in stream-key components)
    if [[ $file == *"stream-key"* ]]; then
        sed -i '' "s|from './MatchSearchSelector'|from '@/components/match/MatchSearchSelector'|g" "$file"
        sed -i '' "s|from \"./MatchSearchSelector\"|from \"@/components/match/MatchSearchSelector\"|g" "$file"
    fi
    
    # Fix other component imports within same folder
    # ./ComponentName -> @/components/folder/ComponentName
    if [[ $file == *"/components/"* ]]; then
        local folder=$(echo "$file" | sed -E 's|.*/components/([^/]+)/.*|\1|')
        sed -i '' "s|from './ImageWithFallback'|from '@/components/media/ImageWithFallback'|g" "$file"
        sed -i '' "s|from \"./ImageWithFallback\"|from \"@/components/media/ImageWithFallback\"|g" "$file"
    fi
}

# Fix imports in all TypeScript/TSX files
echo "📝 Scanning and fixing files..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
    echo "  Fixing: $file"
    fix_imports "$file"
done

echo "✅ Relative imports fixed!"

