# SNMP Monitoring System - Frontend Requirements

This document outlines the pages, components, and data requirements for the React frontend.  
All components will be built using **React** and **Recharts** for visualization.

---

## 🧩 Assumed Backend API Endpoints

This guide assumes the following API endpoints will be available (as discussed in the backend plan):

### Devices

- `GET /device/`
- `GET /device/{ip}`

### Configuration (Admin)

- `GET /config/recipients/`
- `POST /config/recipients/`
- `DELETE /config/recipients/{email}`
- `PUT /device/{ip}/threshold/cpu`
- `PUT /device/{ip}/threshold/memory`
- `PUT /device/{ip}/interface/{if_index}/threshold`

### Discovery

- `GET /device/discover` — Manual trigger

### Data Querying (via `query.py`)

- `GET /query/network-summary`
- `GET /query/top-devices`
- `GET /query/device/{ip}/metrics`
- `GET /query/device/{ip}/interfaces`
- `GET /query/history/device?ip=...&start=...&end=...`
- `GET /query/alerts/active`

---

## 1. Page: Dashboard

**Route:** `/`  
**Purpose:** Provide an “at-a-glance” summary of the entire network's health.

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **KPI Cards** | 3–4× StatisticCard | `GET /query/network-summary` | Displays:<br>• Total Devices<br>• Devices Up<br>• Devices in Alert |
| **Devices in Alert** | Table | `GET /query/alerts/active` | Columns: Hostname, Metric (e.g. “CPU”, “Interface Down”), Current Value |
| **Top 5 CPU Devices** | Bar Chart (Recharts) | `GET /query/top-devices?metric=cpu` | Horizontal bar chart<br>Y-axis: `device.hostname`<br>X-axis: `cpu_utilization` |
| **Top 5 Memory Devices** | Bar Chart (Recharts) | `GET /query/top-devices?metric=memory` | Horizontal bar chart<br>Y-axis: `device.hostname`<br>X-axis: `memory_utilization` |
| **Network Throughput** | Area Chart (Recharts) | `GET /query/network-throughput` | Time-series chart<br>Data Shape: `[ {timestamp: "...", inbound_bps: 123, outbound_bps: 456} ]` |

---

## 2. Page: Devices

**Routes:** `/devices` and `/devices/:ip`  
**Purpose:** List all monitored devices and allow an admin to drill down for detailed metrics.

### 2.1. Main View (`/devices`)

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **Device List** | Table (Clickable Rows) | `GET /device/` | Columns:<br>• Status (Green/Red dot)<br>• Hostname<br>• IP Address<br>• Vendor<br>Action: clicking row navigates to `/devices/{device.ip_address}` |

### 2.2. Detail View (`/devices/:ip`)

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **Device Info Card** | Card | `GET /device/{ip}` | Displays static info:<br>• Hostname<br>• IP Address<br>• Vendor<br>• MAC Address |
| **CPU Utilization** | Line Chart (Recharts) | `GET /query/device/{ip}/metrics` | Time-series of `cpu_utilization`<br>Data Shape: `[ {timestamp: "...", cpu_utilization: 25.5} ]` |
| **Memory Utilization** | Line Chart (Recharts) | `GET /query/device/{ip}/metrics` | Time-series of `memory_utilization`<br>Data Shape: `[ {timestamp: "...", memory_utilization: 40.1} ]` |
| **Interface List** | Table | `GET /query/device/{ip}/interfaces` | Columns:<br>• Name (e.g. “Gi0/1”)<br>• Status (Up/Down)<br>• Octets In/Out<br>• Discards In<br>• Errors In |

---

## 3. Page: Alerts

**Route:** `/alerts`  
**Purpose:** Display all devices and interfaces currently in an alert state.

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **Active Alerts** | Table | `GET /query/alerts/active` | Columns:<br>• Device<br>• Metric (e.g. “CPU”, “Interface Down”)<br>• Current Value<br>• Threshold<br>• Ack (Button) |
| **Acknowledge Button** | Button (in Table) | `PUT /device/{ip}/alert/cpu`<br>`PUT /device/{ip}/alert/memory` | Manually resets `alert_sent=false` for the alert, muting it until recovery. |

---

## 4. Page: Report

**Route:** `/report`  
**Purpose:** Simple tool to view and analyze system logs via exportable raw data (no complex PDFs).

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **Report Builder** | Form | N/A | Form fields:<br>1. Device dropdown (`GET /device/`)<br>2. Date/Time range picker<br>3. “Generate” button |
| **Metric Data Table** | Paginated Table | `GET /query/history/device?ip=...&start=...&end=...` | Displays raw metric data from `device_metrics` and `interface_metrics`. |
| **Export Button** | Button | N/A | Exports current table data to CSV using client-side lib (e.g., `react-csv`). |

---

## 5. Page: Settings

**Route:** `/settings`  
**Purpose:** Central hub for admin configuration.

| Component | Type | Data Source (API) | Notes |
|------------|------|------------------|-------|
| **Alert Recipients** | Form + Table | `GET /config/recipients/`<br>`POST /config/recipients/`<br>`DELETE /config/recipients/{email}` | Table lists current emails. Add/Delete functionality for recipient list. |
| **Device Thresholds** | Table | `GET /device/`<br>`PUT /device/{ip}/threshold/cpu`<br>`PUT /device/{ip}/threshold/memory` | Columns:<br>• Hostname<br>• CPU Threshold (input)<br>• Memory Threshold (input)<br>• Save button per row |
| **Interface Thresholds** | Dynamic Table | `GET /query/device/{ip}/interfaces`<br>`PUT /device/{ip}/interface/{if_index}/threshold` | Steps:<br>1. Select device<br>2. Populate interfaces<br>3. Edit “Packet Drop Threshold” and click Save |
| **Discovery** | Button | `GET /device/discover` | Button labeled **“Run Network Discovery Now”** with loading spinner while in progress. |

---

**End of Document**
