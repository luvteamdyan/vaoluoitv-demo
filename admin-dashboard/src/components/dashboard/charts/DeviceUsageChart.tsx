"use client";

import React, { useState } from "react";
import { Monitor } from "lucide-react";
import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

interface DeviceUsageChartProps {
  className?: string;
}

export default function DeviceUsageChart({ className = "" }: DeviceUsageChartProps) {
  // State để track hover segment
  const [hoveredSegment, setHoveredSegment] = useState<typeof chartData[0] | null>(null);
  
  // Mock data - sẽ được thay thế bằng dữ liệu thực từ BE
  const chartData = [
    { device: "Desktop", users: 50, fill: "#1e40af" }, // dark blue
    { device: "Mobile", users: 33, fill: "#3b82f6" },   // medium blue  
    { device: "Tablet", users: 17, fill: "#e0e7ff" },  // light blue
  ];

  const chartConfig = {
    users: {
      label: "Người dùng",
    },
    Desktop: {
      label: "Desktop",
      color: "#1e40af",
    },
    Mobile: {
      label: "Mobile", 
      color: "#3b82f6",
    },
    Tablet: {
      label: "Tablet",
      color: "#e0e7ff",
    },
  } satisfies ChartConfig;


  return (
    <Card className={`flex flex-col border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-white/[0.03] h-full ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col items-center justify-center pb-4 px-6 pt-6">
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lượt truy cập theo thiết bị</h3>
          </div>
          <p className="text-sm text-muted-foreground/60 mt-1 text-center font-semibold">
            Phân bố người dùng theo loại thiết bị
          </p>
        </div>
        
        {/* Chart */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative mx-auto aspect-square max-h-[200px] w-full">
            <ChartContainer
              config={chartConfig}
              className="w-full h-full"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="users"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  stroke="0"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      onMouseEnter={() => setHoveredSegment(entry)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-lg font-medium text-white">
                {hoveredSegment ? hoveredSegment.device : "Mobile"}
              </div>
              <div className="text-3xl font-bold text-white">
                {hoveredSegment ? hoveredSegment.users : "65"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex justify-evenly w-full">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-800"></div>
              <span className="text-sm text-muted-foreground font-semibold">Desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-muted-foreground font-semibold">Mobile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-100"></div>
              <span className="text-sm text-muted-foreground font-semibold">Tablet</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
