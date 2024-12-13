import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import SessionProviderWrapper from "@/components/Providers/SessionProviderWrapper";
import { getSession } from "next-auth/react";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dublin ERP",
  description: "",
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper session={session}>
          <SidebarProvider>
            <AppSidebar />
            <main>
              <Navbar />

              {children}
              <Toaster />
            </main>
          </SidebarProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
