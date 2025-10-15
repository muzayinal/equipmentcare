import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import RecentIssue from "@/components/ecommerce/RecentIssue";

export const metadata: Metadata = {
  title: 'Equipment Care', // Ganti sesuai kebutuhan
  description: 'machine issue for maintenance', // Opsional
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <EcommerceMetrics />

        {/* <MonthlySalesChart /> */}
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentIssue />
      </div>
    </div>
  );
}
