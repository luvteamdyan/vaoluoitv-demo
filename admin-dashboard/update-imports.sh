#!/bin/bash

# Script to update import paths after restructuring
echo "🔄 Updating import paths..."

# Function to update imports in a file
update_imports() {
    local file=$1
    
    # Common components
    sed -i '' "s|@/components/ErrorBoundary|@/components/common/ErrorBoundary|g" "$file"
    sed -i '' "s|@/components/ErrorToast|@/components/common/ErrorToast|g" "$file"
    sed -i '' "s|@/components/ProtectedRoute|@/components/common/ProtectedRoute|g" "$file"
    sed -i '' "s|@/components/Sidebar|@/components/common/Sidebar|g" "$file"
    sed -i '' "s|@/components/ThemeToggle|@/components/common/ThemeToggle|g" "$file"
    
    # Media components
    sed -i '' "s|@/components/ImageSelector|@/components/media/ImageSelector|g" "$file"
    sed -i '' "s|@/components/ImageWithFallback|@/components/media/ImageWithFallback|g" "$file"
    sed -i '' "s|@/components/MediaGallery|@/components/media/MediaGallery|g" "$file"
    
    # Match components
    sed -i '' "s|@/components/MatchFilters|@/components/match/MatchFilters|g" "$file"
    sed -i '' "s|@/components/MatchForm'|@/components/match/MatchForm'|g" "$file"
    sed -i '' "s|@/components/MatchFormImproved|@/components/match/MatchFormImproved|g" "$file"
    sed -i '' "s|@/components/MatchSearchSelector|@/components/match/MatchSearchSelector|g" "$file"
    sed -i '' "s|@/components/MatchStats|@/components/match/MatchStats|g" "$file"
    sed -i '' "s|@/components/MatchTable'|@/components/match/MatchTable'|g" "$file"
    sed -i '' "s|@/components/MatchTableImproved|@/components/match/MatchTableImproved|g" "$file"
    
    # Stream-key components
    sed -i '' "s|@/components/StreamKeyEditForm|@/components/stream-key/StreamKeyEditForm|g" "$file"
    sed -i '' "s|@/components/StreamKeyFiltersImproved|@/components/stream-key/StreamKeyFiltersImproved|g" "$file"
    sed -i '' "s|@/components/StreamKeyFormImproved|@/components/stream-key/StreamKeyFormImproved|g" "$file"
    sed -i '' "s|@/components/StreamKeyScheduleManager|@/components/stream-key/StreamKeyScheduleManager|g" "$file"
    sed -i '' "s|@/components/StreamKeyStats|@/components/stream-key/StreamKeyStats|g" "$file"
    sed -i '' "s|@/components/StreamKeyTableClean|@/components/stream-key/StreamKeyTableClean|g" "$file"
    
    # Upload components
    sed -i '' "s|@/components/UploadFilters|@/components/upload/UploadFilters|g" "$file"
    sed -i '' "s|@/components/UploadForm|@/components/upload/UploadForm|g" "$file"
    sed -i '' "s|@/components/UploadStats|@/components/upload/UploadStats|g" "$file"
    sed -i '' "s|@/components/UploadTable|@/components/upload/UploadTable|g" "$file"
    
    # User components
    sed -i '' "s|@/components/UserFilters|@/components/user/UserFilters|g" "$file"
    sed -i '' "s|@/components/UserForm|@/components/user/UserForm|g" "$file"
    sed -i '' "s|@/components/UserStats|@/components/user/UserStats|g" "$file"
    sed -i '' "s|@/components/UserTable|@/components/user/UserTable|g" "$file"
    
    # Dashboard cards
    sed -i '' "s|@/components/cards/|@/components/dashboard/cards/|g" "$file"
    
    # Dashboard charts
    sed -i '' "s|@/components/charts/|@/components/dashboard/charts/|g" "$file"
    
    # Dashboard tables
    sed -i '' "s|@/components/tables/|@/components/dashboard/tables/|g" "$file"
}

# Update imports in all TypeScript/TSX files
echo "📝 Scanning files..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
    echo "  Updating: $file"
    update_imports "$file"
done

echo "✅ Import paths updated!"
echo ""
echo "📋 SUMMARY:"
echo "   - Common: ErrorBoundary, ErrorToast, ProtectedRoute, Sidebar, ThemeToggle"
echo "   - Media: ImageSelector, ImageWithFallback, MediaGallery"
echo "   - Match: MatchFilters, MatchForm, MatchStats, MatchTable, etc."
echo "   - Stream-key: StreamKeyEditForm, StreamKeyStats, StreamKeyTable, etc."
echo "   - Upload: UploadFilters, UploadForm, UploadStats, UploadTable"
echo "   - User: UserFilters, UserForm, UserStats, UserTable"
echo "   - Dashboard: cards/, charts/, tables/"
echo ""
echo "🎉 All done! Please test your application."

