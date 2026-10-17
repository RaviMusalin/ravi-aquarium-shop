export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}


export function categoryEmoji(category: string): string {
  switch (category) {
    case "fish":
      return "🐠";
    case "tank":
      return "🫧";
    case "filter":
      return "⚙️";
    case "plant":
      return "🌿";
    case "food":
      return "🍤";
    case "treatment":
      return "🧪";
    default:
      return "🐟";
  }
}