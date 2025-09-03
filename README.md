# Fitness Tracker API

## Endpoints

### Create Activity
POST /api/log-activity
Body: { "userId": "u1", "type": "run", "durationMinutes": 30 }

### Get Activities
GET /api/activities/{userId}

### Update Activity
PUT /api/activities/{activityId}
Body: { "userId": "u1", "type": "cycle", "durationMinutes": 60 }

### Delete Activity
DELETE /api/activities/{activityId}

### Weekly Summary
GET /api/activities/summary/{userId}
