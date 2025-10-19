import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiFixture } from './lib/footyApi';

interface MatchCardProps {
  match: ApiFixture;
  vertical?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  vertical = false,
}) => {
  const { fixture, league, teams, goals } = match;
  const date = new Date(fixture.date).toLocaleString();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/match', { state: { match } });
  };

  const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(fixture.status.short);
  const isFinished = ['FT', 'AET', 'PEN'].includes(fixture.status.short);
  const isCancelled = ['CANC', 'ABD', 'AWD', 'WO'].includes(fixture.status.short);

  return (
    <button
      onClick={handleClick}
      className={`
        glass-card-dark glass-hover-dark glass-glow
        rounded-xl p-4 border border-green-800/30
        transition-all duration-300 cursor-pointer
        hover:border-green-600/50 hover:scale-[1.02]
        active:scale-[0.98] shadow-lg hover:shadow-xl
        ${vertical 
          ? 'w-[200px] h-[220px] ' 
          : 'w-[200px] h-[220px] '
        }
        ${isLive ? 'ring-2 ring-green-500/50 shadow-green-500/20' : ''}
        ${isCancelled ? 'opacity-60' : ''}
      `}
    >
      {/* 3:2 Rectangle Layout */}
      <div className="flex flex-col h-full">
        <div style={{
            marginLeft:"-300px",
            animation: isLive ? 'opacityEase1 1s ease-in-out infinite' : 'none'
            }} className={`
          `}>
        {isLive && '🔴'}
        </div>
     
        {/* Top Section - League Info */}
        <div className="flex items-center justify-center gap-3 mb-4 ">
          <img
            src={league.logo} 
            alt={league.name}
            style={{
                width:"75px",
                height:"75px"
            }}
            className="h-12 w-12 object-contain rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="text-center">
            <div className="text-sm font-medium text-gray-200 truncate max-w-[20px]">
              {league.name}
            </div>
            <div className="text-xs text-gray-400">
              {new Date(fixture.date).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Bottom Section - Match Info */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-3">
            {/* Home Team */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden ring-1 ring-green-800/30 flex items-center justify-center">
                <img 
                style={{
                    width:"70px",
                    height:"70px"
                }}
                  src={teams.home.logo} 
                  alt={teams.home.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
                  }}
                />
              </div>
              <div className="text-left">
                <p   style={{
                    width:"50px",
                    height:"fit"
                }}className="text-xs font-medium text-gray-200 ">
                  {teams.home.name}
                </p>
                {teams.home.winner && (
                  <div className="text-xs text-green-400">👑</div>
                )}
              </div>
            </div>

            {/* Score */}
            <div  style={{
                    width:"80px",
                    height:"80px"
                }} className="flex flex-col items-center">
              <div  style={{
                    marginTop:"20px"
                }}className={`
                text-lg font-bold font-mono
                ${isLive ? 'text-green-400 animate-pulse' : 'text-gray-100'}
                ${isFinished ? 'text-blue-400' : ''}
                ${isCancelled ? 'text-red-400' : ''}
              `}>
                {goals.home ?? '-'} : {goals.away ?? '-'}
              </div>
              {isLive && fixture.status.elapsed && (
                <div className="text-xs text-green-400 mt-1 font-medium">
                  {fixture.status.elapsed}'
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-200 truncate max-w-[80px]">
                  {teams.away.name}
                </p>
                {teams.away.winner && (
                  <div className="text-xs text-green-400">👑</div>
                )}
              </div>
              <div className="w-[12px] h-12 rounded-lg overflow-hidden ring-1 ring-green-800/30 flex items-center justify-center">
                <img 
                 style={{
                    width:"70px",
                    height:"70px"
                }}
                  src={teams.away.logo} 
                  alt={teams.away.name}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMCIgeT0iMTAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex justify-center">
            <span className={`
              text-xs px-3 py-1 rounded-full font-medium
              ${isLive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : isFinished
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : isCancelled
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
              }
            `}>
              {isLive && ' '}
              {fixture.status.long}
            </span>
          </div>

          {/* Additional Info for Live Matches */}
          {isLive && (
            <div className="text-center mt-1">
              <div className="text-xs text-green-400/70 font-medium">
                {league.round}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default MatchCard;
