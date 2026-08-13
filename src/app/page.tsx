import { Hero } from "@/components/home/Hero";
import { ScenicJourney } from "@/components/home/ScenicJourney";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { NewArrivalsRail } from "@/components/home/NewArrivalsRail";
import { Manifesto } from "@/components/home/Manifesto";
import { BrandAtlas } from "@/components/home/BrandAtlas";
import { ToolsBand } from "@/components/home/ToolsBand";
import { ShowroomBand } from "@/components/home/ShowroomBand";
import { JournalStrip } from "@/components/home/JournalStrip";
import { ClosingCTA } from "@/components/home/ClosingCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ScenicJourney />
      <BrandMarquee />
      <FeaturedWork />
      <NewArrivalsRail />
      <Manifesto />
      <BrandAtlas />
      <ToolsBand />
      <ShowroomBand />
      <JournalStrip />
      <ClosingCTA />
    </>
  );
}
