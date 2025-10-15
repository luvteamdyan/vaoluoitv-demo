// Helper function to get dates
const getDates = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  return {
    yesterday: formatDate(yesterday),
    today: formatDate(today),
    tomorrow: formatDate(tomorrow)
  };
};

const dates = getDates();

// Test data cho matches - sau này sẽ được thay thế bằng API call
export const matchesTestData = [
  // HÔM QUA - 9/12/2024 (Kết thúc)
  {
    matchStatus: "Kết thúc",
    matchTime: `14:30 - ${dates.yesterday}`,
    leagueName: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 2,
    awayScore: 1,
    homeStats: {
      corners: 6,
      yellowCards: 2,
      redCards: 0,
    },
    awayStats: {
      corners: 4,
      yellowCards: 3,
      redCards: 0,
    },
  },
  {
    matchStatus: "Kết thúc",
    matchTime: `17:00 - ${dates.yesterday}`,
    leagueName: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 3,
    awayScore: 2,
    homeStats: {
      corners: 8,
      yellowCards: 4,
      redCards: 1,
    },
    awayStats: {
      corners: 5,
      yellowCards: 2,
      redCards: 0,
    },
  },
  {
    matchStatus: "Kết thúc",
    matchTime: `19:30 - ${dates.yesterday}`,
    leagueName: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 1,
    awayScore: 1,
    homeStats: {
      corners: 5,
      yellowCards: 3,
      redCards: 0,
    },
    awayStats: {
      corners: 7,
      yellowCards: 2,
      redCards: 0,
    },
  },
  {
    matchStatus: "Kết thúc",
    matchTime: `21:00 - ${dates.yesterday}`,
    leagueName: "Bundesliga",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 4,
    awayScore: 0,
    homeStats: {
      corners: 9,
      yellowCards: 1,
      redCards: 0,
    },
    awayStats: {
      corners: 3,
      yellowCards: 4,
      redCards: 1,
    },
  },

  // HÔM NAY - 10/12/2024 (Trực tiếp + Sắp diễn ra)
  {
    matchStatus: "Trực tiếp",
    matchTime: `12:30 - ${dates.today}`,
    leagueName: "Premier League",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 1,
    awayScore: 1,
    homeStats: {
      corners: 4,
      yellowCards: 2,
      redCards: 0,
    },
    awayStats: {
      corners: 6,
      yellowCards: 1,
      redCards: 0,
    },
  },
  {
    matchStatus: "Trực tiếp",
    matchTime: `15:00 - ${dates.today}`,
    leagueName: "V League",
    homeTeam: "Hà Nội FC",
    awayTeam: "Hoàng Anh Gia Lai",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 2,
    awayScore: 1,
    homeStats: {
      corners: 5,
      yellowCards: 2,
      redCards: 0,
    },
    awayStats: {
      corners: 3,
      yellowCards: 1,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `18:00 - ${dates.today}`,
    leagueName: "Champions League",
    homeTeam: "Manchester City",
    awayTeam: "Arsenal",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `20:30 - ${dates.today}`,
    leagueName: "Ligue 1",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Trực tiếp",
    matchTime: `16:15 - ${dates.today}`,
    leagueName: "La Liga",
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 1,
    awayScore: 0,
    homeStats: {
      corners: 3,
      yellowCards: 1,
      redCards: 0,
    },
    awayStats: {
      corners: 5,
      yellowCards: 2,
      redCards: 0,
    },
  },

  // NGÀY MAI - 11/12/2024 (Sắp diễn ra)
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `14:00 - ${dates.tomorrow}`,
    leagueName: "Premier League",
    homeTeam: "Tottenham",
    awayTeam: "Newcastle",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `16:30 - ${dates.tomorrow}`,
    leagueName: "Serie A",
    homeTeam: "Inter Milan",
    awayTeam: "Napoli",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `19:00 - ${dates.tomorrow}`,
    leagueName: "Bundesliga",
    homeTeam: "RB Leipzig",
    awayTeam: "Bayer Leverkusen",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `21:15 - ${dates.tomorrow}`,
    leagueName: "Europa League",
    homeTeam: "AS Roma",
    awayTeam: "Brighton",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
  {
    matchStatus: "Sắp diễn ra",
    matchTime: `17:45 - ${dates.tomorrow}`,
    leagueName: "Ligue 1",
    homeTeam: "Lyon",
    awayTeam: "Monaco",
    homeTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    awayTeamLogo: "https://img.icons8.com/color/48/real-madrid.png",
    homeScore: 0,
    awayScore: 0,
    homeStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayStats: {
      corners: 0,
      yellowCards: 0,
      redCards: 0,
    },
  },
];
