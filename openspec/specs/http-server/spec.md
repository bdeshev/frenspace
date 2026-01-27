## ADDED Requirements

### Requirement: Healthcheck endpoint
The system SHALL provide a healthcheck endpoint that responds with a success message when the service is operational.

#### Scenario: Successful healthcheck
- **WHEN** client sends GET request to `/healthcheck`
- **THEN** system responds with HTTP 200 status
- **THEN** response body contains JSON `{"message": "OK"}`

### Requirement: Request and response validation
The system SHALL validate request and response data types using Zod schemas.

#### Scenario: Invalid response structure
- **WHEN** endpoint handler returns data not matching Zod response schema
- **THEN** system logs validation error
- **THEN** system returns HTTP 500 with error message

### Requirement: Error handling middleware
The system SHALL catch unhandled errors and log them with structured logging.

#### Scenario: Unhandled error in handler
- **WHEN** request handler throws an unhandled error
- **THEN** system logs the error using console.error()
- **THEN** system returns HTTP 500 with JSON error body

### Requirement: Not found handling
The system SHALL return 404 status for undefined routes.

#### Scenario: Undefined route requested
- **WHEN** client sends request to non-existent path
- **THEN** system responds with HTTP 404 status
- **THEN** response body contains JSON error message

### Requirement: Graceful shutdown
The system SHALL support graceful shutdown that stops accepting new requests and waits for in-flight requests to complete, with a second signal to force immediate stop.

#### Scenario: First shutdown signal received - graceful exit
- **WHEN** process receives SIGTERM or SIGINT (first time)
- **THEN** system logs shutdown message indicating graceful mode
- **THEN** system stops accepting new requests (calls server.stop())
- **THEN** system waits for all in-flight requests to complete
- **THEN** system logs shutdown complete

#### Scenario: Second shutdown signal received - force immediate exit
- **WHEN** process receives SIGTERM or SIGINT (second time during shutdown)
- **THEN** system logs force stop message
- **THEN** system calls server.stop(true) to force close connections

#### Scenario: First shutdown with no in-flight requests
- **WHEN** process receives SIGTERM or SIGINT (first time)
- **THEN** system logs shutdown message
- **THEN** system stops accepting new requests
- **AND** no in-flight requests exist
- **THEN** system logs shutdown complete

### Requirement: Server control interface
The system SHALL return a server instance that can be stopped programmatically.

#### Scenario: Server instance returned
- **WHEN** server starts successfully
- **THEN** function returns server object with `.stop()` method
- **THEN** calling `.stop()` initiates graceful shutdown

### Requirement: Port configuration
The system SHALL listen on port 3000.

#### Scenario: Server startup
- **WHEN** server initializes
- **THEN** server binds to port 3000
- **THEN** server logs startup message with port number
