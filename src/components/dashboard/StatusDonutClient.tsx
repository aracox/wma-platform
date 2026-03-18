"use client";
import dynamic from "next/dynamic";

const StatusDonut = dynamic(() => import("./StatusDonut"), { ssr: false });

export default StatusDonut;
