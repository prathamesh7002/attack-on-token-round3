// Built-in standard food vendor categories in exact required order
export const DEFAULT_CATEGORIES = [
  {
    id: 'ingredients',
    name: 'Ingredients and raw materials',
    shortLabel: 'Raw materials',
    color: '#2B6CB0', // Slate Blue
    icon: 'Package',
  },
  {
    id: 'vegetables',
    name: 'Vegetables and fruits',
    shortLabel: 'Vegetables',
    color: '#2F9E44', // Leaf Green
    icon: 'Apple',
  },
  {
    id: 'oil_spices',
    name: 'Cooking oil and spices',
    shortLabel: 'Oil & Spices',
    color: '#D9480F', // Rust / Amber
    icon: 'Flame',
  },
  {
    id: 'fuel',
    name: 'LPG and fuel',
    shortLabel: 'Gas / Fuel',
    color: '#E8590C', // Orange
    icon: 'Zap',
  },
  {
    id: 'packaging',
    name: 'Packaging materials',
    shortLabel: 'Packaging',
    color: '#7950F2', // Muted Violet
    icon: 'Box',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    shortLabel: 'Transport',
    color: '#0CA678', // Teal
    icon: 'Truck',
  },
  {
    id: 'rent_maintenance',
    name: 'Stall rent and maintenance',
    shortLabel: 'Stall Rent',
    color: '#495057', // Charcoal
    icon: 'Store',
  },
  {
    id: 'cleaning',
    name: 'Cleaning supplies',
    shortLabel: 'Cleaning',
    color: '#1098AD', // Ocean
    icon: 'Sparkles',
  },
  {
    id: 'equipment',
    name: 'Equipment and repairs',
    shortLabel: 'Repairs',
    color: '#D6336C', // Crimson
    icon: 'Wrench',
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    shortLabel: 'Other / Misc',
    color: '#868E96', // Neutral Gray
    icon: 'MoreHorizontal',
  },
];

// Helper to look up a category definition by its exact name or id
export function getCategoryMeta(categoryName) {
  if (!categoryName) return DEFAULT_CATEGORIES[9]; // default to Miscellaneous
  const lower = categoryName.toLowerCase().trim();
  const found = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === lower || c.id.toLowerCase() === lower || c.shortLabel.toLowerCase() === lower
  );
  return found || {
    id: 'custom',
    name: categoryName,
    shortLabel: categoryName,
    color: '#868E96',
    icon: 'Tag',
  };
}
