PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS organisations (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id),
 email TEXT NOT NULL COLLATE NOCASE UNIQUE, name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','dispatcher','driver')),
 password_hash TEXT NOT NULL, disabled INTEGER NOT NULL DEFAULT 0,
 UNIQUE(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 expires_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS customers (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id), name TEXT NOT NULL,
 UNIQUE(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS pod_policies (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id),
 name TEXT NOT NULL, version INTEGER NOT NULL, requirements TEXT NOT NULL,
 UNIQUE(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS jobs (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id),
 customer_id TEXT NOT NULL, reference TEXT NOT NULL, service TEXT NOT NULL,
 priority TEXT NOT NULL CHECK(priority IN ('Standard','Priority','Express','Urgent','Critical','Time Sensitive')),
 status TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, policy_id TEXT NOT NULL,
 created_at TEXT NOT NULL,
 UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,customer_id) REFERENCES customers(organisation_id,id),
 FOREIGN KEY(organisation_id,policy_id) REFERENCES pod_policies(organisation_id,id)
);
CREATE INDEX IF NOT EXISTS jobs_scope_status ON jobs(organisation_id,status,created_at);
CREATE TABLE IF NOT EXISTS job_legs (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL, sequence INTEGER NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('pickup','delivery')), company TEXT NOT NULL,
 address TEXT NOT NULL, suburb TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
 instructions TEXT NOT NULL DEFAULT '', window_start TEXT, window_end TEXT,
 UNIQUE(organisation_id,id), UNIQUE(job_id,sequence),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS consignments (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL,
 item_count INTEGER NOT NULL CHECK(item_count > 0), weight_kg REAL NOT NULL CHECK(weight_kg >= 0),
 volume_m3 REAL NOT NULL CHECK(volume_m3 >= 0), package_type TEXT NOT NULL,
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS assignments (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL,
 driver_id TEXT NOT NULL, active INTEGER NOT NULL CHECK(active IN (0,1)), created_at TEXT NOT NULL,
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,driver_id) REFERENCES users(organisation_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_assignment ON assignments(job_id) WHERE active=1;
CREATE INDEX IF NOT EXISTS assignments_driver ON assignments(organisation_id,driver_id,active);
CREATE TABLE IF NOT EXISTS shifts (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, driver_id TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('Available','Break','Finished')),
 started_at TEXT NOT NULL, finished_at TEXT,
 FOREIGN KEY(organisation_id,driver_id) REFERENCES users(organisation_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_shift ON shifts(driver_id) WHERE finished_at IS NULL;
CREATE TABLE IF NOT EXISTS job_events (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL, actor_id TEXT NOT NULL,
 action TEXT NOT NULL, previous_state TEXT, new_state TEXT, occurred_at TEXT NOT NULL,
 received_at TEXT NOT NULL, location_json TEXT, detail TEXT NOT NULL,
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id)
);
CREATE INDEX IF NOT EXISTS events_job ON job_events(organisation_id,job_id,received_at);
CREATE TRIGGER IF NOT EXISTS immutable_events_update BEFORE UPDATE ON job_events BEGIN SELECT RAISE(ABORT,'Events are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_events_delete BEFORE DELETE ON job_events BEGIN SELECT RAISE(ABORT,'Events are immutable'); END;
CREATE TABLE IF NOT EXISTS audit_log (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, actor_id TEXT NOT NULL,
 action TEXT NOT NULL, resource_id TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL,
 FOREIGN KEY(organisation_id,actor_id) REFERENCES users(organisation_id,id)
);
CREATE TRIGGER IF NOT EXISTS immutable_audit_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT,'Audit is immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_audit_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT,'Audit is immutable'); END;
CREATE TABLE IF NOT EXISTS idempotency (
 actor_id TEXT NOT NULL REFERENCES users(id), key TEXT NOT NULL, request_hash TEXT NOT NULL,
 response_json TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(actor_id,key)
);
CREATE TABLE IF NOT EXISTS outbox (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id),
 topic TEXT NOT NULL, resource_id TEXT NOT NULL, created_at TEXT NOT NULL, delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS freight (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL REFERENCES organisations(id), job_id TEXT,
 data_json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL,
 UNIQUE(organisation_id,id), FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS freight_packages (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, freight_id TEXT NOT NULL, barcode TEXT NOT NULL,
 count INTEGER NOT NULL CHECK(count>0), length_cm REAL NOT NULL CHECK(length_cm>0),
 width_cm REAL NOT NULL CHECK(width_cm>0), height_cm REAL NOT NULL CHECK(height_cm>0), weight_kg REAL NOT NULL CHECK(weight_kg>=0),
 UNIQUE(organisation_id,barcode), UNIQUE(organisation_id,id),
 FOREIGN KEY(organisation_id,freight_id) REFERENCES freight(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS cargo_documents (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, uploaded_by TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL,
 encrypted_file BLOB NOT NULL, status TEXT NOT NULL, extraction_json TEXT NOT NULL, freight_id TEXT,
 created_at TEXT NOT NULL, FOREIGN KEY(organisation_id,uploaded_by) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,freight_id) REFERENCES freight(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS package_scans (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL, package_id TEXT NOT NULL,
 stage TEXT NOT NULL CHECK(stage IN ('pickup','delivery')), actor_id TEXT NOT NULL, created_at TEXT NOT NULL,
 UNIQUE(package_id,stage), FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,package_id) REFERENCES freight_packages(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS cargo_scan_events (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL, package_id TEXT NOT NULL,
 stage TEXT NOT NULL CHECK(stage IN ('pickup','delivery')), actor_id TEXT NOT NULL, created_at TEXT NOT NULL,
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id),
 FOREIGN KEY(organisation_id,package_id) REFERENCES freight_packages(organisation_id,id)
);
CREATE INDEX IF NOT EXISTS scans_for_job ON cargo_scan_events(job_id,stage,created_at);
CREATE TRIGGER IF NOT EXISTS immutable_scans_update BEFORE UPDATE ON cargo_scan_events BEGIN SELECT RAISE(ABORT,'Scans are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_scans_delete BEFORE DELETE ON cargo_scan_events BEGIN SELECT RAISE(ABORT,'Scans are immutable'); END;
INSERT OR IGNORE INTO cargo_scan_events SELECT * FROM package_scans;
CREATE TABLE IF NOT EXISTS delivery_evidence (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, job_id TEXT NOT NULL UNIQUE, actor_id TEXT NOT NULL,
 recipient TEXT NOT NULL, notes TEXT NOT NULL, encrypted_evidence BLOB NOT NULL, created_at TEXT NOT NULL,
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS messages (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, sender_id TEXT NOT NULL, recipient_id TEXT NOT NULL,
 job_id TEXT, body TEXT NOT NULL, priority TEXT NOT NULL, created_at TEXT NOT NULL, read_at TEXT,
 FOREIGN KEY(organisation_id,sender_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,recipient_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(organisation_id,job_id) REFERENCES jobs(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS shift_declarations (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, driver_id TEXT NOT NULL, declarations_json TEXT NOT NULL,
 created_at TEXT NOT NULL, FOREIGN KEY(organisation_id,driver_id) REFERENCES users(organisation_id,id)
);
CREATE TABLE IF NOT EXISTS shift_end_requests (
 id TEXT PRIMARY KEY, organisation_id TEXT NOT NULL, driver_id TEXT NOT NULL, shift_id TEXT NOT NULL,
 requested_at TEXT NOT NULL, approved_at TEXT, approved_by TEXT,
 FOREIGN KEY(organisation_id,driver_id) REFERENCES users(organisation_id,id),
 FOREIGN KEY(shift_id) REFERENCES shifts(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_end_request ON shift_end_requests(shift_id) WHERE approved_at IS NULL;
CREATE TABLE IF NOT EXISTS driver_positions (
 organisation_id TEXT NOT NULL, driver_id TEXT NOT NULL, latitude REAL NOT NULL,
 longitude REAL NOT NULL, accuracy REAL NOT NULL, sampled_at TEXT NOT NULL, received_at TEXT NOT NULL,
 PRIMARY KEY(organisation_id,driver_id),
 FOREIGN KEY(organisation_id,driver_id) REFERENCES users(organisation_id,id)
);
