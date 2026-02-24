"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LeadsChart,
  StatusPieChart,
  ScoresBarChart,
  ChartLegend,
} from "@/components/admin/charts";

interface DashboardChartsProps {
  leadsChartData: { date: string; leads: number }[];
  statusChartData: { name: string; value: number }[];
  scoresChartData: { name: string; value: number }[];
}

const STATUS_COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444"];

export function DashboardCharts({
  leadsChartData,
  statusChartData,
  scoresChartData,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Gráfico de Leads por Dia */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Leads nos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsChartData.length > 0 ? (
            <LeadsChart data={leadsChartData} />
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status dos Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {statusChartData.length > 0 ? (
            <>
              <StatusPieChart data={statusChartData} />
              <ChartLegend
                items={statusChartData.map((item, index) => ({
                  color: STATUS_COLORS[index % STATUS_COLORS.length],
                  label: item.name,
                  value: item.value,
                }))}
              />
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Nenhum lead ainda
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Scores */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-2xl mx-auto">
            <ScoresBarChart data={scoresChartData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
