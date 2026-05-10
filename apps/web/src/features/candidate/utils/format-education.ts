export function formatEducationLevel(level?: string | null) {
  const map: Record<string, string> = {
    high_school: 'High school',
    diploma: 'Diploma',
    bachelor: "Bachelor's degree",
    master: "Master's degree",
    phd: 'PhD',
    other: 'Other',
  };
  return level ? map[level] ?? level : null;
}
