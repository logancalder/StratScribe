"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Users,
  LogOut,
  Calendar,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClientComponentClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [envError, setEnvError] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current || isLoading || !user?.id) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Check if environment variables are set
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setEnvError(true);
          return;
        }
        
        // Get Discord ID from user metadata
        const discordId = user?.user_metadata?.sub || user?.user_metadata?.provider_id;
        const uid = user?.id;

        // Make sure we have both uid and discordId
        if (!uid || !discordId) {
          console.error("Missing uid or discordId");
          return;
        }
        
        // Fetch user data from API using both IDs
        const response = await fetch(`/api/user?uid=${uid}&discord_id=${discordId}`);
        console.log("Fetching with uid:", uid, "and discordId:", discordId);
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          dataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isLoading]);

  const handleSignOut = () => {
    signOut();
  };

  if (!loading && !user) {
    router.push('/login');
  }

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (user && !userData) {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image 
                  src="/transparent_logo.png" 
                  alt="StratScribe Logo" 
                  width={20} 
                  height={20} 
                  className="h-5 w-auto"
                />
                <span className="">StratScribe</span>
              </Link>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Package className="h-4 w-4" />
                  Meetings
                </Link>
                <Link
                  href="/dashboard/analysis"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LineChart className="h-4 w-4" />
                  Analysis
                </Link>
                <Link
                  href="/dashboard/team"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  Team
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
            <Link href="#" className="lg:hidden">
              <Image 
                src="/transparent_logo.png" 
                alt="StratScribe Logo" 
                width={20} 
                height={20} 
                className="h-5 w-auto"
              />
              <span className="sr-only">Home</span>
            </Link>
            <div className="w-full flex-1">
              <h1 className="font-semibold text-lg">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Hello, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'}!</p>
            </div>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <span className="flex h-full w-full items-center justify-center bg-muted rounded-full">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </span>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading your data...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image 
                src="/transparent_logo.png" 
                alt="StratScribe Logo" 
                width={20} 
                height={20} 
                className="h-5 w-auto"
              />
              <span className="">StratScribe</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/meetings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Calendar className="h-4 w-4" />
                Meetings
              </Link>
              <Link
                href="/dashboard/analysis"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Analysis
              </Link>
              <Link
                href="/dashboard/team"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Team
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
          <Link href="#" className="lg:hidden">
            <Image 
              src="/transparent_logo.png" 
              alt="StratScribe Logo" 
              width={20} 
              height={20} 
              className="h-5 w-auto"
            />
            <span className="sr-only">Home</span>
          </Link>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <span className="flex h-full w-full items-center justify-center bg-muted rounded-full">
                    <img src={user?.user_metadata.picture} alt="User Profile" className="h-full w-full rounded-full" />
                  </span>
                </span>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <h2 className="text-3xl font-bold ">
            Hello, <span className="text-primary font-bold">{user?.user_metadata?.name 
              ? user.user_metadata.name.split('#')[0] 
              : user?.email?.split('@')[0] || 'there'}</span>! Ready to start recording?
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Recordings
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.totalRecordings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {userData?.totalRecordings ? `${userData.totalRecordings} recordings` : "No recordings yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recording Hours
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData?.monthlySeconds || 0}h</div>
                <p className="text-xs text-muted-foreground">
                  {userData?.plan === "Free" 
                    ? `${Math.round((userData?.monthlySeconds || 0) / 5 * 100)}% of your monthly limit`
                    : userData?.plan === "Pro" 
                      ? `${Math.round((userData?.monthlySeconds || 0) / 30 * 100)}% of your monthly limit`
                      : "Unlimited plan"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">Just you so far</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Plan
                </CardTitle>
                <Image 
                  src="/transparent_logo.png" 
                  alt="StratScribe Logo" 
                  width={26} 
                  height={26} 
                  className="h-7 w-auto text-muted-foreground"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userData?.plan ? userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1) : "Free"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userData?.plan !== "team" && (
                    <>
                      <Link href="/get-started" className="text-primary">
                        Upgrade
                      </Link>{" "}
                      for more features
                    </>
                  )}
                  {userData?.plan === "team" && "Enterprise plan"}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Follow these steps to set up StratScribe for your team
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Add StratScribe to Discord
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Invite the StratScribe bot to your Discord server
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Button>Add to Discord</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Connect to Voice Channel
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Join a voice channel and activate StratScribe before your
                      scrim
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Button variant="outline">View Guide</Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    3
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Invite Team Members
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add your teammates to access recordings and analysis
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Button variant="outline">Invite Team</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent recordings and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-3 py-6">
                  <div className="rounded-full bg-muted p-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-medium">No recordings yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your recordings will appear here once you start using
                      StratScribe
                    </p>
                  </div>
                  <Button>Start Recording</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
