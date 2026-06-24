import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/AboutPage";

export const Route = createFileRoute("/")({
  component: AboutPage,
});