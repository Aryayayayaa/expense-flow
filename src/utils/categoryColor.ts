export function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case "food":
      return "bg-green-100 text-green-700";

    case "travel":
      return "bg-purple-100 text-purple-700";

    case "shopping":
      return "bg-pink-100 text-pink-700";

    case "bills":
      return "bg-orange-100 text-orange-700";

    case "education":
      return "bg-indigo-100 text-indigo-700";

    case "medical":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}