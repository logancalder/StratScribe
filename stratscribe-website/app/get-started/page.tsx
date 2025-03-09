"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Check } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function GetStartedPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = {
    free: {
      name: "Free",
      description: "For casual teams just getting started",
      price: { monthly: 0, annually: 0 },
      features: [
        "Up to 5 hours of recording per month",
        "Basic meeting summaries",
        "7-day storage retention",
        "Discord integration",
      ],
      cta: "Get Started",
      popular: false,
    },
    pro: {
      name: "Pro",
      description: "For serious teams looking to improve",
      price: { monthly: 20, annually: 192 },
      features: [
        "Up to 30 hours of recording per month",
        "Advanced meeting summaries",
        "30-day storage retention",
        "Basic VOD analysis",
        "Priority support",
      ],
      cta: "Get Started",
      popular: true,
    },
    team: {
      name: "Team",
      description: "For competitive teams and organizations",
      price: { monthly: 50, annually: 480 },
      features: [
        "Unlimited recording hours",
        "Premium meeting summaries with action items",
        "90-day storage retention",
        "Advanced VOD analysis with insights",
        "Dedicated support manager",
        "Custom branding options",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/transparent_logo.png" 
              alt="StratScribe Logo" 
              width={20} 
              height={20} 
              className="h-5 w-auto"
            />
            <span className="inline-block font-bold">StratScribe</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Choose Your Plan
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Select the plan that best fits your team's needs and start
                  improving your gameplay today.
                </p>
              </div>

              <Tabs defaultValue="monthly" className="w-full max-w-md">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="monthly"
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="annually"
                    onClick={() => setBillingCycle("annually")}
                  >
                    Annually{" "}
                    <span className="ml-1.5 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                      Save 20%
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-8 md:grid-cols-3 lg:gap-8">
              {Object.entries(plans).map(([key, plan]) => (
                <Card
                  key={key}
                  className={`relative flex flex-col ${
                    plan.popular ? "border-primary shadow-md" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-4 top-0 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline text-5xl font-bold">
                      ${plan.price[billingCycle as keyof typeof plan.price]}
                      <span className="ml-1 text-sm font-medium text-muted-foreground">
                        {billingCycle === "annually" && plan.price.annually > 0
                          ? "/year"
                          : plan.price[billingCycle as keyof typeof plan.price] > 0
                          ? "/month"
                          : ""}
                      </span>
                    </div>
                    {billingCycle === "annually" && plan.price.annually > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Billed annually (20% off)
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href={key === "team" ? "/contact" : "/login"}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold">Need a custom solution?</h2>
              <p className="mt-2 text-muted-foreground">
                We offer custom enterprise plans for larger organizations with
                multiple teams.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/contact">Contact Our Sales Team</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
