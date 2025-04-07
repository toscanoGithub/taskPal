

export interface User {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[]
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    isFamilyMember: boolean;
    members?: FamilyMember[]
}

export interface FamilyMember {
    name: string;
    passcode: string;
    email?: string;
}




export interface Parent {
    id: string;
    name: string;
    email: string;
    members?: FamilyMember[]
}


