"use client";

import React from "react";

import Topbar from "@/components/Topbar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen bg-[#F8FAFC]">
			<div className="flex-1 flex flex-col">
				<AdminHeader mode="admin" />
				<Topbar mode="admin" />
				<main className="flex-1 overflow-auto p-8">{children}</main>
			</div>
		</div>
	);
}
