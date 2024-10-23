// app/page.tsx

import HomePageContent from "./components/HomePage";
import SessionProviderWrapper from "./SessionProviderWrapper";

export default function HomePage() {
  return (
    <SessionProviderWrapper>
      <HomePageContent />
    </SessionProviderWrapper>
  );
}
