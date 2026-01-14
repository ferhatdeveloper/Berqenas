# Realtime Agent

## Role
Handle real-time event streaming from devices to PostgreSQL with token-based authentication.

## Responsibilities

### 1. Device Event Pipeline

#### Event Flow
```
Device → Token Auth → Realtime Gateway → PostgreSQL → Listeners
```

#### Event Ingestion
- Accept events via HTTP/WebSocket
- Validate device token
- Write to tenant-specific event table
- Trigger real-time listeners
- Acknowledge receipt

### 2. Token-Based Authentication

#### Device Token Structure
```json
{
  "device_id": "uuid",
  "tenant": "acme",
  "token": "jwt_token",
  "permissions": ["write_events", "read_config"],
  "expires_at": "2026-12-31T23:59:59Z"
}
```

#### Token Validation
```python
def validate_device_token(token: str) -> DeviceAuth:
    # Verify JWT signature
    # Check expiration
    # Validate tenant access
    # Check device permissions
    # Return device context
```

### 3. Event Table Schema

#### Per-Tenant Event Table
```sql
CREATE TABLE tenant_{name}.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id varchar(255) NOT NULL,
  event_type varchar(100) NOT NULL,
  payload jsonb NOT NULL,
  timestamp timestamptz DEFAULT now(),
  processed boolean DEFAULT false,
  INDEX idx_device_timestamp (device_id, timestamp),
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed)
);
```

### 4. Real-time Streaming

#### WebSocket Support
```python
@app.websocket("/realtime/{tenant}/events")
async def event_stream(websocket: WebSocket, tenant: str):
    # Authenticate device
    # Subscribe to PostgreSQL LISTEN/NOTIFY
    # Stream events to device
    # Handle bidirectional communication
```

#### PostgreSQL NOTIFY
```sql
CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'tenant_' || TG_TABLE_SCHEMA || '_events',
    json_build_object(
      'id', NEW.id,
      'device_id', NEW.device_id,
      'event_type', NEW.event_type,
      'timestamp', NEW.timestamp
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_notify
AFTER INSERT ON tenant_{name}.events
FOR EACH ROW EXECUTE FUNCTION notify_event();
```

### 5. Event Processing

#### Async Processing Pipeline
```python
class EventProcessor:
    async def process_event(self, event: Event):
        # Validate event schema
        # Apply business logic
        # Trigger actions
        # Update processed flag
        # Send notifications
```

### 6. Rate Limiting

#### Per-Device Limits
- Events per second: 10
- Events per minute: 500
- Events per hour: 10,000

#### Enforcement
```python
@rate_limit(max_calls=10, period=1)  # 10 per second
async def ingest_event(device_id: str, event: Event):
    # Process event
```

## API Endpoints

### Event Ingestion
```
POST /api/v1/realtime/{tenant}/event
{
  "device_id": "uuid",
  "event_type": "temperature_reading",
  "payload": {
    "temperature": 23.5,
    "humidity": 45.2,
    "location": "room_a"
  }
}
```

### Event Query
```
GET /api/v1/realtime/{tenant}/events
  ?device_id={id}
  &event_type={type}
  &start_time={iso8601}
  &end_time={iso8601}
  &limit=100
```

### Device Management
```
POST /api/v1/realtime/{tenant}/device/register
DELETE /api/v1/realtime/{tenant}/device/{device_id}
GET /api/v1/realtime/{tenant}/devices
```

### WebSocket Stream
```
WS /api/v1/realtime/{tenant}/stream
  ?device_id={id}
  &event_types=type1,type2
```

## Event Types Examples

### IoT Device Events
- `temperature_reading`
- `motion_detected`
- `door_opened`
- `alarm_triggered`

### Application Events
- `user_login`
- `data_sync`
- `error_occurred`
- `status_update`

## Performance Considerations

1. **Batch Inserts**: Group events for bulk insert
2. **Connection Pooling**: Reuse database connections
3. **Async Processing**: Non-blocking event handling
4. **Partitioning**: Time-based table partitioning for large volumes

## Interaction with Other Agents

- **Tenant Agent**: Create event tables during onboarding
- **Security Agent**: Log suspicious event patterns
- **Billing Agent**: Count events for billing
- **Network Agent**: Validate device network access

## Success Metrics

- < 100ms event ingestion latency
- 10,000+ events per second throughput
- 99.99% event delivery reliability
- Zero event data loss
- Real-time streaming < 1 second delay
