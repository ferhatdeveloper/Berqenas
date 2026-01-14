-- Berqenas Realtime Events Table
-- This script creates the events table for realtime device data

-- Create events table in tenant schema
CREATE TABLE IF NOT EXISTS tenant_:tenant_name.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_device_timestamp 
  ON tenant_:tenant_name.events (device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_events_type 
  ON tenant_:tenant_name.events (event_type);

CREATE INDEX IF NOT EXISTS idx_events_processed 
  ON tenant_:tenant_name.events (processed) 
  WHERE processed = false;

CREATE INDEX IF NOT EXISTS idx_events_timestamp 
  ON tenant_:tenant_name.events (timestamp DESC);

-- Create NOTIFY trigger function
CREATE OR REPLACE FUNCTION tenant_:tenant_name.notify_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'tenant_:tenant_name_events',
    json_build_object(
      'id', NEW.id,
      'device_id', NEW.device_id,
      'event_type', NEW.event_type,
      'timestamp', NEW.timestamp,
      'payload', NEW.payload
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real-time notifications
CREATE TRIGGER event_notify
AFTER INSERT ON tenant_:tenant_name.events
FOR EACH ROW EXECUTE FUNCTION tenant_:tenant_name.notify_event();

-- Create function to mark event as processed
CREATE OR REPLACE FUNCTION tenant_:tenant_name.mark_event_processed(
  event_id UUID,
  success BOOLEAN,
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE tenant_:tenant_name.events
  SET 
    processed = success,
    processed_at = NOW(),
    error_message = error_msg,
    retry_count = CASE WHEN success THEN 0 ELSE retry_count + 1 END
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get unprocessed events
CREATE OR REPLACE FUNCTION tenant_:tenant_name.get_unprocessed_events(
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  device_id VARCHAR,
  event_type VARCHAR,
  payload JSONB,
  timestamp TIMESTAMPTZ,
  retry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.device_id,
    e.event_type,
    e.payload,
    e.timestamp,
    e.retry_count
  FROM tenant_:tenant_name.events e
  WHERE e.processed = false
    AND e.retry_count < 3
  ORDER BY e.timestamp ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create table partitioning for large event volumes (optional)
-- Partition by month for better performance
CREATE TABLE IF NOT EXISTS tenant_:tenant_name.events_y2026m01 
  PARTITION OF tenant_:tenant_name.events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Grant permissions to tenant role
GRANT SELECT, INSERT, UPDATE ON tenant_:tenant_name.events 
  TO tenant_:tenant_name_user;

GRANT EXECUTE ON FUNCTION tenant_:tenant_name.mark_event_processed(UUID, BOOLEAN, TEXT)
  TO tenant_:tenant_name_user;

GRANT EXECUTE ON FUNCTION tenant_:tenant_name.get_unprocessed_events(INTEGER)
  TO tenant_:tenant_name_user;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Events table created for tenant: %', ':tenant_name';
  RAISE NOTICE 'Real-time notifications enabled on channel: tenant_%_events', ':tenant_name';
END $$;
