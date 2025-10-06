import { useEffect } from "react";
import { Portfolio } from "@/components/Portfolio";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  useEffect(() => {
    try {
      toast({ title: "App mounted", description: "The app rendered successfully." });
    } catch (e) {}
  }, []);

  return <Portfolio />;
};

export default Index;