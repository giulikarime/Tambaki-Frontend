export const TAG_COLORS = [
    { name: 'Vermelho', shades: ['#ff8888ff', '#ef4444', '#991b1b'] },
    { name: 'Laranja', shades: ['#ffa653ff', '#f97316', '#a12800ff'] },
    { name: 'Amarelo', shades: ['#ffe460ff', '#ffbf00ff', '#b35f00ff'] },
    { name: 'Verde', shades: ['#A3C9A8', '#22c55e', '#2E4D3D'] },
    { name: 'Ciano', shades: ['#29ADB2', '#06b6d4', '#155e75'] },
    { name: 'Azul', shades: ['#93c5fd', '#3b82f6', '#1e3a8a'] },
    { name: 'Roxo', shades: ['#d8b4fe', '#a855f7', '#581c87'] },
    { name: 'Rosa', shades: ['#ff79a1ff', '#e42270ff', '#6B0F3C'] },
];

// lista simples, usada para validar no submit
export const ALLOWED_COLORS = TAG_COLORS.flatMap((g) => g.shades);