"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/types";

type User = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
};

export default function UserClient() {
  const { username } = useParams<{ username: string }>();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, avatar_url")
        .eq("username", username)
        .single();

      if (error || !data) {
        setUser(null);
        setLinks([]);
        setLoading(false);
        return;
      }

      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url")
        .eq("user_id", data.id);

      setUser(data);
      setLinks(linksData ?? []);
      setLoading(false);
    };

    fetchUser();
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1>{user.display_name}</h1>
      <p>{user.bio}</p>
      <img src={user.avatar_url} alt={user.username} />

      <h2>Links</h2>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.url}>{link.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
