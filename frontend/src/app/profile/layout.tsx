import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Brew ATL",
  description: "Your profile, favorites, and reviews",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
