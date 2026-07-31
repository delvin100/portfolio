import { cookies } from "next/headers";
import { FilesAuthWrapper } from "@/components/files/files-auth-wrapper";

export const metadata = {
  title: "Files | Protected Area",
  description: "Secure file access.",
};

export default async function FilesPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("files_auth_token")?.value === "authenticated";

  return <FilesAuthWrapper initialAuthenticated={isAuthenticated} />;
}
