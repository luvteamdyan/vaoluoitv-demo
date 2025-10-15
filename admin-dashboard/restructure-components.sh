#!/bin/bash

# Script to restructure components directory
echo "🚀 Restructuring components directory..."

# Create new directory structure
echo "📁 Creating new directory structure..."
mkdir -p src/components/common
mkdir -p src/components/media
mkdir -p src/components/match
mkdir -p src/components/stream-key
mkdir -p src/components/upload
mkdir -p src/components/user
mkdir -p src/components/dashboard/cards
mkdir -p src/components/dashboard/charts
mkdir -p src/components/dashboard/tables

# Move common components
echo "📦 Moving common components..."
mv src/components/ErrorBoundary.tsx src/components/common/
mv src/components/ErrorToast.tsx src/components/common/
mv src/components/ProtectedRoute.tsx src/components/common/
mv src/components/Sidebar.tsx src/components/common/
mv src/components/ThemeToggle.tsx src/components/common/

# Move media components
echo "📦 Moving media components..."
mv src/components/ImageSelector.tsx src/components/media/
mv src/components/ImageWithFallback.tsx src/components/media/
mv src/components/MediaGallery.tsx src/components/media/

# Move match components
echo "📦 Moving match components..."
mv src/components/MatchFilters.tsx src/components/match/
mv src/components/MatchForm.tsx src/components/match/
mv src/components/MatchFormImproved.tsx src/components/match/
mv src/components/MatchSearchSelector.tsx src/components/match/
mv src/components/MatchStats.tsx src/components/match/
mv src/components/MatchTable.tsx src/components/match/
mv src/components/MatchTableImproved.tsx src/components/match/

# Move stream-key components
echo "📦 Moving stream-key components..."
mv src/components/StreamKeyEditForm.tsx src/components/stream-key/
mv src/components/StreamKeyFiltersImproved.tsx src/components/stream-key/
mv src/components/StreamKeyFormImproved.tsx src/components/stream-key/
mv src/components/StreamKeyScheduleManager.tsx src/components/stream-key/
mv src/components/StreamKeyStats.tsx src/components/stream-key/
mv src/components/StreamKeyTableClean.tsx src/components/stream-key/

# Move upload components
echo "📦 Moving upload components..."
mv src/components/UploadFilters.tsx src/components/upload/
mv src/components/UploadForm.tsx src/components/upload/
mv src/components/UploadStats.tsx src/components/upload/
mv src/components/UploadTable.tsx src/components/upload/

# Move user components
echo "📦 Moving user components..."
mv src/components/UserFilters.tsx src/components/user/
mv src/components/UserForm.tsx src/components/user/
mv src/components/UserStats.tsx src/components/user/
mv src/components/UserTable.tsx src/components/user/

# Move dashboard components
echo "📦 Moving dashboard components..."
mv src/components/cards/* src/components/dashboard/cards/ 2>/dev/null
mv src/components/charts/* src/components/dashboard/charts/ 2>/dev/null
mv src/components/tables/* src/components/dashboard/tables/ 2>/dev/null

# Remove old empty directories
echo "🧹 Cleaning up..."
rmdir src/components/cards 2>/dev/null
rmdir src/components/charts 2>/dev/null
rmdir src/components/tables 2>/dev/null

# Remove example file if exists
rm src/components/ExampleUsage.tsx 2>/dev/null

echo "✅ Directory restructure complete!"
echo ""
echo "⚠️  NEXT STEP: Run the update-imports script to fix all import paths"

