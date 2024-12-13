"use client";
import { DashboardAdmin } from "@/components/DashboardAdmin";
import OrdersByStore from "@/components/OrderByStore";
import { OrderDownloader } from "@/components/OrderDownloader";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { push } = useRouter();
  const [isclient, setIsClient] = useState(null);
  const fetchSession = async () => {
    const session = await getSession();
    session.user.role == "client" && setIsClient(true);
    if (!session) {
      push("/login");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div className="">
      <div className="w-10/12">{isclient && <DashboardAdmin />}</div>
    </div>
  );
}
