# Match Date & Time Sorting Implementation

## Tổng quan

Với `match_date` và `match_time` đều là string format, việc sort theo thứ tự thời gian cần được implement đúng cách để đảm bảo kết quả chính xác.

## Format dữ liệu

- **match_date**: `"DD/MM/YYYY"` (ví dụ: `"13/10/2025"`)
- **match_time**: `"HH:MM"` (ví dụ: `"15:30"`)

## Vấn đề với string sorting

Sorting trực tiếp theo string sẽ không đúng thứ tự thời gian:

```javascript
// String sorting (SAI)
["01/01/2025", "31/12/2024", "15/06/2025"].sort()
// Kết quả: ["01/01/2025", "15/06/2025", "31/12/2024"]
// Thực tế: "31/12/2024" phải đứng trước "01/01/2025"

// Time sorting (SAI)  
["09:00", "14:30", "02:15"].sort()
// Kết quả: ["02:15", "09:00", "14:30"] (đúng nhưng chỉ là coincidence)
```

## Giải pháp: Computed DateTime Sorting

### Backend Implementation (`api_gateway/src/matches/matches.service.ts`)

Sử dụng MongoDB aggregation để tạo computed field `match_datetime_sort`:

```javascript
{
  $addFields: {
    match_datetime_sort: {
      $dateFromString: {
        dateString: {
          $concat: [
            // Extract year from match_date (DD/MM/YYYY -> YYYY)
            { $arrayElemAt: [{ $split: ['$match_date', '/'] }, 2] },
            '-',
            // Extract month from match_date (DD/MM/YYYY -> MM)
            { $arrayElemAt: [{ $split: ['$match_date', '/'] }, 1] },
            '-',
            // Extract day from match_date (DD/MM/YYYY -> DD)
            { $arrayElemAt: [{ $split: ['$match_date', '/'] }, 0] },
            'T',
            '$match_time',
            ':00.000Z'
          ]
        },
        onError: new Date('1970-01-01T00:00:00.000Z') // Fallback for invalid dates
      }
    }
  }
}
```

### Sort Logic

```javascript
{
  $sort: {
    has_commentator_priority: -1, // Trận có bình luận viên trước
    status_priority: -1, // Sau đó sort theo status priority
    // Use computed datetime for proper chronological sorting
    ...(sortField === 'match_date' || sortField === 'match_time' 
      ? { match_datetime_sort: sortDirection }
      : { [sortField]: sortDirection }
    ),
  }
}
```

### Helper Functions

```typescript
/**
 * Parse DD/MM/YYYY string to Date for comparison
 */
private parseMatchDate(matchDateString: string): Date {
  const [day, month, year] = matchDateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Create sortable datetime from match_date and match_time strings
 */
private createSortableDateTime(matchDate: string, matchTime: string): Date {
  try {
    const [day, month, year] = matchDate.split('/').map(Number);
    const [hours, minutes] = matchTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0);
  } catch (error) {
    console.warn('Invalid date/time format:', { matchDate, matchTime });
    return new Date('1970-01-01T00:00:00.000Z');
  }
}
```

## Frontend Implementation

### Field Mapping

```typescript
const getBackendFieldName = (uiField: string): string => {
  const fieldMap: { [key: string]: string } = {
    'match_teams': 'home_team.name',
    'league': 'league.name',
    'match_date': 'match_date', // Will use computed datetime sorting
    'match_time': 'match_time', // Will use computed datetime sorting
    'status': 'status',
    'commentator': 'stream_key_id.user.username',
  };
  return fieldMap[uiField] || uiField;
};
```

## Sort Priority

1. **has_commentator_priority**: Trận có bình luận viên trước
2. **status_priority**: 
   - LIVE (4) - cao nhất
   - SCHEDULED (3)
   - NOT_STARTED (2)
   - FINISHED (1) - thấp nhất
3. **match_datetime_sort**: Thứ tự thời gian thực tế

## Ví dụ kết quả

Với các trận đấu:
- Trận A: `13/10/2025 15:30` (có bình luận viên, LIVE)
- Trận B: `13/10/2025 14:00` (không có bình luận viên, SCHEDULED)
- Trận C: `14/10/2025 10:00` (có bình luận viên, SCHEDULED)

**Kết quả sort (asc):**
1. Trận A (có bình luận viên + LIVE + thời gian sớm hơn)
2. Trận C (có bình luận viên + SCHEDULED + thời gian muộn hơn)
3. Trận B (không có bình luận viên + SCHEDULED)

## Lưu ý quan trọng

1. **Performance**: Computed field chỉ được tạo trong aggregation pipeline, không lưu vào database
2. **Fallback**: Invalid dates được xử lý với fallback date `1970-01-01T00:00:00.000Z`
3. **Index**: MongoDB indexes trên `match_date` vẫn hoạt động cho filtering, nhưng sorting cần computed field
4. **Cleanup**: Computed field được remove khỏi kết quả cuối cùng với `$unset`

## Testing

Để test sorting hoạt động đúng:

1. Tạo matches với các ngày khác nhau
2. Test sort asc/desc theo `match_date` và `match_time`
3. Verify kết quả theo thứ tự thời gian thực tế
4. Test với các edge cases (invalid dates, missing times)
