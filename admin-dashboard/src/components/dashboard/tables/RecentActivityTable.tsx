"use client";

import React from "react";
import { Clock, Monitor, Smartphone, Tablet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecentActivity {
  id: string;
  category: string;
  username: string;
  status: "online" | "offline" | "away";
  lastSeen: string;
  device: "desktop" | "mobile" | "tablet";
}

interface RecentActivityTableProps {
  className?: string;
}

export default function RecentActivityTable({ className = "" }: RecentActivityTableProps) {
  // Mock data - sẽ được thay thế bằng dữ liệu thực từ BE
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      category: "Admin",
      username: "admin01",
      status: "online",
      lastSeen: "2 phút trước",
      device: "desktop"
    },
    {
      id: "2",
      category: "User",
      username: "user_phan",
      status: "online",
      lastSeen: "5 phút trước",
      device: "mobile"
    },
    {
      id: "3",
      category: "User",
      username: "nguyen_van_a",
      status: "away",
      lastSeen: "15 phút trước",
      device: "tablet"
    },
    {
      id: "4",
      category: "Moderator",
      username: "mod_team",
      status: "offline",
      lastSeen: "1 giờ trước",
      device: "desktop"
    },
    {
      id: "5",
      category: "User",
      username: "football_fan",
      status: "online",
      lastSeen: "3 phút trước",
      device: "mobile"
    }
  ];

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="h-4 w-4 text-blue-500" />;
      case "mobile":
        return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case "tablet":
        return <Tablet className="h-4 w-4 text-amber-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100">
            Đang hoạt động
          </span>
        );
      case "away":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100">
            Tạm vắng
          </span>
        );
      case "offline":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Ngoại tuyến
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            Không xác định
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Admin":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100">
            Admin
          </span>
        );
      case "Moderator":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100">
            Moderator
          </span>
        );
      case "User":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            User
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {category}
          </span>
        );
    }
  };

  return (
    <Card className={`border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-white/[0.03] h-full flex flex-col ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 font-bold" />
          Hoạt động gần đây
        </CardTitle>
        <CardDescription className="text-muted-foreground/60 font-semibold">
          Danh sách người dùng hoạt động gần đây
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="rounded-md border border-gray-200/15 dark:border-gray-600/20">
          <Table className="[&_tr:not(:last-child)]:border-b [&_tr:not(:last-child)]:border-gray-200/8 [&_tr:not(:last-child)]:dark:border-gray-600/10 [&_thead_tr]:border-b [&_thead_tr]:border-gray-200/8 [&_thead_tr]:dark:border-gray-600/10">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] font-semibold">Danh mục</TableHead>
                <TableHead className="font-semibold">Username</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="w-[120px] font-semibold">Thiết bị</TableHead>
                <TableHead className="w-[100px] font-semibold">Hoạt động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {getCategoryBadge(activity.category)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {activity.username}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(activity.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(activity.device)}
                      <span className="text-sm capitalize">
                        {activity.device === "desktop" ? "Máy tính" : 
                         activity.device === "mobile" ? "Điện thoại" : "Máy tính bảng"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {activity.lastSeen}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
