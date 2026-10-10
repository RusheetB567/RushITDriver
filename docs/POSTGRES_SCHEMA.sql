-- Proposed PostgreSQL production baseline. Not a migration applied by the local app.
-- Deploy with a separate owner/migration role and a non-owner application role.
BEGIN;
CREATE TABLE organisations(id uuid PRIMARY KEY, name text NOT NULL, timezone text NOT NULL);
CREATE TABLE branches(id uuid PRIMARY KEY, organisation_id uuid NOT NULL REFERENCES organisations,
 name text NOT NULL, UNIQUE(organisation_id,id));
CREATE TABLE depots(id uuid PRIMARY KEY, organisation_id uuid NOT NULL, branch_id uuid NOT NULL,
 name text NOT NULL, address jsonb NOT NULL, UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,branch_id) REFERENCES branches(organisation_id,id));
CREATE TABLE users(id uuid PRIMARY KEY, organisation_id uuid NOT NULL REFERENCES organisations,
 identity_subject text NOT NULL, name text NOT NULL, disabled boolean NOT NULL DEFAULT false,
 UNIQUE(organisation_id,id),UNIQUE(organisation_id,identity_subject));
CREATE TABLE role_grants(organisation_id uuid NOT NULL, user_id uuid NOT NULL, role text NOT NULL,
 branch_id uuid, PRIMARY KEY(organisation_id,user_id,role),
 FOREIGN KEY(organisation_id,user_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,branch_id) REFERENCES branches(organisation_id,id));
CREATE TABLE customers(id uuid PRIMARY KEY, organisation_id uuid NOT NULL REFERENCES organisations,
 name text NOT NULL, account_reference text NOT NULL, UNIQUE(organisation_id,id),UNIQUE(organisation_id,account_reference));
CREATE TABLE customer_memberships(organisation_id uuid NOT NULL,user_id uuid NOT NULL,customer_id uuid NOT NULL,
 PRIMARY KEY(organisation_id,user_id,customer_id),
 FOREIGN KEY(organisation_id,user_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,customer_id) REFERENCES customers(organisation_id,id));
CREATE TABLE customer_locations(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,customer_id uuid NOT NULL,
 address jsonb NOT NULL,contact jsonb,UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,customer_id) REFERENCES customers(organisation_id,id));
CREATE TABLE drivers(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,user_id uuid NOT NULL,branch_id uuid NOT NULL,
 skills jsonb NOT NULL DEFAULT '[]',UNIQUE(organisation_id,id),UNIQUE(organisation_id,user_id),
 FOREIGN KEY(organisation_id,user_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,branch_id) REFERENCES branches(organisation_id,id));
CREATE TABLE driver_devices(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,driver_id uuid NOT NULL,
 registration_hash text NOT NULL,platform text NOT NULL,last_seen_at timestamptz,revoked_at timestamptz,
 UNIQUE(organisation_id,id),FOREIGN KEY(organisation_id,driver_id) REFERENCES drivers(organisation_id,id));
CREATE TABLE vehicles(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,depot_id uuid NOT NULL,
 registration text NOT NULL,type text NOT NULL,capacity_kg numeric(12,3) NOT NULL CHECK(capacity_kg>=0),
 capacity_m3 numeric(12,3) NOT NULL CHECK(capacity_m3>=0),UNIQUE(organisation_id,id),UNIQUE(organisation_id,registration),
 FOREIGN KEY(organisation_id,depot_id) REFERENCES depots(organisation_id,id));
CREATE TABLE shifts(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,driver_id uuid NOT NULL,vehicle_id uuid NOT NULL,
 started_at timestamptz NOT NULL,finished_at timestamptz,UNIQUE(organisation_id,id),
 CHECK(finished_at IS NULL OR finished_at>=started_at),
 FOREIGN KEY(organisation_id,driver_id) REFERENCES drivers(organisation_id,id),
 FOREIGN KEY(organisation_id,vehicle_id) REFERENCES vehicles(organisation_id,id));
CREATE UNIQUE INDEX one_open_shift ON shifts(driver_id) WHERE finished_at IS NULL;
CREATE TABLE breaks(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,shift_id uuid NOT NULL,
 started_at timestamptz NOT NULL,ended_at timestamptz,reason text,
 FOREIGN KEY(organisation_id,shift_id) REFERENCES shifts(organisation_id,id));
CREATE TABLE pod_policies(id uuid PRIMARY KEY,organisation_id uuid NOT NULL REFERENCES organisations,
 policy_name text NOT NULL,version integer NOT NULL CHECK(version>0),requirements jsonb NOT NULL,
 UNIQUE(organisation_id,id),UNIQUE(organisation_id,policy_name,version));
CREATE TABLE jobs(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,branch_id uuid NOT NULL,customer_id uuid NOT NULL,
 job_number text NOT NULL,reference text NOT NULL,service text NOT NULL,priority text NOT NULL,
 status text NOT NULL,version integer NOT NULL DEFAULT 1,pod_policy_id uuid NOT NULL,created_at timestamptz NOT NULL,
 UNIQUE(organisation_id,id),UNIQUE(organisation_id,job_number),
 FOREIGN KEY(organisation_id,branch_id) REFERENCES branches(organisation_id,id),
 FOREIGN KEY(organisation_id,customer_id) REFERENCES customers(organisation_id,id),
 FOREIGN KEY(organisation_id,pod_policy_id) REFERENCES pod_policies(organisation_id,id));
CREATE TABLE job_legs(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,
 sequence integer NOT NULL CHECK(sequence>0),kind text NOT NULL,status text NOT NULL,
 location jsonb NOT NULL,contact jsonb,instructions text,window_start timestamptz,window_end timestamptz,
 UNIQUE(organisation_id,id),UNIQUE(organisation_id,job_id,id),UNIQUE(job_id,sequence),
 CHECK(window_start IS NULL OR window_end IS NULL OR window_end>=window_start),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id));
CREATE TABLE leg_dependencies(organisation_id uuid NOT NULL,job_id uuid NOT NULL,leg_id uuid NOT NULL,requires_leg_id uuid NOT NULL,
 PRIMARY KEY(organisation_id,leg_id,requires_leg_id),CHECK(leg_id<>requires_leg_id),
 FOREIGN KEY(organisation_id,job_id,leg_id) REFERENCES job_legs(organisation_id,job_id,id),
 FOREIGN KEY(organisation_id,job_id,requires_leg_id) REFERENCES job_legs(organisation_id,job_id,id));
-- Dependency cycles and cross-job transfer commands require domain validation.
CREATE TABLE consignments(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,
 package_type text NOT NULL,weight_kg numeric(12,3) NOT NULL CHECK(weight_kg>=0),
 volume_m3 numeric(12,3) NOT NULL CHECK(volume_m3>=0),handling jsonb NOT NULL DEFAULT '{}',
 UNIQUE(organisation_id,id),FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id));
CREATE TABLE packages(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,consignment_id uuid NOT NULL,
 external_reference text,outcome text NOT NULL,UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,consignment_id) REFERENCES consignments(organisation_id,id));
CREATE TABLE barcodes(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,package_id uuid NOT NULL,
 identifier text NOT NULL,symbology text,UNIQUE(organisation_id,identifier),
 FOREIGN KEY(organisation_id,package_id) REFERENCES packages(organisation_id,id));
CREATE TABLE assignments(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,
 driver_id uuid NOT NULL,version integer NOT NULL,assigned_at timestamptz NOT NULL,ended_at timestamptz,
 UNIQUE(organisation_id,id),FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,driver_id) REFERENCES drivers(organisation_id,id));
CREATE UNIQUE INDEX one_current_assignment ON assignments(job_id) WHERE ended_at IS NULL;
CREATE TABLE scans(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,leg_id uuid NOT NULL,package_id uuid,
 identifier text NOT NULL,result text NOT NULL,actor_id uuid NOT NULL,occurred_at timestamptz NOT NULL,
 FOREIGN KEY(organisation_id,leg_id) REFERENCES job_legs(organisation_id,id),
 FOREIGN KEY(organisation_id,package_id) REFERENCES packages(organisation_id,id),
 FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id));
CREATE TABLE delivery_attempts(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,leg_id uuid NOT NULL,
 outcome text NOT NULL,reason text,occurred_at timestamptz NOT NULL,UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,leg_id) REFERENCES job_legs(organisation_id,id));
CREATE TABLE evidence(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,owner_id uuid NOT NULL,
 category text NOT NULL,object_key text NOT NULL UNIQUE,mime_type text NOT NULL,byte_size bigint NOT NULL CHECK(byte_size>=0),
 sha256 text NOT NULL,captured_at timestamptz NOT NULL,received_at timestamptz NOT NULL,
 coordinates jsonb,upload_status text NOT NULL,UNIQUE(organisation_id,id),UNIQUE(organisation_id,job_id,id),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,owner_id) REFERENCES users(organisation_id,id));
CREATE TABLE pods(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,leg_id uuid NOT NULL,
 attempt_id uuid NOT NULL,policy_id uuid NOT NULL,recipient_name text,notes text,accepted_at timestamptz,
 supersedes_id uuid,UNIQUE(organisation_id,id),UNIQUE(organisation_id,job_id,id),
 FOREIGN KEY(organisation_id,job_id,leg_id) REFERENCES job_legs(organisation_id,job_id,id),
 FOREIGN KEY(organisation_id,attempt_id) REFERENCES delivery_attempts(organisation_id,id),
 FOREIGN KEY(organisation_id,policy_id) REFERENCES pod_policies(organisation_id,id),
 FOREIGN KEY(organisation_id,supersedes_id) REFERENCES pods(organisation_id,id));
CREATE TABLE pod_evidence(organisation_id uuid NOT NULL,job_id uuid NOT NULL,pod_id uuid NOT NULL,evidence_id uuid NOT NULL,
 PRIMARY KEY(organisation_id,pod_id,evidence_id),
 FOREIGN KEY(organisation_id,job_id,pod_id) REFERENCES pods(organisation_id,job_id,id),
 FOREIGN KEY(organisation_id,job_id,evidence_id) REFERENCES evidence(organisation_id,job_id,id));
CREATE TABLE driver_locations(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,driver_id uuid NOT NULL,shift_id uuid NOT NULL,
 latitude double precision NOT NULL CHECK(latitude BETWEEN -90 AND 90),
 longitude double precision NOT NULL CHECK(longitude BETWEEN -180 AND 180),accuracy_m real NOT NULL CHECK(accuracy_m>=0),
 sampled_at timestamptz NOT NULL,received_at timestamptz NOT NULL,
 FOREIGN KEY(organisation_id,driver_id) REFERENCES drivers(organisation_id,id),
 FOREIGN KEY(organisation_id,shift_id) REFERENCES shifts(organisation_id,id));
CREATE TABLE messages(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,sender_id uuid NOT NULL,recipient_id uuid NOT NULL,
 job_id uuid,body text NOT NULL,created_at timestamptz NOT NULL,read_at timestamptz,
 FOREIGN KEY(organisation_id,sender_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,recipient_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id));
CREATE TABLE job_events(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,job_id uuid NOT NULL,actor_id uuid NOT NULL,
 client_event_id uuid NOT NULL,action text NOT NULL,previous_state text,new_state text,
 occurred_at timestamptz NOT NULL,received_at timestamptz NOT NULL,location jsonb,detail jsonb NOT NULL,
 UNIQUE(organisation_id,actor_id,client_event_id),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id));
CREATE TABLE audit_logs(id uuid PRIMARY KEY,organisation_id uuid NOT NULL,actor_id uuid NOT NULL,
 action text NOT NULL,resource_id uuid NOT NULL,change jsonb NOT NULL,created_at timestamptz NOT NULL,
 FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id));
CREATE TABLE outbox(id uuid PRIMARY KEY,organisation_id uuid NOT NULL REFERENCES organisations,
 topic text NOT NULL,resource_id uuid NOT NULL,created_at timestamptz NOT NULL,delivered_at timestamptz,attempts integer NOT NULL DEFAULT 0);
CREATE TABLE idempotency(organisation_id uuid NOT NULL,actor_id uuid NOT NULL,key uuid NOT NULL,
 request_hash text NOT NULL,response jsonb NOT NULL,created_at timestamptz NOT NULL,
 PRIMARY KEY(organisation_id,actor_id,key),FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id));
CREATE INDEX jobs_queue ON jobs(organisation_id,status,created_at);
CREATE INDEX assignments_driver ON assignments(organisation_id,driver_id,ended_at);
CREATE INDEX events_timeline ON job_events(organisation_id,job_id,received_at);
CREATE INDEX locations_recent ON driver_locations(organisation_id,driver_id,sampled_at DESC);
CREATE INDEX pending_outbox ON outbox(created_at) WHERE delivered_at IS NULL;
-- Apply tenant policies to every organisation-owned table. Do not apply to the global organisations catalogue.
DO $$ DECLARE table_name text; BEGIN
 FOR table_name IN SELECT c.table_name FROM information_schema.columns c
  WHERE c.table_schema='public' AND c.column_name='organisation_id'
 LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',table_name);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',table_name);
  EXECUTE format('CREATE POLICY tenant_scope ON %I USING (organisation_id = nullif(current_setting(''app.organisation_id'',true),'''')::uuid) WITH CHECK (organisation_id = nullif(current_setting(''app.organisation_id'',true),'''')::uuid)',table_name);
 END LOOP;
END $$;
-- Runtime uses SET LOCAL app.organisation_id inside every transaction. Missing context denies access.
-- Grant SELECT/INSERT only for event/audit tables to runtime, never UPDATE/DELETE.
-- Add retention migrations and controlled amendment procedures before production.
COMMIT;
