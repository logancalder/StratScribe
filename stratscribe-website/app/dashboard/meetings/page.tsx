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
import { supabase } from "@/utils/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const router = useRouter();
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current || isLoading || !user?.email) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user data from API
        const uid = user?.id;
        const userResponse = await fetch(`/api/user?uid=${uid}`);
        if(userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        }

        const discordId = userData?.discordID;

        if(!discordId) {
          console.error("Missing discordId. User should link their account.");
        }

        if(!discordId && !uid) {
          console.error("Missing uid and discordId");
        }

        const response = await fetch(`/api/meeting?uid=${uid}&discord_id=${discordId}`);
        console.log("uid: ", uid);
        
        if (response.ok) {
          const data = await response.json();
          setMeetings(data);
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

  useEffect(() => {
    // Filter notes based on search query
    if (notes.length > 0) {
      if (searchQuery.trim() === "") {
        setFilteredNotes(notes);
      } else {
        const filtered = notes.filter(note => 
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredNotes(filtered);
      }
    } else {
      setFilteredNotes([]);
    }
  }, [searchQuery, notes]);

  const handleMeetingSelect = async (meetingID: string) => {
    setSelectedMeeting(meetingID);
    setIsLoading(true);
    setSearchQuery(""); // Reset search when changing meetings
    
    try {
      console.log("meetingID type:", typeof meetingID, "value:", meetingID);
      console.log("Converted meetingID:", Number(meetingID));

      
      const { data: notesData, error: notesError } = await supabase.from('notes')
        .select('*')
        .eq('meetingID', meetingID)
        .order('createdAt', { ascending: false });
      
      if (notesError) {
        console.error("Error fetching notes:", notesError);
        setNotes([]);
        setFilteredNotes([]);
        return;
      }
      
      if (!notesData) {
        console.log("No notes data returned");
        setNotes([]);
        setFilteredNotes([]);
        return;
      }

      console.log("Notes data received:", notesData);
      setNotes(notesData || []);
      setFilteredNotes(notesData || []);
      
    } catch (error) {
      console.error("Error in try-catch:", error);
      setNotes([]);
      setFilteredNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  if (user && !meetings) {
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/meetings"
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all"
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

  // Helper function to highlight search terms
  const highlightSearchTerms = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 text-black px-1 rounded">{part}</span> 
        : part
    );
  };

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
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                  href="/dashboard/meetings"
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all"
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Meetings</h2>
            <Button>New Meeting</Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : meetings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center space-y-3 py-12">
                <div className="rounded-full bg-muted p-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-medium">No meetings yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first meeting to get started
                  </p>
                </div>
                <Button>Create Meeting</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Your Meetings</CardTitle>
                  <CardDescription>
                    Select a meeting to view its notes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {meetings.map((meeting) => (
                      <div 
                        key={meeting.meetingID}
                        className={`p-3 rounded-lg cursor-pointer ${
                          selectedMeeting === meeting.meetingID 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        onClick={() => handleMeetingSelect(meeting.meetingID)}
                      >
                        <div className="font-medium">{meeting.title}</div>
                        <div className="text-sm truncate">
                          {meeting.description || 'No description'}
                        </div>
                        <div className="text-xs mt-1">
                          {formatDate(meeting.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>
                    {selectedMeeting 
                      ? meetings.find(m => m.meetingID === selectedMeeting)?.title || 'Meeting Notes' 
                      : 'Meeting Notes'}
                  </CardTitle>
                  <CardDescription>
                    {selectedMeeting 
                      ? `${notes.length} note${notes.length === 1 ? '' : 's'} for this meeting` 
                      : 'Select a meeting to view notes'}
                  </CardDescription>
                  {selectedMeeting && notes.length > 0 && (
                    <div className="mt-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search notes..."
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                          <button 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            onClick={() => setSearchQuery("")}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {searchQuery && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Found {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!selectedMeeting ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-12">
                      <div className="rounded-full bg-muted p-3">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Select a meeting from the list to view its notes
                        </p>
                      </div>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-3 py-12">
                      <div className="rounded-full bg-muted p-3">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          No notes for this meeting yet
                        </p>
                      </div>
                      <Button>Add Note</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredNotes.length === 0 && searchQuery ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No notes match your search</p>
                        </div>
                      ) : (
                        filteredNotes.map((note) => (
                          <Card key={note.noteID}>
                            <CardContent className="p-4">
                              <div className="whitespace-pre-wrap">
                                {searchQuery ? (
                                  highlightSearchTerms(note.content, searchQuery)
                                ) : (
                                  note.content
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {formatDate(note.createdAt)}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                      <Button className="w-full">Add Note</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
