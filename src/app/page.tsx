import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <p>{JSON.stringify(session)}</p>
    </div>
  );
}
