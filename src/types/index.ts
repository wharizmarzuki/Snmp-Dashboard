// Device types
export interface Device {
  ip_address: string;
  hostname: string;
  vendor: string;
  mac_address: string;
  status: 'up' | 'down';
  cpu_utilization?: number;
  memory_utilization?: number;
  cpu_threshold?: number;
  memory_threshold?: number;
}

// Network summary
export interface NetworkSummary {
  total_devices: number;
  devices_up: number;
  devices_in_alert: number;
}

// Alert types
export interface Alert {
  device_ip: string;
  device_hostname: string;
  metric: string;
  current_value: number;
  threshold: number;
  timestamp?: string;
}

// Metric types
export interface DeviceMetric {
  timestamp: string;
  cpu_utilization?: number;
  memory_utilization?: number;
}

export interface InterfaceMetric {
  if_index: number;
  if_name: string;
  if_status: 'up' | 'down';
  if_in_octets: number;
  if_out_octets: number;
  if_in_discards: number;
  if_in_errors: number;
}

// Top device types
export interface TopDevice {
  hostname: string;
  ip_address: string;
  cpu_utilization?: number;
  memory_utilization?: number;
}

// Throughput types
export interface NetworkThroughput {
  timestamp: string;
  inbound_bps: number;
  outbound_bps: number;
}

// Configuration types
export interface Recipient {
  email: string;
}

// History types
export interface HistoryRecord {
  timestamp: string;
  cpu_utilization?: number;
  memory_utilization?: number;
  [key: string]: any;
}
