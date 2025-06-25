# Event Creation Form - Backend API Integration

## ✅ Payload Structure Matched to Backend

The frontend now generates the exact payload structure expected by the backend API:

```json
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring latest trends in AI, blockchain, and web development. Join industry experts for keynote speeches, workshops, and networking opportunities.", 
  "location": "Jakarta Convention Center, Jl. Gatot Subroto, Jakarta",
  "startDate": "2025-07-15T09:00:00.000Z",
  "endDate": "2025-07-15T17:00:00.000Z", 
  "capacity": 100,
  "tags": ["technology", "conference", "networking"],
  "visibility": true,
  "requireApproval": false,
  "imageUrl": "https://via.placeholder.com/400x400"
}
```

## 🔧 Required Field Validation

### Required Fields:
1. **name** - Event name (required)
2. **description** - Event description (required) 
3. **location** - Event location (required)

### Validation Features:
- ✅ Real-time validation with visual indicators
- ✅ Required field markers with asterisks (*)
- ✅ Error messages for missing fields
- ✅ Date/time validation (end must be after start)
- ✅ Comprehensive error reporting

### UI Indicators:
- **Event Name**: Shows "Event name is required" message if empty
- **Description**: Shows "Add Description *" and "Description is required" if empty
- **Location**: Shows "Add Event Location *" and "Location is required" if empty
- **Form Button**: Disabled until all required fields are filled

## 📋 Validation Logic

```typescript
const getValidationErrors = () => {
  const errors = [];
  if (!eventName.trim()) errors.push("Event name");
  if (!description.trim()) errors.push("Description");
  if (!location.trim()) errors.push("Location");
  
  if (startDate >= endDate) {
    if (startDate.toDateString() === endDate.toDateString()) {
      const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endTimeMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      if (startTimeMinutes >= endTimeMinutes) {
        errors.push("End time must be after start time");
      }
    } else {
      errors.push("End date must be after start date");
    }
  }
  
  return errors;
};
```

## 🎯 Data Transformations

### Location Handling:
- **Offline events**: Combines venue name + address + city into single string
- **Virtual events**: Combines platform + meeting link

### Date/Time:
- Converts separate date and time inputs to ISO string format
- Timezone-aware date creation
- Proper UTC formatting for backend

### Capacity:
- Converts "unlimited" to `null`
- Converts numeric limit to integer

### Visibility:
- Converts "public"/"private" string to boolean
- `true` for public, `false` for private

### Tags:
- Filters out empty tags
- Maintains array structure

## 📝 Error Messages

The form now shows detailed validation errors:

```
"Please fill in the following required fields:
• Event name
• Description  
• Location
• End time must be after start time"
```

## 🚀 Ready for Backend Integration

The form is now fully ready to integrate with your backend API. Simply replace the console.log in `handleCreateEvent` with your actual API call:

```typescript
try {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventPayload)
  });
  
  if (response.ok) {
    alert("Event created successfully!");
  } else {
    alert("Failed to create event. Please try again.");
  }
} catch (error) {
  alert("Network error. Please check your connection and try again.");
}
```

All payload fields match your backend schema exactly!
