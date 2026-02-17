// types/index.ts
export interface Link {
    id?: string; // Optional for new links before being saved
    title: string;
    url: string;
}

export interface Profile {
    public_link: string;
    display_name: string;
    bio: string;
    avatar: string;
    // Optional theme colors for appearance preview
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
}