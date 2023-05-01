
export function useLoginContext() {
    return {
        user: {
            getBasicProfile: () => {
                return {
                    getEmail: () => 'test.email@test.com',
                    getName: () => 'Test User',
                    email: 'test.email@test.com'
                }
            }
        }
    };
}

export function useAdminEmail (): string {
    const {user} = useLoginContext();
    if (user) {
        const profile = user.getBasicProfile();
        if (profile) {
            const email = profile.getEmail();
            if (email) {
                return email;
            }
        }
    }
    return '';
}

export function useAdminId (): string {
    const {user} = useLoginContext();
    if (user) {
        const email = user.getBasicProfile().getEmail();
        if (email) {
            return email.split('@')[0];
        }
    }
    return '';
}

export function useAdminName (): string {
    const {user} = useLoginContext();
    if (user) {
        const profile = user.getBasicProfile();
        if (profile) {
            const name = profile.getName();
            if (name) {
                return name;
            }
        }
    }
    return '';
}
