"use client";

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { queryApi, deviceApi } from '@/lib/api';
import { Alert } from '@/types';

export default function AlertsPage() {
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery<{ data: Alert[] }>({
    queryKey: ['activeAlerts'],
    queryFn: () => queryApi.getActiveAlerts(),
  });

  const alerts = alertsData?.data || [];

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ ip, metric }: { ip: string; metric: string }) => {
      // The API endpoint would be something like PUT /device/{ip}/alert/{metric}
      // For now, we'll assume the threshold endpoints also handle acknowledgment
      if (metric.toLowerCase() === 'cpu') {
        return deviceApi.updateCpuThreshold(ip, 0); // Mock acknowledgment
      } else if (metric.toLowerCase() === 'memory') {
        return deviceApi.updateMemoryThreshold(ip, 0); // Mock acknowledgment
      }
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeAlerts'] });
    },
  });

  const handleAcknowledge = (ip: string, metric: string) => {
    acknowledgeMutation.mutate({ ip, metric });
  };

  const getSeverityColor = (currentValue: number, threshold: number) => {
    const percentage = (currentValue / threshold) * 100;
    if (percentage >= 150) return 'destructive';
    if (percentage >= 120) return 'warning';
    return 'default';
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Alerts</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            Devices and interfaces currently in alert state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active alerts</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {alert.device_hostname}
                    </TableCell>
                    <TableCell>{alert.device_ip}</TableCell>
                    <TableCell>{alert.metric}</TableCell>
                    <TableCell>{alert.current_value}%</TableCell>
                    <TableCell>{alert.threshold}%</TableCell>
                    <TableCell>
                      <Badge
                        variant={getSeverityColor(
                          alert.current_value,
                          alert.threshold
                        )}
                      >
                        {alert.current_value >= alert.threshold * 1.5
                          ? 'Critical'
                          : alert.current_value >= alert.threshold * 1.2
                          ? 'High'
                          : 'Warning'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleAcknowledge(alert.device_ip, alert.metric)
                        }
                        disabled={acknowledgeMutation.isPending}
                      >
                        Acknowledge
                      </Button>
                    </TableCell>
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
