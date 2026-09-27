export type Profile = {
    id: string;
    full_name: string;
    date_of_birth: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
};

export type ProfileInput = {
    fullName: string;
    dateOfBirth: string;
    phone?: string;
};
