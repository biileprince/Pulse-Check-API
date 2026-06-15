# Pulse-Check-API ("Watchdog" Sentinel)

A Dead Man's Switch API backend service. Devices register a monitor with a countdown timer. If the device fails to send a heartbeat ping before the timer runs out, the system automatically triggers an alert.

## 1. Architecture Diagrams

### Sequence Diagram
Shows the interaction flow for all API operations.

![Sequence Diagram](docs/sequence-diagram.png)

### State Flowchart
Shows the lifecycle states of a monitor.

![State Flowchart](docs/state-diagram.png)

## 2. Setup Instructions

### Prerequisites
- Node.js (v24+)
- pnpm (v10+)

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Pulse-Check-API
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the Application
- **Development Mode** (auto-reloads on changes):
  ```bash
  pnpm dev
  ```
- **Production Build**:
  ```bash
  pnpm build
  pnpm start
  ```
- **Run Tests**:
  ```bash
  pnpm test
  ```

## 3. API Documentation

### Register a Monitor
`POST /monitors`
- **Body**: `{"id": "device-123", "timeout": 60, "alert_email": "admin@critmon.com"}`
- **Response** (201): Confirmation message and monitor object. Starts the timer.

### Send a Heartbeat
`POST /monitors/:id/heartbeat`
- **Response** (200): Resets the timer. If the monitor was paused or down, it becomes active again.

### Pause a Monitor (Snooze)
`POST /monitors/:id/pause`
- **Response** (200): Pauses the countdown timer. No alerts will fire. Sending a heartbeat resumes it.

### Get All Monitors
`GET /monitors`
- **Response** (200): List of all registered monitors.

### Get a Specific Monitor
`GET /monitors/:id`
- **Response** (200): Details of a specific monitor.

### Delete a Monitor
`DELETE /monitors/:id`
- **Response** (200): Removes the monitor and clears its timer.

### Alert Trigger
*Internal Mechanism:* When a timer expires (reaches 0), the system logs a JSON alert to the console and changes the monitor's status to `down`.

## 4. The Developer's Choice

**Feature:** Alert History and System Health Dashboard API

**Why I added it:**
CritMon doesn't just need real-time alerts; they need to investigate incidents after the fact. A device might go down and recover multiple times in a day. 
I added:
1. `GET /monitors/:id/alerts` - Returns a history of all alert events for a specific device.
2. `GET /stats` - Returns a high-level system summary (total monitors, active vs down vs paused, total historical alerts).

This makes the system much more robust for operations and support engineers to review past behavior, not just current state.

**Design Decisions:**
- Kept things simple and readable, using in-memory stores (Maps/Arrays) to avoid over-engineering with a database, as appropriate for the scope of this challenge.
- Used a clean, layered architecture (Routes -> Controllers -> Services -> Store) to enforce separation of concerns and maintainability.
