export function getAccessLevel() {
    try {
        const account = JSON.parse(localStorage.getItem('account') || 'null');
        return account?.type === 'user' ? account.access_level : null;
    } catch {
        return null;
    }
}

export function canViewPath(path) {
    const level = getAccessLevel();
    const route = path.split('/').filter(Boolean)[0] || 'home';

    if (route === 'configuration' || route === 'home') return Boolean(level);
    if (level === 'Master') return true;

    const allowedLevels = {
        dashboard: ['Senior'],
        menu: ['Pleno', 'Junior'],
        stock: ['Pleno'],
        suppliers: ['Pleno'],
        users: ['Senior'],
        order_ticket: ['Junior'],
        open_all_tickets: ['Junior'],
        book_table: ['Junior'],
        create_table: ['Junior'],
        menu_ordering: ['Junior'],
        finish_ticket: ['Junior'],
    };

    return allowedLevels[route]?.includes(level) ?? false;
}

export function canEditResource(resource) {
    const level = getAccessLevel();
    if (level === 'Master') return true;

    const editors = {
        users: ['Senior'],
        products: ['Pleno'],
        suppliers: ['Pleno'],
        menu: ['Junior'],
        home: ['Junior'],
    };

    return editors[resource]?.includes(level) ?? false;
}
