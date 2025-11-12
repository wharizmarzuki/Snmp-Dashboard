"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { deviceApi, queryApi } from '@/lib/api';
import { Device, DeviceMetric, InterfaceMetric } from '@/types';

export default function DeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ip = params.ip as string;

  // Fetch device info
  const { data: deviceData } = useQuery<{ data: Device }>({
    queryKey: ['device', ip],
    queryFn: () => deviceApi.getByIp(ip),
    enabled: !!ip,
  });

  // Fetch device metrics (time series)
  const { data: metricsData } = useQuery<{ data: DeviceMetric[] }>({
    queryKey: ['deviceMetrics', ip],
    queryFn: () => queryApi.getDeviceMetrics(ip),
    enabled: !!ip,
  });

  // Fetch device interfaces
  const { data: interfacesData } = useQuery<{ data: InterfaceMetric[] }>({
    queryKey: ['deviceInterfaces', ip],
    queryFn: () => queryApi.getDeviceInterfaces(ip),
    enabled: !!ip,
  });

  const device = deviceData?.data;
  const metrics = metricsData?.data || [];
  const interfaces = interfacesData?.data || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/devices')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Devices
        </Button>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {device?.hostname || 'Loading...'}
        </h2>
      </div>

      {/* Device Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          {device ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hostname</p>
                <p className="text-base">{device.hostname}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="text-base">{device.ip_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                <p className="text-base">{device.vendor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">MAC Address</p>
                <p className="text-base">{device.mac_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge status={device.status} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading device information...</p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* CPU Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>CPU Utilization</CardTitle>
            <CardDescription>Historical CPU usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={metrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu_utilization"
                  stroke="#8884d8"
                  name="CPU %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Memory Utilization</CardTitle>
            <CardDescription>Historical memory usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={metrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="memory_utilization"
                  stroke="#82ca9d"
                  name="Memory %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Interface List */}
      <Card>
        <CardHeader>
          <CardTitle>Network Interfaces</CardTitle>
          <CardDescription>Interface status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {interfaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No interface data available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Octets In</TableHead>
                  <TableHead>Octets Out</TableHead>
                  <TableHead>Discards In</TableHead>
                  <TableHead>Errors In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interfaces.map((iface) => (
                  <TableRow key={iface.if_index}>
                    <TableCell className="font-medium">{iface.if_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={iface.if_status} />
                    </TableCell>
                    <TableCell>{iface.if_in_octets.toLocaleString()}</TableCell>
                    <TableCell>{iface.if_out_octets.toLocaleString()}</TableCell>
                    <TableCell>{iface.if_in_discards}</TableCell>
                    <TableCell>{iface.if_in_errors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
