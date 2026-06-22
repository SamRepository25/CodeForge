import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash, Bookmark, Heart, Eye, LogOut, Settings, ShieldCheck } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CodeForge" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ display_name?: string | null; username?: string | null; bio?: string | null; github_url?: string | null; linkedin_url?: string | null; website_url?: string | null }>({});
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => data && setProfile(data));
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      setIsAdmin((data ?? []).some((r) => r.role === "admin"));
    });
  }, [user]);

  const posts = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("author_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const bookmarks = useQuery({
    queryKey: ["my-bookmarks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bookmarks").select("post_id, posts(id,slug,title,excerpt,reading_time,category)").eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    posts: posts.data?.length ?? 0,
    published: posts.data?.filter((p) => p.published).length ?? 0,
    views: posts.data?.reduce((a, b) => a + (b.views ?? 0), 0) ?? 0,
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    posts.refetch();
  };

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      display_name: String(f.get("display_name") ?? ""),
      username: String(f.get("username") ?? ""),
      bio: String(f.get("bio") ?? ""),
      github_url: String(f.get("github_url") ?? ""),
      linkedin_url: String(f.get("linkedin_url") ?? ""),
      website_url: String(f.get("website_url") ?? ""),
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user!.id);
    if (error) return toast.error(error.message);
    setProfile(payload);
    toast.success("Profile saved");
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-electric">Dashboard</div>
            <h1 className="mt-2 font-display text-4xl font-bold">Welcome back{profile.display_name ? `, ${profile.display_name}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/admin"><ShieldCheck className="mr-1.5 h-4 w-4" />Admin</Link>
              </Button>
            )}
            <Button onClick={() => signOut().then(() => location.assign("/"))} variant="outline" className="rounded-xl">
              <LogOut className="mr-1.5 h-4 w-4" />Sign out
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { l: "Total posts", v: stats.posts },
            { l: "Published", v: stats.published },
            { l: "Total views", v: stats.views },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">{s.l}</div>
              <div className="mt-1 font-display text-3xl font-bold gradient-text">{s.v}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="posts" className="mt-10">
          <TabsList>
            <TabsTrigger value="posts">My posts</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-1.5 h-3 w-3" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Button asChild className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">
                <Link to="/dashboard/new"><Plus className="mr-1.5 h-4 w-4" />New post</Link>
              </Button>
            </div>
            <div className="glass divide-y divide-border/40 rounded-2xl">
              {(posts.data ?? []).length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No posts yet. Create your first article.</div>}
              {(posts.data ?? []).map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {p.published ? <span className="text-electric">Published</span> : "Draft"} · <Eye className="ml-1 inline h-3 w-3" /> {p.views} views
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.published && <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-xs text-electric">View</Link>}
                    <Button asChild size="sm" variant="outline" className="rounded-lg">
                      <Link to="/dashboard/edit/$id" params={{ id: p.id }}><Edit className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button onClick={() => deletePost(p.id)} size="sm" variant="outline" className="rounded-lg text-destructive">
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(bookmarks.data ?? []).length === 0 && <div className="glass md:col-span-2 lg:col-span-3 rounded-2xl p-10 text-center text-sm text-muted-foreground">No bookmarks yet. <Link to="/blog" className="text-electric">Browse the blog</Link></div>}
              {(bookmarks.data ?? []).map((b) => b.posts && (
                <Link key={b.post_id} to="/blog/$slug" params={{ slug: b.posts.slug }} className="glass block rounded-2xl p-5 transition hover:-translate-y-0.5">
                  <div className="text-[10px] uppercase tracking-wider text-electric">{b.posts.category}</div>
                  <h3 className="mt-1 font-semibold"><Bookmark className="mr-1 inline h-3 w-3 fill-electric text-electric" />{b.posts.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.posts.excerpt}</p>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <form onSubmit={saveProfile} className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold">Profile settings</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <FormField name="display_name" label="Display name" defaultValue={profile.display_name ?? ""} />
                <FormField name="username" label="Username" defaultValue={profile.username ?? ""} />
                <FormField name="github_url" label="GitHub URL" defaultValue={profile.github_url ?? ""} />
                <FormField name="linkedin_url" label="LinkedIn URL" defaultValue={profile.linkedin_url ?? ""} />
                <FormField name="website_url" label="Website URL" defaultValue={profile.website_url ?? ""} className="md:col-span-2" />
                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-xs">Bio</Label>
                  <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} className="mt-1.5 rounded-xl" rows={3} maxLength={500} />
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet to-electric text-white">Save changes</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function FormField({ name, label, defaultValue, className }: { name: string; label: string; defaultValue?: string; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} className="mt-1.5 rounded-xl" />
    </div>
  );
}
