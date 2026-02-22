// types/index.ts
export interface Link {
    id: string;
    public_id?: string;
    title: string;
    url: string;
    order_index?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Profile {
    id?: string;
    user_id?: string;
    public_link: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    theme_id?: string;
    background_color?: string;
    text_color?: string;
    button_color?: string;
    avatar_radius?: number;
    button_radius?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Theme {
    id: string;
    name: string;
}

export interface LinkClick {
    id?: number;
    link_id?: number;
    ip?: string;
    created_at?: string;
}