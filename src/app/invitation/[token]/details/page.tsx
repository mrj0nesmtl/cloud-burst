import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RsvpDetails } from "../rsvp-details";

export const metadata: Metadata = {
  title: "RSVP Confirmation",
  description: "View your RSVP details and confirmation",
};

interface DetailsPageProps {
  params: {
    token: string;
  };
}

export default function DetailsPage({ params }: DetailsPageProps) {
  if (!params.token) {
    notFound();
  }

  return <RsvpDetails />;
} 