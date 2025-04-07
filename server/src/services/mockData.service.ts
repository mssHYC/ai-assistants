export function generateMockData() {
    return Array.from({ length: 5 }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      value: Math.random() * 100
    }));
  }