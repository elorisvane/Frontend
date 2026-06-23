import Home from "./src/pages/home";
import { getHomeMedia } from "./src/data/home";

// Read the latest admin-managed media on every request so home page edits in
// the Atelier dashboard show up immediately.
export const dynamic = "force-dynamic";

export default async function Page() {
  const { sections, gallery } = await getHomeMedia();
  return <Home sections={sections} gallery={gallery} />;
}
